import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { BarChart3, TrendingUp, Clock, Zap, Activity, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    tempMail: 0,
    qrGen: 0,
    shortener: 0,
    aiWriter: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const snap = await getDocs(q);
    const data = snap.docs.map(doc => doc.data());
    setLogs(data);

    // Calc totals
    const counts = data.reduce((acc: any, log: any) => {
      acc[log.tool] = (acc[log.tool] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: data.length,
      tempMail: counts.temp_mail || 0,
      qrGen: counts.qrcode || 0,
      shortener: counts.shortener || 0,
      aiWriter: counts.ai_writer || 0
    });
  };

  const statCards = [
    { name: 'Total Operations', value: stats.total, icon: Activity, color: 'text-zinc-900', bg: 'bg-zinc-100' },
    { name: 'Identity Gen', value: stats.tempMail, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Visual Codes', value: stats.qrGen, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between"
          >
             <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.name}</p>
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden">
           <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                 <TrendingUp size={18} className="text-zinc-400" /> 
                 Recent Activity
              </h4>
              <button onClick={fetchStats} className="text-xs font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-900 transition-colors">Refresh</button>
           </div>
           <div className="divide-y divide-zinc-50">
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                         {log.tool === 'qrcode' && <Zap size={18} />}
                         {log.tool === 'shortener' && <Zap size={18} />}
                         {log.tool === 'ai_writer' && <Zap size={18} />}
                      </div>
                      <div>
                         <p className="text-sm font-bold capitalize">{log.tool.replace('_', ' ')}</p>
                         <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">SUCCESS • SECURE</p>
                      </div>
                   </div>
                   <p className="text-xs font-mono text-zinc-300">{new Date(log.timestamp?.toDate ? log.timestamp.toDate() : Date.now()).toLocaleTimeString()}</p>
                </div>
              )) : (
                 <div className="py-20 text-center opacity-20 filter grayscale space-y-4">
                    <BarChart3 size={60} strokeWidth={1} className="mx-auto" />
                    <p className="font-medium text-sm">No activity recorded for this session.</p>
                 </div>
              )}
           </div>
        </div>

        <div className="bg-zinc-900 text-white rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100/5 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="relative z-10 space-y-6">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                 <Info size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold leading-tight">Secure Your <br /> Digital Identity.</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">UtilityNest AI handles 100k+ operations daily with zero data retention for free users.</p>
              
              <div className="pt-4 space-y-3">
                 <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                    <span className="text-zinc-500">Global Privacy Index</span>
                    <span className="text-green-400">A+ Stable</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-3">
                    <span className="text-zinc-500">Threat Monitoring</span>
                    <span className="text-blue-400">ACTIVE</span>
                 </div>
              </div>
           </div>
           
           <button className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-zinc-900/50 hover:bg-zinc-100 transition-all relative z-10">
              Upgrade to Infinity
           </button>
        </div>
      </div>
    </div>
  );
};
