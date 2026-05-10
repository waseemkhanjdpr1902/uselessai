import React, { useEffect, useState } from 'react';
import { useInboxStore } from '../store/useInboxStore';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { translations, Language } from '../i18n';

export const Countdown: React.FC = () => {
  const { session, extendSession, clearSession, language } = useInboxStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const t = translations[language as Language] || translations.English;

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, session.expiresAt - now);
      setTimeLeft(diff);

      if (diff === 0) {
        clearSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, clearSession]);

  if (!session) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const handleExtend = async () => {
    extendSession(10);
    // Also update in Firestore if needed, but for now we'll keep it simple
    try {
      const inboxRef = doc(db, 'inboxes', session.id);
      await updateDoc(inboxRef, {
        expiresAt: Timestamp.fromMillis(session.expiresAt + 10 * 60 * 1000)
      });
    } catch (e) {
      console.error("Failed to update expiration in DB", e);
    }
  };

  const totalDuration = 10 * 60 * 1000; // Original duration is 10 mins
  const progress = Math.min(100, (timeLeft / totalDuration) * 100);

  return (
    <div className="max-w-md mx-auto w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${timeLeft < 120000 ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{t.timeLeft}</span>
        </div>
        <div className="text-3xl font-mono font-bold text-text-main tabular-nums tracking-tight">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="h-3 bg-white border border-border-subtle rounded-full overflow-hidden shadow-inner p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 1 }}
          className={`h-full rounded-full transition-colors duration-500 ${
            timeLeft < 120000 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_15px_rgba(0,102,255,0.4)]'
          }`}
        />
      </div>
    </div>
  );
};
