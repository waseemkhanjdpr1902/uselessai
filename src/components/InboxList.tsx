import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useInboxStore } from '../store/useInboxStore';
import { Email, OperationType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ChevronRight, User, Clock, Bell, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { translations, Language } from '../i18n';

export const InboxList: React.FC = () => {
  const { session, language } = useInboxStore();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[language as Language] || translations.English;

  useEffect(() => {
    if (!session) {
      setEmails([]);
      return;
    }

    const q = query(
      collection(db, 'inboxes', session.id, 'emails'),
      orderBy('receivedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Email[];
      setEmails(emailData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session]);

  const simulateTestEmail = async () => {
    if (!session) return;
    try {
      await addDoc(collection(db, 'inboxes', session.id, 'emails'), {
        from: "welcome@swiftmail.tmp",
        subject: "Welcome to SwiftMail!",
        body: "This is a test email to verify your inbox is working correctly. Emails appear here in real-time.",
        receivedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to send test email", e);
    }
  };

  if (!session) return null;

  return (
    <div className="bento-card overflow-hidden flex flex-col min-h-[500px]">
      <div className="px-8 py-5 border-b border-border-subtle flex justify-between items-center bg-zinc-50/50">
        <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t.messages}
          <div className="px-2 py-0.5 bg-white border border-border-subtle text-text-main text-[10px] font-bold rounded-lg shadow-sm">
            {emails.length}
          </div>
        </h2>
        <button 
          onClick={simulateTestEmail}
          className="text-text-muted hover:text-primary transition-all p-2 rounded-xl hover:bg-white border border-transparent hover:border-border-subtle shadow-none hover:shadow-sm"
          title="Receive identity confirmation"
        >
          <Bell size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex justify-center items-center h-full py-20">
              <RefreshCw size={24} className="animate-spin text-primary/30" />
            </div>
          ) : emails.length === 0 ? (
            <div className="px-12 py-24 text-center mt-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                <Mail size={48} className="relative text-primary/20 mx-auto" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-text-main mb-1">{t.waiting}</p>
              <p className="text-xs text-text-muted">{t.checkBack}</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                  className={`px-8 py-6 cursor-pointer transition-all hover:bg-zinc-50 group flex flex-col items-start ${
                    selectedEmail?.id === email.id ? 'bg-zinc-50' : ''
                  }`}
                >
                  <div className="w-full flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-[10px] font-bold text-primary">
                        {email.from.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-text-main truncate max-w-[150px] sm:max-w-none">
                        {email.from}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted tabular-nums bg-white px-2 py-1 rounded-lg border border-border-subtle">
                      {email.receivedAt?.toDate ? format(email.receivedAt.toDate(), 'HH:mm') : '--:--'}
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-between gap-4">
                    <h3 className={`text-sm font-semibold truncate flex-1 ${
                      selectedEmail?.id === email.id ? 'text-primary' : 'text-text-main/80'
                    }`}>
                      {email.subject}
                    </h3>
                    <ChevronRight size={16} className={`transition-transform duration-300 text-border-subtle group-hover:text-text-muted ${selectedEmail?.id === email.id ? 'rotate-90 text-primary' : ''}`} />
                  </div>
                  
                  <AnimatePresence>
                    {selectedEmail?.id === email.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full mt-6 overflow-hidden"
                      >
                        <div className="p-6 bg-white rounded-2xl border border-border-subtle text-sm text-text-main leading-relaxed shadow-sm whitespace-pre-wrap font-sans">
                          {email.body}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
