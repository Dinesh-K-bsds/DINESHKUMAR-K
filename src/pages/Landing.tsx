import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Map as MapIcon, 
  Bell, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  PhoneCall,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  PlusCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col -mt-6 -mx-4">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        {/* High-tech background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/tech/1920/1080?blur=10')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-purple-900/40"></div>
          
          {/* Animated Particles/Shapes simulation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white/10 rounded-full blur-xl animate-float"
                style={{
                  width: Math.random() * 100 + 50 + 'px',
                  height: Math.random() * 100 + 50 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: Math.random() * 10 + 10 + 's'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-white/90 text-sm font-bold mb-8 border border-white/20 shadow-xl">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="uppercase tracking-widest text-[10px]">Next-Gen Safety Infrastructure</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none font-display">
              CrowdCare – Real-Time <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Public Safety Platform</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Empowering citizens to report incidents, monitor crowd density, and improve public safety 
              using real-time alerts and intelligent location tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/report" 
                className="w-full sm:w-auto glowing-button bg-gradient-to-r from-accent to-accent-dark text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group"
              >
                Report Incident
                <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </Link>
              <Link 
                to="/map" 
                className="w-full sm:w-auto glass-card hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 border border-white/20"
              >
                <MapIcon className="w-6 h-6 text-accent" />
                View Live Map
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-1 h-12 bg-gradient-to-b from-accent to-transparent rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-neutral-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Powerful Features for a Safer World</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to stay informed and keep your community protected in real-time.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: AlertTriangle, 
                title: "Instant Incident Reporting", 
                desc: "Report accidents, fires, or medical emergencies in seconds with just a few taps.",
                color: "text-red-500",
                bg: "bg-red-50"
              },
              { 
                icon: MapPin, 
                title: "Live Location Alerts", 
                desc: "Receive instant notifications about incidents happening in your immediate vicinity.",
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              { 
                icon: MapIcon, 
                title: "Interactive Safety Map", 
                desc: "Visualize safety conditions in your city with our real-time, color-coded incident map.",
                color: "text-green-500",
                bg: "bg-green-50"
              },
              { 
                icon: Bell, 
                title: "Emergency Notifications", 
                desc: "Get critical alerts from local authorities and high-severity community reports.",
                color: "text-orange-500",
                bg: "bg-orange-50"
              },
              { 
                icon: Users, 
                title: "Community Support", 
                desc: "Connect with neighbors to coordinate response and offer assistance during crises.",
                color: "text-purple-500",
                bg: "bg-purple-50"
              },
              { 
                icon: Zap, 
                title: "Rapid Response", 
                desc: "Shorten response times by providing precise location data and evidence to responders.",
                color: "text-yellow-500",
                bg: "bg-yellow-50"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.bg)}>
                  <feature.icon className={cn("w-7 h-7", feature.color)} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">How CrowdCare Works</h2>
              <div className="space-y-8">
                {[
                  { 
                    step: "01", 
                    title: "Report an Incident", 
                    desc: "Spot an emergency? Open the app, select the category, and add a quick description." 
                  },
                  { 
                    step: "02", 
                    title: "Location is Shared", 
                    desc: "Your GPS coordinates are automatically attached to the report for pinpoint accuracy." 
                  },
                  { 
                    step: "03", 
                    title: "Nearby Users Alerted", 
                    desc: "Instantly, everyone within the affected radius receives a high-priority notification." 
                  },
                  { 
                    step: "04", 
                    title: "Community Responds", 
                    desc: "Neighbors avoid the area or offer help, while authorities get real-time situational data." 
                  }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-slate-100 select-none">{step.step}</div>
                    <div>
                      <h4 className="text-lg font-bold text-primary mb-1">{step.title}</h4>
                      <p className="text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 mt-10 text-accent font-bold hover:gap-3 transition-all"
              >
                Get started today <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/5 rounded-[40px] rotate-3"></div>
              <img 
                src="https://picsum.photos/seed/safety-app/800/1000" 
                alt="CrowdCare App Interface" 
                className="relative rounded-[32px] shadow-2xl border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm font-bold text-primary">Live Alert</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  "Accident reported 200m from your current location. Please use alternate route."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">Trusted by communities worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary"><Shield className="w-8 h-8" /> SafeCity</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary"><Globe className="w-8 h-8" /> UrbanNet</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary"><Activity className="w-8 h-8" /> HealthFirst</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary"><ShieldCheck className="w-8 h-8" /> GuardIQ</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-primary rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to make your community safer?</h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of citizens who are already using CrowdCare to protect their neighborhoods.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
              >
                Create Free Account
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-transparent text-white border border-white/20 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-accent p-1.5 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">CrowdCare</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                Improving public safety through community-powered intelligence and real-time reporting.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-accent transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-accent transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link to="/map" className="hover:text-accent transition-colors">Live Safety Map</Link></li>
                <li><Link to="/report" className="hover:text-accent transition-colors">Report Incident</Link></li>
                <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link to="/guidelines" className="hover:text-accent transition-colors">Community Guidelines</Link></li>
                <li><Link to="/cookies" className="hover:text-accent transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-6">Emergency</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <PhoneCall className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Emergency Services</p>
                    <p className="text-lg font-black text-red-600">911</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  CrowdCare is NOT a replacement for official emergency services. In life-threatening situations, always call 911 first.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">© 2026 CrowdCare Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1 text-xs text-slate-400"><Globe className="w-3 h-3" /> English (US)</span>
              <span className="flex items-center gap-1 text-xs text-slate-400"><Zap className="w-3 h-3" /> System Status: Normal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
