import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Map as MapIcon, 
  PlusCircle, 
  Clock, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Activity,
  ArrowRight,
  MessageSquare,
  X,
  Zap,
  Navigation,
  Shield,
  PhoneCall,
  CheckCircle2,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { Incident } from '../types';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../constants';
import { cn } from '../lib/utils';
import ChatRoom from '../components/ChatRoom';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getCategoryInfo = (categoryId: string) => {
    return INCIDENT_CATEGORIES.find(c => c.id === categoryId) || INCIDENT_CATEGORIES[INCIDENT_CATEGORIES.length - 1];
  };

  const getSeverityInfo = (severityId: string) => {
    return SEVERITY_LEVELS.find(s => s.id === severityId) || SEVERITY_LEVELS[0];
  };

  // Chart Data
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => ({
      name: day,
      incidents: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 2
    }));
  }, []);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const COLORS = ['#e63946', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  const stats = [
    { 
      label: 'Total Reports Today', 
      value: incidents.length, 
      icon: Activity, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20',
      progress: 65
    },
    { 
      label: 'Active Alerts', 
      value: incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length, 
      icon: AlertTriangle, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      progress: 42
    },
    { 
      label: 'Crowd Density Zones', 
      value: 12, 
      icon: Users, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20',
      progress: 88
    },
    { 
      label: 'Emergency Requests', 
      value: incidents.filter(i => i.category === 'medical').length, 
      icon: PhoneCall, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/20',
      progress: 15
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Chat Overlay */}
      {activeChatId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-2xl relative">
            <button 
              onClick={() => setActiveChatId(null)}
              className="absolute -top-4 -right-4 bg-slate-900 p-2 rounded-full shadow-2xl z-10 hover:scale-110 transition-transform border border-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <ChatRoom incidentId={activeChatId} onClose={() => setActiveChatId(null)} />
          </div>
        </div>
      )}

      {/* Welcome & Quick Actions */}
      <section className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight font-display">Safety Dashboard</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">Real-time community monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/report" className="glowing-button bg-accent text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Report
          </Link>
          <Link to="/map" className="glass-card hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-accent" />
            Safety Map
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={cn("glass-card p-8 rounded-[32px] relative overflow-hidden group", stat.border)}>
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-500">System Load</span>
                <span className={stat.color}>{stat.progress}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", stat.color.replace('text', 'bg'))}
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed & Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Incident Trends
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Last 7 Days</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="incidents" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  High-Risk Sectors
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Live Risk Data</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Downtown Core', risk: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' },
                  { name: 'Westside Heights', risk: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { name: 'Industrial District', risk: 'Medium', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { name: 'South Bay', risk: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((sector, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-white">{sector.name}</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", sector.bg, sector.color)}>
                      {sector.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Navigation className="w-6 h-6 text-slate-500" />
                Recent Activity Feed
              </h2>
              <Link to="/alerts" className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors">View All Archive</Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-32 glass-card rounded-3xl animate-pulse"></div>)
              ) : incidents.length === 0 ? (
                <div className="glass-card p-20 rounded-[40px] text-center">
                  <ShieldCheck className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                  <h3 className="text-xl font-black text-white">No Active Incidents</h3>
                  <p className="text-slate-500 mt-2">Your community is currently safe and secure.</p>
                </div>
              ) : (
                incidents.slice(0, 5).map((incident) => {
                  const category = getCategoryInfo(incident.category);
                  const severity = getSeverityInfo(incident.severity);
                  const Icon = category.icon;
                  
                  return (
                    <div key={incident.id} className="glass-card p-6 rounded-[32px] group">
                      <div className="flex gap-6">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl", category.color)}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-black text-white truncate">{category.label}</h3>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={cn("text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border", severity.color)}>
                                  {severity.label}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setActiveChatId(incident.id)}
                                className="p-3 bg-white/5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </button>
                              <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                          <p className="mt-4 text-slate-400 text-sm leading-relaxed line-clamp-2">{incident.description}</p>
                          
                          {incident.image_url && (
                            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 aspect-video max-h-48 relative group/img">
                              <img 
                                src={incident.image_url} 
                                alt="Incident" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  AI Verified Image
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span className="truncate">{incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Mini Map Widget */}
          <div className="glass-card rounded-[40px] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                <MapIcon className="w-5 h-5 text-blue-400" />
                Live Area View
              </h3>
              <Link to="/map" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Navigation className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
            <div className="h-64 w-full relative">
              {userLocation && (
                <MapContainer 
                  center={userLocation} 
                  zoom={12} 
                  className="h-full w-full"
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {incidents.slice(0, 10).map(i => (
                    <Marker key={i.id} position={[i.latitude, i.longitude]}>
                      <Popup>
                        <div className="p-2">
                          <p className="text-xs font-black uppercase">{getCategoryInfo(i.category).label}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none"></div>
            </div>
            <div className="p-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                Monitoring {incidents.length} active points in your sector
              </p>
            </div>
          </div>

          {/* Emergency Contact Widget */}
          <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-[40px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-20 h-20 text-white" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Emergency Help</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              Immediate connection to local emergency responders and medical services.
            </p>
            <button className="w-full bg-white text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3">
              <PhoneCall className="w-4 h-4" />
              Call Emergency 911
            </button>
          </div>

          {/* Safety Status Widget */}
          <div className="glass-card p-8 rounded-[40px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              Community Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">System Integrity</span>
                <span className="text-xs font-black text-emerald-400 uppercase">Stable</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Response Efficiency</span>
                <span className="text-xs font-black text-blue-400 uppercase">92%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[92%]"></div>
              </div>
            </div>
            <button className="mt-8 w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 transition-all">
              View Full Audit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
