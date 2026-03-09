import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, Clock, ChevronLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  incident_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

interface ChatRoomProps {
  incidentId: number;
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ incidentId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join_incident_chat', incidentId);

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    fetchMessages();

    return () => {
      newSocket.close();
    };
  }, [incidentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit('send_message', {
      incident_id: incidentId,
      user_id: user.id,
      user_name: user.name,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs">Incident Coordination</h3>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Real-time Community Chat</p>
          </div>
        </div>
        <div className="bg-accent/20 p-3 rounded-2xl">
          <MessageSquare className="w-6 h-6 text-accent" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <MessageSquare className="w-12 h-12" />
            <p className="text-xs font-black uppercase tracking-widest">No messages yet. Start the coordination.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1 px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.user_name}</span>
                  <span className="text-[8px] text-slate-300 font-bold">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm",
                  isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-primary border border-slate-100 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-accent text-white p-4 rounded-2xl hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
