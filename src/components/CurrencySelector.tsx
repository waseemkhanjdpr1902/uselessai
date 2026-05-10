import React from 'react';
import { Globe } from 'lucide-react';
import { CURRENCIES } from '../constants/currencies';

interface CurrencySelectorProps {
  value: string; // The currency symbol or code? Let's use code.
  onChange: (currency: { code: string; symbol: string; name: string }) => void;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xs font-black tracking-widest uppercase text-zinc-400 flex items-center gap-2">
        <Globe size={14} /> Currency
      </h3>
      <select 
        value={value}
        onChange={e => {
          const selected = CURRENCIES.find(c => c.code === e.target.value);
          if (selected) onChange(selected);
        }}
        className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
        ))}
      </select>
    </div>
  );
};
