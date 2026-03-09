import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, ShieldAlert } from 'lucide-react';
import { getSafetyGuidance } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SafetyAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Emergency Safety Assistant. How can I help you stay safe today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const guidance = await getSafetyGuidance(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: guidance }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 left-6 sm:bottom-8 sm:left-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all group border-4 border-white",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Bot className="w-8 h-8 group-hover:animate-bounce" />
        <span className="absolute -top-12 left-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Safety Assistant
        </span>
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-6 left-6 right-6 sm:left-8 sm:right-auto sm:w-[400px] bg-white rounded-[40px] shadow-2xl border border-slate-200 z-[60] flex flex-col overflow-hidden transition-all duration-500 origin-bottom-left",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-20 pointer-events-none"
      )}>
        {/* Header */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs">Safety Assistant</h3>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">AI Emergency Guidance</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 h-[400px] overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                msg.role === 'user' ? "bg-accent" : "bg-primary"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={cn(
                "p-4 rounded-3xl text-xs font-medium shadow-sm leading-relaxed",
                msg.role === 'user' ? "bg-white text-primary rounded-tr-none" : "bg-primary text-white rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-primary text-white p-4 rounded-3xl rounded-tl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for safety advice..."
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-accent text-white p-3.5 rounded-2xl hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default SafetyAssistant;
