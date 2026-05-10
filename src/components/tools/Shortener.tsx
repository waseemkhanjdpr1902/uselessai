import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link as LinkIcon, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const Shortener = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!url) return;
    setIsShortening(true);
    try {
      const data = await apiService.shortenUrl(url, customSlug);
      setShortUrl(data.shortUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsShortening(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-sm space-y-8">
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target Destination</label>
              <div className="relative group">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-14 pr-6 py-5 text-lg font-medium focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  placeholder="https://your-long-link.com/very-long-path"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Custom Alias (Optional)</label>
              <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden group focus-within:ring-2 focus-within:ring-green-500 transition-all">
                 <span className="px-5 py-5 bg-zinc-100/50 text-zinc-400 font-bold border-r border-zinc-200 text-sm">utilne.st /</span>
                 <input 
                   value={customSlug}
                   onChange={(e) => setCustomSlug(e.target.value)}
                   className="flex-1 bg-transparent px-5 py-5 text-lg font-bold focus:outline-none placeholder:font-medium"
                   placeholder="my-link"
                 />
              </div>
           </div>
        </div>

        <button 
          onClick={handleShorten}
          disabled={isShortening}
          className="w-full py-6 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isShortening ? 'Shortening...' : 'Secure Link Shorten'}
        </button>
      </div>

      <AnimatePresence>
        {shortUrl && (
          <div className="bg-green-600 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-green-100">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-lg">
                      <ShieldCheck size={20} />
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest">Link Secured</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-md">Live Preview</span>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 bg-white/10 rounded-2xl px-6 py-5 text-2xl font-bold flex items-center justify-between group">
                   <span className="truncate">{shortUrl}</span>
                   <button onClick={copyResult} className="p-2 hover:bg-white/20 rounded-lg transition-all ml-4">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                   </button>
                </div>
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  className="w-full md:w-auto px-8 py-5 bg-white text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-50 transition-all shadow-lg"
                >
                  <ExternalLink size={20} /> Visit
                </a>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
