import React from 'react';

interface AdUnitProps {
  slot: string;
  className?: string;
  label?: string;
}

/**
 * Centrally managed Ad unit for Google AdSense or Affiliate Banners.
 * Replace the inner div with actual AdSense code when ready.
 */
export const AdUnit: React.FC<AdUnitProps> = ({ slot, className = '', label = 'Advertisement' }) => {
  return (
    <div className={`ad-container relative group ${className}`}>
      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-white border border-border-subtle rounded-md text-[9px] font-black text-zinc-300 uppercase tracking-widest z-10">
        {label}
      </div>
      <div className="w-full min-h-[100px] flex items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-2xl transition-colors group-hover:border-zinc-200">
        <div className="text-center p-4">
          <p className="text-[10px] font-bold text-zinc-300 mb-2 uppercase tracking-tight">Slot: {slot}</p>
          {/* PLACE ADSENSE CODE HERE: */}
          {/* <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-XXXXXXXXXX" data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"></ins> */}
          <div className="max-w-[250px] mx-auto opacity-20 filter grayscale">
             {/* Dynamic affiliate banner placeholder */}
             <div className="h-8 bg-zinc-400 rounded-full w-3/4 mx-auto mb-2" />
             <div className="h-4 bg-zinc-300 rounded-full w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
