import React, { useState } from 'react';
import { QrCode, Download, Loader2 } from 'lucide-react';
import { apiService } from '../../services/apiService';

export const QRGen = () => {
  const [text, setText] = useState('https://utilitynest.ai');
  const [qrUrl, setQrUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!text) return;
    setIsGenerating(true);
    try {
      const url = await apiService.generateQR(text);
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Content / URL</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="Enter text or paste link here..."
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : (
              <>
                <QrCode size={22} />
                Generate QR Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-zinc-200 flex flex-col items-center justify-center text-center space-y-8">
        {qrUrl ? (
          <>
            <div className="p-6 bg-white border-8 border-zinc-50 shadow-inner rounded-3xl transition-all hover:scale-105">
               <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="flex gap-3 w-full">
               <a 
                href={qrUrl} 
                download="utilitynest-qr.png"
                className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
               >
                 <Download size={20} /> PNG
               </a>
               <button className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-all">SVG</button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-20 px-10 border-4 border-dashed border-zinc-100 rounded-[3rem]">
             <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto">
                <QrCode size={40} className="text-zinc-200" />
             </div>
             <div>
                <p className="font-bold text-zinc-900">Preview Area</p>
                <p className="text-sm text-zinc-400">Customize your content and click generate to see the magic.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
