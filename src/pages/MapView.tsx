import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Filter, 
  Clock, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  Info,
  Locate,
  Activity,
  Zap,
  Navigation,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Incident } from '../types';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../constants';
import { useSocket } from '../hooks/useSocket';
import { cn } from '../lib/utils';
import { predictRiskZones } from '../services/geminiService';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icons based on category and severity
const createCustomIcon = (category: string, severity: string) => {
  // Green for safe/low, Yellow for moderate/medium, Red for emergency/high/critical
  const color = (severity === 'critical' || severity === 'high') ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 12px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); transform: rotate(45deg);"><div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const RecenterButton: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  return (
    <button 
      onClick={() => map.setView(coords, 15)}
      className="absolute bottom-8 right-8 z-[1000] bg-white p-4 rounded-2xl shadow-xl border border-slate-200 hover:bg-slate-50 transition-all text-primary group"
      title="Recenter Map"
    >
      <Locate className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};

const MapView: React.FC = () => {
  const socket = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [safeRoute, setSafeRoute] = useState<[number, number][] | null>(null);

  useEffect(() => {
    fetchIncidents();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_incident', (newIncident: Incident) => {
        setIncidents(prev => [newIncident, ...prev]);
      });
    }
  }, [socket]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      const data = await response.json();
      setIncidents(data);
      // Run initial prediction
      handlePredictRisk(data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictRisk = async (data: Incident[]) => {
    setIsPredicting(true);
    const result = await predictRiskZones(data);
    if (result && result.zones) {
      setRiskZones(result.zones);
    }
    setIsPredicting(false);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setUserLocation([40.7128, -74.0060]); // NYC
        }
      );
    }
  };

  const handleSafeRoute = () => {
    if (!userLocation) return;
    // Simulate a safe route avoiding hotspots
    const start = userLocation;
    const end: [number, number] = [start[0] + 0.02, start[1] + 0.02];
    const mid1: [number, number] = [start[0] + 0.005, start[1] + 0.015];
    const mid2: [number, number] = [start[0] + 0.015, start[1] + 0.005];
    setSafeRoute([start, mid1, mid2, end]);
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesCategory = filter === 'all' || incident.category === filter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesCategory && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    const sev = SEVERITY_LEVELS.find(s => s.id === severity);
    return sev?.color || 'bg-slate-500';
  };

  return (
    <div className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-8">
      {/* Sidebar / Filters */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-3">
              <Filter className="w-6 h-6 text-accent" />
              Safety Filters
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Refine your view</p>
          </div>
          
          <div className="space-y-6">
            <button 
              onClick={() => handlePredictRisk(incidents)}
              disabled={isPredicting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-accent" />}
              AI Risk Prediction
            </button>

            <button 
              onClick={handleSafeRoute}
              className="w-full flex items-center justify-center gap-2 bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
            >
              <Navigation className="w-4 h-4" />
              Safe Route Recommendation
            </button>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Heatmap</span>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  showHeatmap ? "bg-accent" : "bg-slate-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  showHeatmap ? "left-7" : "left-1"
                )}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Zones</span>
              <button 
                onClick={() => setShowRiskZones(!showRiskZones)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  showRiskZones ? "bg-accent" : "bg-slate-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  showRiskZones ? "left-7" : "left-1"
                )}></div>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incident Type</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none"
              >
                <option value="all">All Categories</option>
                {INCIDENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-primary p-8 rounded-[40px] text-white hidden lg:block relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <Activity className="w-5 h-5 text-accent" />
            Map Legend
          </h3>
          <div className="space-y-4">
            {SEVERITY_LEVELS.map(sev => (
              <div key={sev.id} className="flex items-center gap-4">
                <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm", sev.color.split(' ')[0])}></div>
                <span className="text-xs font-bold text-white/70">{sev.label} Priority</span>
              </div>
            ))}
            <div className="flex items-center gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/30 border border-red-500"></div>
              <span className="text-xs font-bold text-white/70">AI Risk Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-[60px] border border-slate-200 shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">Initializing Map...</p>
            </div>
          </div>
        )}
        
        {userLocation && (
          <MapContainer 
            center={userLocation} 
            zoom={13} 
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Heatmap Simulation */}
            {showHeatmap && incidents.map((incident, i) => (
              <Circle
                key={`heat-${incident.id}`}
                center={[incident.latitude, incident.longitude]}
                radius={200}
                pathOptions={{
                  fillColor: incident.severity === 'critical' ? '#ef4444' : incident.severity === 'high' ? '#f59e0b' : '#3b82f6',
                  fillOpacity: 0.1,
                  color: 'transparent',
                  weight: 0
                }}
              />
            ))}
            
            {/* Risk Zones */}
            {showRiskZones && riskZones.map((zone, i) => (
              <Circle
                key={i}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  fillColor: zone.level === 'high' ? '#ef4444' : '#f59e0b',
                  fillOpacity: 0.2,
                  color: zone.level === 'high' ? '#ef4444' : '#f59e0b',
                  weight: 1,
                  dashArray: '5, 5'
                }}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-black text-red-600 text-[10px] uppercase tracking-widest">AI Risk Warning</p>
                    <p className="text-xs font-bold text-primary mt-1">{zone.reason}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Risk Level: {zone.level}</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Safe Route */}
            {safeRoute && (
              <Polyline 
                positions={safeRoute} 
                pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8, lineCap: 'round', dashArray: '1, 12' }} 
              />
            )}
            
            {/* User Location Marker */}
            <Marker position={userLocation} icon={L.divIcon({
              className: 'user-location-icon',
              html: `<div class="relative flex items-center justify-center w-10 h-10"><div class="absolute w-full h-full bg-blue-500 rounded-full opacity-20 animate-ping"></div><div class="relative w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-xl"></div></div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })}>
              <Popup>
                <div className="p-2">
                  <p className="font-black text-primary text-xs uppercase tracking-widest">Your Current Position</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Active Monitoring</p>
                </div>
              </Popup>
            </Marker>

            {/* Incident Markers */}
            {filteredIncidents.map((incident) => {
              const category = INCIDENT_CATEGORIES.find(c => c.id === incident.category);
              const severity = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              const Icon = category?.icon || ShieldAlert;
              
              return (
                <Marker 
                  key={incident.id} 
                  position={[incident.latitude, incident.longitude]}
                  icon={createCustomIcon(incident.category, incident.severity)}
                >
                  <Popup className="custom-popup">
                    <div className="p-4 min-w-[240px]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn("w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-primary/10", category?.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-primary text-sm uppercase tracking-tight">{category?.label}</h4>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block", severity?.color)}>
                            {severity?.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">{incident.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                        </span>
                        <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-accent-dark transition-colors flex items-center gap-1">
                          View Details <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            <RecenterButton coords={userLocation} />
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapView;
