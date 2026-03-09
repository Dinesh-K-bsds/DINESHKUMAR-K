import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  Search, 
  ShieldAlert,
  ChevronRight,
  BellOff,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Incident } from '../types';
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from '../constants';
import { cn } from '../lib/utils';
import { useSocket } from '../hooks/useSocket';

const Alerts: React.FC = () => {
  const socket = useSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncidents();
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

  const filteredIncidents = incidents.filter(incident => {
    const matchesFilter = filter === 'all' || incident.severity === filter;
    const matchesSearch = incident.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          incident.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryInfo = (categoryId: string) => {
    return INCIDENT_CATEGORIES.find(c => c.id === categoryId) || INCIDENT_CATEGORIES[INCIDENT_CATEGORIES.length - 1];
  };

  const getSeverityInfo = (severityId: string) => {
    return SEVERITY_LEVELS.find(s => s.id === severityId) || SEVERITY_LEVELS[0];
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter font-display">Live Safety Alerts</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            Real-time community broadcast
          </p>
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search by location or description..." 
            className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[32px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-2xl backdrop-blur-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar mb-12">
        <button 
          onClick={() => setFilter('all')}
          className={cn(
            "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shrink-0",
            filter === 'all' ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
          )}
        >
          All Alerts
        </button>
        {SEVERITY_LEVELS.map(sev => (
          <button 
            key={sev.id}
            onClick={() => setFilter(sev.id)}
            className={cn(
              "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shrink-0",
              filter === sev.id ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
            )}
          >
            {sev.label}
          </button>
        ))}
      </div>

      {/* Alerts List - Vertical Timeline */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-48 rounded-[40px] animate-pulse"></div>
          ))}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="glass-card p-24 rounded-[48px] text-center">
          <div className="inline-flex items-center justify-center p-10 bg-white/5 rounded-full mb-8">
            <BellOff className="w-16 h-16 text-slate-700" />
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight">No alerts found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-4 font-medium">Try adjusting your filters or search query to find what you're looking for.</p>
        </div>
      ) : (
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {filteredIncidents.map((incident, index) => {
            const category = getCategoryInfo(incident.category);
            const severity = getSeverityInfo(incident.severity);
            const Icon = category.icon;
            const isCritical = incident.severity === 'critical';
            
            return (
              <div key={incident.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Timeline Dot */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border border-white/10 glass-card absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 transition-all group-hover:scale-110",
                  isCritical ? "shadow-[0_0_20px_rgba(239,68,68,0.4)]" : ""
                )}>
                  <div className={cn(
                    "w-3 h-3 rounded-full", 
                    isCritical ? "bg-red-500 animate-ping" : "bg-accent"
                  )}></div>
                </div>

                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-card p-8 rounded-[40px] transition-all hover:bg-white/10 ml-16 md:ml-0 relative overflow-hidden">
                  <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-50", severity.color.split(' ')[0])}></div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      severity.color
                    )}>
                      {severity.label}
                    </div>
                    <time className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                    </time>
                  </div>
                  
                  <div className="flex items-start gap-6 mb-6">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0", category.color)}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-2">{category.label}</h3>
                      <p className="text-slate-400 leading-relaxed font-medium line-clamp-3">{incident.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-accent" />
                      {incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
                    </div>
                    <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-accent-dark transition-colors flex items-center gap-2 group/btn">
                      Full Details 
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notification Settings CTA */}
      <div className="mt-24 glass-card p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-accent/20 transition-all duration-700"></div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center shrink-0 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-12 h-12 text-accent" />
          </div>
          <div>
            <h4 className="text-3xl font-black tracking-tight">Stay Alerted 24/7</h4>
            <p className="text-slate-400 text-lg mt-3 max-w-md leading-relaxed font-medium">Enable push notifications to receive critical safety alerts even when the app is closed.</p>
          </div>
        </div>
        <button className="w-full md:w-auto glowing-button bg-accent text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest relative z-10">
          Enable Notifications
        </button>
      </div>
    </div>
  );
};

export default Alerts;
