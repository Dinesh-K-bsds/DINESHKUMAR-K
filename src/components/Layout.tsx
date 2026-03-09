import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Map as MapIcon, 
  PlusCircle, 
  User as UserIcon, 
  LogOut,
  Bell,
  AlertCircle,
  Loader2,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import SafetyAssistant from './SafetyAssistant';
import NotificationSystem from './NotificationSystem';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSOSLoading, setIsSOSLoading] = useState(false);

  const isLandingPage = location.pathname === '/';

  const navItems = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Incident', path: '/report', icon: PlusCircle },
    { name: 'Safety Map', path: '/map', icon: MapIcon },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Community Reports', path: '/community', icon: Users },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const handleSOS = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (confirm('Are you sure you want to trigger an Emergency SOS? This will notify all nearby users and authorities with your live location.')) {
      setIsSOSLoading(true);
      
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch('/api/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user?.id,
              category: 'medical',
              description: 'EMERGENCY SOS TRIGGERED. User needs immediate assistance.',
              severity: 'critical',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              is_anonymous: false
            }),
          });

          if (response.ok) {
            alert('SOS Alert Sent! Help is on the way. Please stay where you are if safe.');
            navigate('/dashboard');
          }
        } catch (err) {
          alert('Failed to send SOS. Please call emergency services directly.');
        } finally {
          setIsSOSLoading(false);
        }
      }, () => {
        alert('Could not get your location. Please call emergency services directly.');
        setIsSOSLoading(false);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <NotificationSystem />
      {/* Background Orbs & Abstract Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-teal-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Abstract SVG Shapes */}
        <svg className="absolute top-1/4 left-1/4 w-64 h-64 text-white/5 animate-float" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,85.2,-0.9C83.6,13.8,77,27.6,68.2,39.7C59.4,51.8,48.4,62.2,35.5,69.5C22.6,76.8,7.8,81,-7.2,80.2C-22.2,79.4,-37.4,73.6,-50.2,64.2C-63,54.8,-73.4,41.8,-79.1,27.1C-84.8,12.4,-85.8,-4,-81.4,-18.8C-77,-33.6,-67.2,-46.8,-54.8,-54.6C-42.4,-62.4,-27.4,-64.8,-13.4,-72.1C0.6,-79.4,14.6,-91.6,29.1,-90.7C43.6,-89.8,58.6,-75.8,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute bottom-1/4 right-1/4 w-96 h-96 text-white/5 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M37.5,-65.4C48.1,-58.3,56.1,-46.8,62.8,-34.5C69.5,-22.2,74.9,-9.1,74.1,3.8C73.3,16.7,66.3,29.4,57.1,40.4C47.9,51.4,36.5,60.7,23.6,65.8C10.7,70.9,-3.7,71.8,-17.7,68.7C-31.7,65.6,-45.3,58.5,-55.4,47.9C-65.5,37.3,-72.1,23.2,-74.8,8.4C-77.5,-6.4,-76.3,-21.9,-69.3,-34.7C-62.3,-47.5,-49.5,-57.6,-36.5,-63.5C-23.5,-69.4,-10.3,-71.1,2.1,-74.7C14.5,-78.3,26.9,-72.5,37.5,-65.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-500 glass-nav",
        isLandingPage && !isAuthenticated 
          ? "bg-transparent border-transparent" 
          : ""
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-accent to-accent-dark p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">CrowdCare</span>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Smart City Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-white/10 text-white shadow-inner" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <Link to="/alerts" className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-[#020617] group-hover:scale-125 transition-transform"></span>
                  </Link>
                </div>
                
                <div className="h-8 w-px bg-white/10"></div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized User</p>
                  </div>
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-[10px] bg-neutral-bg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Logout Tooltip/Dropdown simulation */}
                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="absolute top-full right-0 mt-2 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0"
                    >
                      <div className="flex items-center gap-2 text-slate-400 hover:text-accent whitespace-nowrap">
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-bold">Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Log in</Link>
                <Link to="/register" className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-accent-dark transition-all shadow-xl shadow-accent/20 hover:-translate-y-0.5">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1 w-full relative z-10",
        isLandingPage ? "" : "max-w-7xl mx-auto px-6 py-10"
      )}>
        {children}
      </main>

      {/* SOS Button */}
      {isAuthenticated && !isLandingPage && (
        <button
          onClick={handleSOS}
          disabled={isSOSLoading}
          className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all group border-4 border-white"
        >
          {isSOSLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <AlertCircle className="w-8 h-8 group-hover:animate-pulse" />
          )}
          <span className="absolute -top-12 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Emergency SOS
          </span>
        </button>
      )}

      {/* Safety Assistant */}
      {isAuthenticated && !isLandingPage && <SafetyAssistant />}

      {/* Mobile Navigation */}
      {!isLandingPage && isAuthenticated && (
        <nav className="sm:hidden bg-white/90 backdrop-blur-md border-t border-slate-200 fixed bottom-0 left-0 right-0 z-50 pb-safe">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                    isActive ? "text-accent" : "text-slate-400"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
