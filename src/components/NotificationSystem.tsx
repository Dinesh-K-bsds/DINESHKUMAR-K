import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { Incident } from '../types';
import { INCIDENT_CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'incident' | 'info' | 'success' | 'warning';
  incidentId?: number;
}

const NotificationSystem: React.FC = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (socket) {
      socket.on('new_incident', (incident: Incident) => {
        const category = INCIDENT_CATEGORIES.find(c => c.id === incident.category);
        addNotification({
          id: `incident-${incident.id}-${Date.now()}`,
          title: `New ${category?.label || 'Incident'} Reported`,
          message: incident.description.substring(0, 60) + '...',
          type: 'incident',
          incidentId: incident.id
        });
      });

      socket.on('emergency_sos', (data: { userId: number, userName: string, location: [number, number] }) => {
        addNotification({
          id: `sos-${data.userId}-${Date.now()}`,
          title: 'EMERGENCY SOS',
          message: `${data.userName} needs immediate assistance nearby!`,
          type: 'warning'
        });
      });
    }
  }, [socket]);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
    // Auto remove after 8 seconds
    setTimeout(() => {
      removeNotification(notif.id);
    }, 8000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[2000] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={cn(
            "pointer-events-auto glass-card p-5 rounded-3xl border shadow-2xl animate-in slide-in-from-right duration-500 flex gap-4",
            notif.type === 'incident' ? "border-accent/30 bg-red-500/10" : 
            notif.type === 'warning' ? "border-orange-500/30 bg-orange-500/10" :
            "border-blue-500/30 bg-blue-500/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
            notif.type === 'incident' ? "bg-accent/20 text-accent" :
            notif.type === 'warning' ? "bg-orange-500/20 text-orange-400" :
            "bg-blue-500/20 text-blue-400"
          )}>
            {notif.type === 'incident' ? <ShieldAlert className="w-6 h-6" /> :
             notif.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
             <Bell className="w-6 h-6" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{notif.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
          </div>
          
          <button 
            onClick={() => removeNotification(notif.id)}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
