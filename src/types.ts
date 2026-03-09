export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  trust_score?: number;
  notif_critical?: boolean;
  notif_community?: boolean;
  notif_weather?: boolean;
  notif_reports?: boolean;
}

export interface Incident {
  id: number;
  user_id?: number;
  category: string;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  address?: string;
  status: 'active' | 'resolved';
  is_anonymous: boolean;
  image_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
