import React, { useState } from 'react';
import { PenTool, Send, Copy, Check, Sparkles, Languages, Music, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AIWriter = () => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a professional email based on this context: ${prompt}. 
                 Tone: ${tone}. 
                 Language: ${language}. 
                 Return ONLY the email body without subject line or placeholders.`,
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      setResult(text);
      await apiService.logUsage("ai_writer", { tone, language });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const tones = ['Professional', 'Friendly', 'Urgent', 'Apologetic', 'Persuasive'];
  const langs = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Describe the Email Context</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-48 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
                placeholder="Ask for a refund, reach out to a recruiter, or follow up with a guest..."
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Music size={12} /> Tone</label>
                 <select 
                   value={tone}
                   onChange={(e) => setTone(e.target.value)}
                   className="w-full bg-zinc-100 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-orange-500"
                 >
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Languages size={12} /> Language</label>
                 <select 
                   value={language}
                   onChange={(e) => setLanguage(e.target.value)}
                   className="w-full bg-zinc-100 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-orange-500"
                 >
                    {langs.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
              </div>
           </div>

           <button 
             onClick={handleGenerate}
             disabled={isGenerating}
             className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden relative group"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity" />
             {isGenerating ? <div className="animate-pulse flex items-center gap-2 italic">Drafting with AI...</div> : (
               <>
                 <Sparkles size={20} className="text-orange-400 fill-orange-400" />
                 Generate Draft
               </>
             )}
           </button>
        </div>
      </div>

      <div className="lg:col-span-3">
         <div className="bg-white rounded-[2.5rem] border border-zinc-200 h-full flex flex-col overflow-hidden">
            <div className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Generated Response</h4>
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-2 rounded-lg transition-all ${copied ? 'text-green-500' : 'text-zinc-400 hover:text-zinc-900'}`}
               >
                 {copied ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto font-serif text-lg text-zinc-800 leading-relaxed min-h-[300px]">
               {error && (
                 <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4 text-red-600">
                    <AlertCircle className="shrink-0" size={20} />
                    <div className="space-y-1">
                       <p className="font-bold text-sm">Generation Error</p>
                       <p className="text-xs opacity-80">{error}</p>
                       <p className="text-[10px] mt-2 font-black uppercase tracking-widest opacity-50">Check Settings &gt; Gemini API Key</p>
                    </div>
                 </div>
               )}
               {result ? result : !error && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 filter grayscale">
                     <PenTool size={60} strokeWidth={1} />
                     <p className="max-w-xs text-sm font-sans font-medium">Your generated content will appear here in high-clarity typeface.</p>
                  </div>
               )}
            </div>
            {result && (
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                 <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-zinc-200">
                    <Send size={16} /> Send via UtilitySync
                 </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
