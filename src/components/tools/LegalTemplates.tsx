import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  FileText, 
  Copy, 
  Check, 
  Search,
  ArrowRight,
  ShieldAlert,
  Gavel,
  Briefcase,
  Sparkles,
  Download,
  AlertCircle,
  Wand2,
  Settings2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencySelector } from '../CurrencySelector';
import { GoogleGenerativeAI } from "@google/generative-ai";

const TEMPLATES = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    category: 'Business',
    icon: ShieldAlert,
    prompt: 'Generate a professional, detailed Non-Disclosure Agreement (NDA).',
    content: (data: any) => `NON-DISCLOSURE AGREEMENT (NDA)

This Agreement is made on ${data.date || '[DATE]'} between:
${data.partyA || '[PARTY A NAME]'} ("Disclosing Party") and
${data.partyB || '[PARTY B NAME]'} ("Receiving Party").

1. PURPOSE OF DISCLOSURE: ${data.purpose || 'Business discussions and potential collaboration'}.
2. CONFIDENTIAL INFORMATION: Includes all proprietary or sensitive information shared.
3. NON-USE AND NON-DISCLOSURE: Receiving party agrees to protect information with reasonable care.
4. TERM: This agreement remains valid for ${data.duration || '2 years'} from the date of last disclosure.

Signed,
${data.partyA || '____________________'} (Disclosing Party)
${data.partyB || '____________________'} (Receiving Party)`
  },
  {
    id: 'rental',
    title: 'Lease Termination Notice',
    category: 'Property',
    icon: Gavel,
    prompt: 'Generate a formal residential lease termination notice or notice to vacate.',
    content: (data: any) => `NOTICE TO VACATE / LEASE TERMINATION

To: ${data.tenant || '[TENANT NAME]'}
Property: ${data.address || '[PROPERTY ADDRESS]'}

Dear ${data.tenant},

This letter serves as formal notice to vacate the premises located at the address above by ${data.deadline || '[DEADLINE DATE]'}. 

Reason: ${data.reason || 'End of Lease Term'}.

Please ensure all utility accounts are closed and keys are returned as per the move-out checklist.

Regards,
${data.landlord || '[LANDLORD NAME]'}`
  },
  {
    id: 'freelance',
    title: 'Service Agreement',
    category: 'Business',
    icon: Briefcase,
    prompt: 'Generate a standard service agreement for a freelance project.',
    content: (data: any) => `PROFESSIONAL SERVICE CONTRACT

CLIENT: ${data.clientName || '[CLIENT NAME]'}
PROVIDER: ${data.providerName || '[PROVIDER NAME]'}

1. SCOPE OF SERVICES: ${data.services || 'Professional services as described in the project proposal'}.
2. FEES: Client agrees to pay a total fee of ${data.currencySymbol || '$'}${data.fee || '[AMOUNT]'}.
3. DEADLINE: Project completion expected by ${data.date || '[DATE]'}.
4. INTELLECTUAL PROPERTY: All work created shall remain the property of the Provider until full payment is received.

Date: ${new Date().toLocaleDateString()}`
  }
];

