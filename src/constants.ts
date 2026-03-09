import { 
  AlertTriangle, 
  Flame, 
  Activity, 
  ShieldAlert, 
  Users, 
  Eye, 
  Car, 
  CloudLightning 
} from 'lucide-react';

export const INCIDENT_CATEGORIES = [
  { id: 'accident', label: 'Accident', icon: Car, color: 'bg-blue-500' },
  { id: 'crime', label: 'Crime', icon: ShieldAlert, color: 'bg-red-600' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'bg-orange-500' },
  { id: 'medical', label: 'Medical Emergency', icon: Activity, color: 'bg-green-500' },
  { id: 'natural_disaster', label: 'Natural Disaster', icon: CloudLightning, color: 'bg-purple-500' },
  { id: 'public_disturbance', label: 'Public Disturbance', icon: Users, color: 'bg-yellow-500' },
  { id: 'suspicious_behavior', label: 'Suspicious Behavior', icon: Eye, color: 'bg-gray-600' },
  { id: 'other', label: 'Other', icon: AlertTriangle, color: 'bg-slate-500' },
];

export const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
];
