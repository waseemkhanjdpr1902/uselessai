import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIWriter() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '👋 AI Writer is currently under maintenance. You can still use other tools.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, AI is temporarily disabled due to configuration issues. Other tools are working normally.' 
      }]);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-3">
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <div>
          <h1 className="text-4xl font-bold">AI Writer</h1>
          <p className="text-zinc-600">Temporarily in maintenance mode</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 h-[620px] flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-5 py-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-zinc-900 text-white' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && <Loader2 className="animate-spin mx-auto" />}
        </div>

        <div className="p-6 border-t">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="AI is in maintenance mode..."
              className="flex-1 bg-zinc-100 rounded-2xl px-6 py-4 focus:outline-none"
              disabled
            />
            <button
              onClick={sendMessage}
              disabled
              className="bg-zinc-300 text-zinc-500 px-8 rounded-2xl"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