export default function LegalTemplates() {
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
  const [mode, setMode] = useState<'template' | 'ai'>('template');
  const [formData, setFormData] = useState<any>({ currencyCode: 'USD', currencySymbol: '$' });
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Update generated content when template form changes
  useEffect(() => {
    if (mode === 'template') {
      const template = TEMPLATES.find(t => t.id === selectedId);
      if (template) {
        setGeneratedContent(template.content(formData));
      }
    }
  }, [selectedId, formData, mode]);

  const handleAiDraft = async () => {
    if (!customPrompt.trim() && mode === 'ai') return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const template = TEMPLATES.find(t => t.id === selectedId);
      const systemPrompt = `You are a legal document architect. Generate a professional, legally-sound document. 
                           ${mode === 'template' ? `Template base: ${template?.prompt}.` : ''} 
                           Use formal language. User's specific requirements: ${customPrompt || 'Standard professional draft'}.
                           Keep it concise but comprehensive. Provide only the text for the agreement.`;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      setGeneratedContent(text);
      setMode('ai'); // Switch to editor mode visuals
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate document. Please check your API key or connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section with Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
              <Scale size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Legal Hub</h1>
          </div>
          <p className="text-zinc-500 font-medium">Draft, review, and finalize professional agreements with AI precision.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
          <button 
            onClick={() => setMode('template')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'template' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Settings2 size={14} /> Templates
          </button>
          <button 
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'ai' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Sparkles size={14} /> AI Smart Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Prompt Box (Always visible or contextual) */}
          <section className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Wand2 size={14} className="text-orange-400" /> AI Drafting Tool
              </h3>
              {isGenerating && (
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <textarea 
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="E.g., 'A software license for a client in NY' or 'Formal complaint about late rent'..."
              className="w-full bg-zinc-50 border-none rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-zinc-900 transition-all resize-none h-32"
            />
            <button 
              disabled={isGenerating}
              onClick={handleAiDraft}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Drafting...' : 'Generate with AI'}
              <ArrowRight size={16} />
            </button>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold leading-tight border border-red-100">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </section>

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4">Standard Presets</h3>
            <div className="grid grid-cols-1 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedId(t.id);
                    setMode('template');
                  }}
                  className={`flex flex-col p-5 rounded-3xl transition-all border text-left group ${
                    selectedId === t.id && mode === 'template'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200' 
                    : 'bg-white text-zinc-600 border-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <t.icon size={20} className={`mb-4 ${selectedId === t.id && mode === 'template' ? 'text-orange-400' : 'text-zinc-400 group-hover:text-zinc-900 transition-colors'}`} />
                  <div className="font-extrabold text-sm mb-1">{t.title}</div>
                  <div className={`text-[10px] uppercase font-black tracking-widest ${selectedId === t.id && mode === 'template' ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    {t.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <CurrencySelector 
            value={formData.currencyCode || 'USD'}
            onChange={c => setFormData({...formData, currencyCode: c.code, currencySymbol: c.symbol})}
            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100"
          />
        </div>

        {/* Right Editor/Preview Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[800px] flex flex-col group">
            
            {/* Editor Toolbar */}
            <header className="p-6 border-b border-zinc-800 flex flex-wrap justify-between items-center bg-zinc-900/80 backdrop-blur-md z-20 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-lg shadow-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-lg shadow-emerald-500/20" />
                </div>
                <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  {mode === 'ai' ? <Sparkles size={11} className="text-orange-400" /> : <FileText size={11} />}
                  Live Editor
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setGeneratedContent('')}
                  className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Clear Content"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-2.5 rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Agreement'}
                </button>
              </div>
            </header>
            
            {/* Main Content Area: Editor or Template Inputs */}
            <div className="flex-1 flex flex-col md:flex-row relative">
              
              {/* Template Dynamic Inputs (Side drawer concept) */}
              {mode === 'template' && (
                <div className="md:w-80 bg-zinc-800/30 p-8 border-r border-zinc-800 overflow-y-auto space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Document Fields</h4>
                  <div className="space-y-4">
                    {selectedId === 'nda' && (
                      <>
                        <InputField label="Disclosing Party" value={formData.partyA} onChange={(v: string) => setFormData({...formData, partyA: v})} />
                        <InputField label="Receiving Party" value={formData.partyB} onChange={(v: string) => setFormData({...formData, partyB: v})} />
                        <InputField label="Scope/Purpose" value={formData.purpose} onChange={(v: string) => setFormData({...formData, purpose: v})} />
                        <InputField label="Agreement Term" value={formData.duration} placeholder="2 years" onChange={(v: string) => setFormData({...formData, duration: v})} />
                      </>
                    )}
                    {selectedId === 'rental' && (
                      <>
                        <InputField label="Tenant Name" value={formData.tenant} onChange={(v: string) => setFormData({...formData, tenant: v})} />
                        <InputField label="Landlord Name" value={formData.landlord} onChange={(v: string) => setFormData({...formData, landlord: v})} />
                        <InputField label="Property Address" value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} />
                        <InputField label="Deadline Date" type="date" value={formData.deadline} onChange={(v: string) => setFormData({...formData, deadline: v})} />
                      </>
                    )}
                    {selectedId === 'freelance' && (
                      <>
                        <InputField label="Client Name" value={formData.clientName} onChange={(v: string) => setFormData({...formData, clientName: v})} />
                        <InputField label="Provider Name" value={formData.providerName} onChange={(v: string) => setFormData({...formData, providerName: v})} />
                        <InputField label="Project Fee" type="number" value={formData.fee} onChange={(v: string) => setFormData({...formData, fee: v})} />
                        <InputField label="Deadline" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
                        <InputField label="Services" isArea value={formData.services} onChange={(v: string) => setFormData({...formData, services: v})} />
                      </>
                    )}
                    <InputField label="Signing Date" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
                  </div>
                </div>
              )}

              {/* The Live Workspace */}
              <div className="flex-1 relative flex flex-col">
                <textarea 
                  value={generatedContent}
                  onChange={e => setGeneratedContent(e.target.value)}
                  className="w-full flex-1 p-8 md:p-12 bg-transparent border-none focus:ring-0 font-serif text-lg leading-relaxed text-zinc-300 resize-none selection:bg-orange-400 selection:text-white"
                  spellCheck={false}
                  placeholder="The drafting space... Generate something or start writing."
                />
                
                {/* Visual Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-15deg] pointer-events-none select-none z-0">
                  <Scale size={400} className="text-white" />
                </div>
              </div>
            </div>

            {/* Footer / Stats */}
            <footer className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-8">
              <div className="flex gap-6">
                <span>Words: {generatedContent.trim() ? generatedContent.trim().split(/\s+/).length : 0}</span>
                <span>Characters: {generatedContent.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Autosaved
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", isArea = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">{label}</label>
      {isArea ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white focus:ring-2 focus:ring-orange-400 transition-all h-32"
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white focus:ring-2 focus:ring-orange-400 transition-all"
        />
      )}
    </div>
  );
}
