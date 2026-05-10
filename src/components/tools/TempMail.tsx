import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Copy, Check, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { nanoid } from 'nanoid';

export const TempMail = () => {
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    generateNew();
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate incoming emails every 30 seconds for functionality demo
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        receiveDemoEmail();
      }
    }, 15000);
    return () => clearInterval(checkInterval);
  }, [address]);

  const generateNew = () => {
    const newAddr = `${nanoid(10).toLowerCase()}@utilne.st`;
    setAddress(newAddr);
    setTimeLeft(600);
    setEmails([]);
  };

  const receiveDemoEmail = () => {
    const newEmail = {
      id: nanoid(),
      from: 'newsletter@partner.com',
      subject: 'Welcome to UtilityNest!',
      preview: 'Hi there, thank you for trying out our premium temporary email service...',
      content: 'Hi there,\n\nThis is a simulated email to demonstrate that your temporary inbox is active and working correctly. In a production environment, this would be connected to an SMTP server.\n\nBest,\nThe UtilityNest Team',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Temporary Identity</label>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl md:text-3xl font-mono font-bold text-zinc-900 tracking-tight">{address}</h3>
              <button 
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-zinc-100 text-zinc-400'}`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex-1 md:flex-none flex items-center gap-3 bg-zinc-50 border border-zinc-200 px-6 py-4 rounded-2xl">
               <Clock size={20} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-zinc-400'} />
               <span className="text-xl font-mono font-bold tabular-nums">
                 {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
               </span>
             </div>
             <button 
               onClick={generateNew}
               className="bg-zinc-900 text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-200"
             >
               <RefreshCw size={24} />
             </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h4 className="font-bold text-zinc-900 flex items-center gap-2">
             <Mail size={18} className="text-blue-500" />
             Inbox <span className="px-2 py-0.5 bg-zinc-100 text-[10px] rounded-md">{emails.length}</span>
           </h4>
           <button className="text-xs font-bold text-zinc-400 hover:text-red-500 flex items-center gap-1">
             <Trash2 size={14} /> Clear All
           </button>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 min-h-[400px] flex flex-col">
          <AnimatePresence>
            {emails.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping" />
                   <Mail size={32} className="text-zinc-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center">
                    <RefreshCw size={14} className="text-blue-500 animate-spin" />
                    <p className="font-bold text-zinc-900">Waiting for incoming messages...</p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Your inbox refreshes automatically every few seconds.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[500px]">
                {emails.map((email) => (
                  <motion.div 
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 hover:bg-zinc-50 transition-all cursor-pointer group"
                    onClick={() => alert(`Message from: ${email.from}\n\n${email.content}`)}
                  >
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">From: {email.from}</span>
                         <h5 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{email.subject}</h5>
                       </div>
                       <span className="text-[10px] font-black text-zinc-400">{email.time}</span>
                     </div>
                     <p className="text-sm text-zinc-500 line-clamp-1">{email.preview}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
