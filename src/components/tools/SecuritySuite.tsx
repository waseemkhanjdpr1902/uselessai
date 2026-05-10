import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Zap,
  ShieldAlert,
  Info,
  Shield,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export const SecuritySuite: React.FC = () => {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });

  const generatePassword = useCallback(() => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lower;
    if (options.uppercase) chars += upper;
    if (options.numbers) chars += nums;
    if (options.symbols) chars += syms;
    
    let generated = '';
    for (let i = 0; i < options.length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  }, [options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    const checkStrength = (p: string) => {
      let score = 0;
      if (!p) return { score: 0, label: 'None', color: 'bg-zinc-200' };
      
      if (p.length > 8) score += 1;
      if (p.length > 12) score += 1;
      if (/[A-Z]/.test(p)) score += 1;
      if (/[0-9]/.test(p)) score += 1;
      if (/[^a-zA-Z0-9]/.test(p)) score += 1;

      if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
      if (score === 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
      if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
      return { score, label: 'Very Strong', color: 'bg-blue-500' };
    };
    setStrength(checkStrength(password));
  }, [password]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Security Suite</h1>
          </div>
          <p className="text-zinc-500 font-medium">Generate industrial-strength passwords and audit security protocols.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Display */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-zinc-200 relative overflow-hidden">
            {/* Visual background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Lock size={200} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Generated Vault Key</span>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setShowPassword(!showPassword)}
                     className="p-2 text-zinc-500 hover:text-white transition-colors"
                   >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                   <button 
                     onClick={generatePassword}
                     className="p-2 text-zinc-500 hover:text-white transition-colors"
                   >
                     <RefreshCw size={18} />
                   </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="w-full bg-transparent border-none text-3xl md:text-5xl font-mono font-bold text-white focus:ring-0 selection:bg-orange-500/30"
                />
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleCopy}
                  className="flex-1 bg-white text-zinc-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0px] transition-all shadow-xl shadow-white/10"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied to Clipboard' : 'Copy Vault Key'}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Entropy Strength</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 transition-all duration-500 rounded-full ${
                        i <= strength.score ? strength.color : 'bg-zinc-800'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Security Advice */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 flex items-start gap-6">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
               <ShieldAlert size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-900">Security Recommendation</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                {strength.score <= 2 ? 
                  "This password is susceptible to brute-force attacks. We recommend adding symbols and increasing length to at least 14 characters." :
                  "This is a high-entropy password. For maximum security, rotate this key every 90 days and never reuse it across multiple platforms."
                }
              </p>
            </div>
          </section>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Zap size={14} className="text-orange-400" /> Key Configuration
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Length</label>
                  <span className="text-sm font-black text-zinc-900">{options.length}</span>
                </div>
                <input 
                  type="range" 
                  min="8" 
                  max="64" 
                  value={options.length}
                  onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
                  className="w-full accent-zinc-900 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <OptionToggle 
                  label="Include Uppercase" 
                  active={options.uppercase} 
                  onClick={() => setOptions({...options, uppercase: !options.uppercase})} 
                />
                <OptionToggle 
                  label="Include Numbers" 
                  active={options.numbers} 
                  onClick={() => setOptions({...options, numbers: !options.numbers})} 
                />
                <OptionToggle 
                  label="Include Symbols" 
                  active={options.symbols} 
                  onClick={() => setOptions({...options, symbols: !options.symbols})} 
                />
              </div>
            </div>
          </section>

          <section className="bg-orange-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Key size={80} />
            </div>
            <div className="relative z-10 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                <Info size={14} /> Pro Tip
              </h3>
              <p className="text-sm font-bold leading-snug">
                Use a password manager like Bitwarden or 1Password to store these complex keys safely.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface OptionToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const OptionToggle: React.FC<OptionToggleProps> = ({ label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
        active 
        ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
        : 'bg-white border-transparent text-zinc-400 hover:bg-zinc-50'
      }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-300'}`}>
        {active ? <Check size={14} /> : <div className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
};
