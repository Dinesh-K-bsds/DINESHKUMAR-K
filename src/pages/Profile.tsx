import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Camera,
  Lock,
  Eye,
  Smartphone,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Incident } from '../types';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../constants';
import { formatDistanceToNow } from 'date-fns';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [reports, setReports] = useState<Incident[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');
  
  const [notifData, setNotifData] = useState({
    notif_critical: user?.notif_critical ?? true,
    notif_community: user?.notif_community ?? true,
    notif_weather: user?.notif_weather ?? false,
    notif_reports: user?.notif_reports ?? true
  });

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'reports', label: 'My Reports', icon: Activity },
    { id: 'notifications', label: 'Alert Settings', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => {
    if (activeTab === 'reports' && user) {
      fetchUserReports();
    }
  }, [activeTab, user]);

  const fetchUserReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(`/api/users/${user?.id}/incidents`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus('loading');
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data);
        setUpdateStatus('success');
        setTimeout(() => {
          setIsEditing(false);
          setUpdateStatus('idle');
        }, 1500);
      } else {
        setUpdateStatus('error');
      }
    } catch (error) {
      setUpdateStatus('error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordStatus('loading');
    setPasswordError('');
    try {
      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      if (response.ok) {
        setPasswordStatus('success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordStatus('idle'), 3000);
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to update password');
        setPasswordStatus('error');
      }
    } catch (error) {
      setPasswordStatus('error');
      setPasswordError('An error occurred');
    }
  };

  const handleToggleNotif = async (key: keyof typeof notifData) => {
    const newData = { ...notifData, [key]: !notifData[key] };
    setNotifData(newData);
    try {
      const response = await fetch(`/api/users/${user?.id}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (response.ok) {
        updateUser({ ...user!, ...newData });
      }
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return INCIDENT_CATEGORIES.find(c => c.id === categoryId) || INCIDENT_CATEGORIES[INCIDENT_CATEGORIES.length - 1];
  };

  const getSeverityInfo = (severityId: string) => {
    return SEVERITY_LEVELS.find(s => s.id === severityId) || SEVERITY_LEVELS[0];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 sm:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-primary rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/20 border-4 border-white">
              {user?.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 bg-accent p-3 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform border-4 border-white group-hover:bg-accent-dark">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight">{user?.name}</h1>
            <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              {user?.email}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">Verified Citizen</span>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">Safety Contributor</span>
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100">
                <Shield className="w-3 h-3" />
                Trust Score: {user?.trust_score || 85}%
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="bg-white border-2 border-slate-100 text-slate-400 hover:text-accent hover:border-accent/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between p-6 rounded-[32px] transition-all group",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-2xl shadow-primary/20" 
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    activeTab === tab.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-white"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">{tab.label}</span>
                </div>
                <ChevronRight className={cn("w-5 h-5 transition-transform", activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm min-h-[500px]">
            {activeTab === 'profile' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Personal Information</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-accent font-black uppercase tracking-widest text-xs hover:text-accent-dark transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <input
                          type="email"
                          className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={updateStatus === 'loading'}
                        className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {updateStatus === 'loading' ? 'Updating...' : updateStatus === 'success' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Updated
                          </>
                        ) : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || ''
                          });
                        }}
                        className="bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-primary">{user?.name}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-primary">{user?.email}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-primary">{user?.phone || 'Not provided'}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home Location</label>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-primary flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-accent" />
                          San Francisco, CA
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Sector</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter Credibility</label>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-primary flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          Trusted Reporter Level 4
                        </div>
                        <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[85%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-primary uppercase tracking-tight">My Past Reports</h2>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{reports.length} Total</span>
                </div>

                {isLoadingReports ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse"></div>
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <AlertTriangle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">No reports yet</h3>
                    <p className="text-slate-500 mt-2">Your safety contributions will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const category = getCategoryInfo(report.category);
                      const severity = getSeverityInfo(report.severity);
                      const Icon = category.icon;
                      return (
                        <div key={report.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-accent/20 transition-all group">
                          <div className="flex gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", category.color)}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-black text-primary uppercase tracking-tight text-sm">{category.label}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", severity.color)}>
                                      {severity.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                  report.status === 'active' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>
                                  {report.status}
                                </span>
                              </div>
                              <p className="text-slate-600 text-xs mt-4 leading-relaxed font-medium">{report.description}</p>
                              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                <MapPin className="w-3 h-3" />
                                {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Alert Preferences</h2>
                <div className="space-y-6">
                  {[
                    { id: 'notif_critical', title: 'Critical Emergency Alerts', desc: 'Immediate notifications for life-threatening situations.' },
                    { id: 'notif_community', title: 'Community Safety Updates', desc: 'Alerts about nearby accidents or public disturbances.' },
                    { id: 'notif_weather', title: 'Weather & Natural Hazards', desc: 'Notifications for severe weather or environmental risks.' },
                    { id: 'notif_reports', title: 'Anonymous Reporting Updates', desc: 'Get notified when your reports are acknowledged.' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-accent/20 transition-all">
                      <div className="max-w-md">
                        <h4 className="font-black text-primary uppercase tracking-tight text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-xs mt-1 font-medium">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotif(item.id as keyof typeof notifData)}
                        className={cn(
                          "w-14 h-8 rounded-full p-1 cursor-pointer transition-all",
                          notifData[item.id as keyof typeof notifData] ? "bg-accent" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 bg-white rounded-full shadow-sm transition-all",
                          notifData[item.id as keyof typeof notifData] ? "translate-x-6" : "translate-x-0"
                        )}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Security Settings</h2>
                
                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-black text-primary uppercase tracking-tight">Change Password</h3>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                        <input
                          type="password"
                          className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                          <input
                            type="password"
                            className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {passwordError && (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {passwordError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={passwordStatus === 'loading'}
                      className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {passwordStatus === 'loading' ? 'Updating...' : passwordStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Password Updated
                        </>
                      ) : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  <button className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-accent/20 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Eye className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-primary uppercase tracking-tight text-sm">Two-Factor Auth</h4>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">Active</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
