import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  CheckCircle2, 
  Info,
  ShieldAlert,
  EyeOff,
  Eye,
  Zap,
  Mic,
  MicOff,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../constants';
import { cn } from '../lib/utils';
import { analyzeIncident, analyzeIncidentImage, transcribeVoice } from '../services/geminiService';

const ReportForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    severity: 'medium',
    latitude: 0,
    longitude: 0,
    address: '',
    is_anonymous: false
  });
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    setIsLocating(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setIsLocating(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enter manually.');
        setIsLocating(false);
      }
    );
  };

  const handleSmartDetect = async () => {
    if (!formData.description) {
      setError('Please provide a description first');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    const result = await analyzeIncident(formData.description);
    if (result) {
      if (result.isFake) {
        setError('Warning: Our AI detected this might be a false or spam report. Please ensure accuracy.');
      }
      setFormData(prev => ({
        ...prev,
        category: result.category,
        severity: result.severity
      }));
    } else {
      setError('AI analysis failed. Please select manually.');
    }
    setIsAnalyzing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        analyzeImage(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzingImage(true);
    const result = await analyzeIncidentImage(base64);
    if (result) {
      setFormData(prev => ({
        ...prev,
        description: prev.description ? `${prev.description}\n\nAI Image Analysis: ${result.description}` : result.description,
        severity: result.severity || prev.severity
      }));
    }
    setIsAnalyzingImage(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsAnalyzing(true);
          const result = await transcribeVoice(base64);
          if (result) {
            setFormData(prev => ({
              ...prev,
              description: result.transcription,
              category: result.category || prev.category,
              severity: result.severity || prev.severity
            }));
          }
          setIsAnalyzing(false);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      setError('Please select an incident category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-primary">Report Submitted</h2>
        <p className="mt-2 text-slate-500 max-w-sm">
          Thank you for helping keep the community safe. Your report is now live on the map and feed.
        </p>
        <p className="mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-0">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary mb-8 transition-colors font-bold text-sm uppercase tracking-widest"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-primary p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold flex items-center gap-4">
              <ShieldAlert className="w-10 h-10 text-accent" />
              Report New Incident
            </h1>
            <p className="text-white/60 mt-2 font-medium">Provide accurate details to help others stay safe in your community.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selection */}
          <section>
            <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em] ml-2">
              1. Select Incident Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {INCIDENT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all gap-3 group",
                      isSelected 
                        ? "bg-accent border-accent text-white shadow-xl shadow-accent/20 scale-[1.02]" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", 
                      isSelected ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Severity Selection */}
          <section>
            <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em] ml-2">
              2. Severity Level
            </label>
            <div className="flex flex-wrap gap-4">
              {SEVERITY_LEVELS.map((sev) => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: sev.id as any })}
                  className={cn(
                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                    formData.severity === sev.id
                      ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                      : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </section>

          {/* Description with Floating Label */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                3. Situation Details
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  {isRecording ? 'Stop' : 'Voice'}
                </button>
                <button
                  type="button"
                  onClick={handleSmartDetect}
                  disabled={isAnalyzing || !formData.description}
                  className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Smart Detect
                </button>
              </div>
            </div>
            <div className="relative group">
              <textarea
                id="description"
                placeholder=" "
                required
                className="floating-label-input min-h-[160px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <label htmlFor="description" className="floating-label">Describe what you witnessed...</label>
            </div>
          </section>

          {/* Location with Floating Label */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                4. Location
              </label>
              <button 
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="text-[10px] font-black text-accent hover:text-accent-dark flex items-center gap-2 disabled:opacity-50 transition-colors uppercase tracking-widest"
              >
                <MapPin className={cn("w-4 h-4", isLocating && "animate-bounce")} />
                {isLocating ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <input
                  id="address"
                  type="text"
                  placeholder=" "
                  className="floating-label-input pr-16"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <label htmlFor="address" className="floating-label">Street address or landmark (optional)</label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-sm">
                    <Info className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GPS Coordinates</p>
                    <p className="text-sm text-white font-mono font-bold">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20"></div>
              </div>
            </div>
          </section>

          {/* Options */}
          <section className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-colors", formData.is_anonymous ? "bg-primary text-white shadow-lg shadow-primary/10" : "bg-slate-100 text-slate-400")}>
                  {formData.is_anonymous ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Report Anonymously</p>
                  <p className="text-xs text-slate-500">Your identity will be hidden from other users.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_anonymous: !formData.is_anonymous })}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                  formData.is_anonymous ? "bg-accent" : "bg-slate-200"
                )}
              >
                <span className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                  formData.is_anonymous ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </section>

          {/* Image Upload */}
          <section>
            <label className="block text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">
              Evidence (Optional)
            </label>
            <div className="flex flex-wrap gap-4">
              {image ? (
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-slate-100 group">
                  <img src={image} alt="Evidence" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-primary hover:bg-white transition-all shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-[8px] font-black uppercase tracking-widest text-center p-2">
                      <Loader2 className="w-5 h-5 animate-spin mb-1" />
                      AI Analyzing...
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all group"
                >
                  <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-accent text-white rounded-3xl font-bold text-lg hover:bg-accent-dark transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldAlert className="w-7 h-7" />
                Submit Safety Report
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] font-bold text-slate-400 px-8 uppercase tracking-widest leading-relaxed">
            By submitting, you confirm that this information is accurate. 
            False reporting is a serious offense and may lead to account suspension.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
