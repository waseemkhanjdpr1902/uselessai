import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  QrCode, 
  Link, 
  FileText, 
  PenTool, 
  BarChart3, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Shield,
  Zap,
  Globe,
  Plus,
  Receipt,
  Scale,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { apiService } from './services/apiService';

// Tool Components
import { TempMail } from './components/tools/TempMail';
import { QRGen } from './components/tools/QRGen';
import { SecuritySuite } from './components/tools/SecuritySuite';
import { AIWriter } from './components/tools/AIWriter';
import { CVBuilder } from './components/tools/CVBuilder';
import InvoiceGenerator from './components/tools/InvoiceGenerator';
import LegalTemplates from './components/tools/LegalTemplates';
import FinanceCalcs from './components/tools/FinanceCalcs';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('temp-mail');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (val) => setUser(val));
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const navItems = [
    { id: 'temp-mail', name: 'Temp Mail', icon: Mail, color: 'text-blue-500' },
    { id: 'qr-gen', name: 'QR Generator', icon: QrCode, color: 'text-purple-500' },
    { id: 'security-suite', name: 'Security', icon: ShieldCheck, color: 'text-orange-500' },
    { id: 'ai-writer', name: 'AI Writer', icon: PenTool, color: 'text-purple-500' },
    { id: 'cv-builder', name: 'CV Creator', icon: FileText, color: 'text-indigo-500' },
    { id: 'invoice-gen', name: 'Invoices', icon: Receipt, color: 'text-rose-500' },
    { id: 'legal-docs', name: 'Legal Hub', icon: Scale, color: 'text-emerald-500' },
    { id: 'finance-hub', name: 'Finance Pro', icon: Calculator, color: 'text-amber-500' },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'text-zinc-500' },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-zinc-200 flex flex-col z-50 sticky top-0"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">UtilityNest</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-zinc-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
                  : 'hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : item.color} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          {user ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-full border border-zinc-200" alt="avatar" />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user.displayName}</p>
                  <button onClick={() => signOut(auth)} className="text-xs text-red-500 font-medium hover:underline">Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 py-3 rounded-xl font-bold transition-all"
            >
              <UserIcon size={18} />
              {isSidebarOpen && <span>Sign In</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/70 backdrop-blur-md border-b border-zinc-200 p-6 flex justify-between items-center shrink-0 z-40 px-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            <div className="h-6 w-[1px] bg-zinc-300 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
              <Shield size={12} />
              Verified Secure
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3 hover:bg-zinc-100 rounded-full transition-colors relative">
               <Globe size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
            </button>
            <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zinc-200 hover:scale-105 active:scale-95 transition-all">
              Go Pro
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#FAF9F6]">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="max-w-6xl mx-auto"
             >
               {activeTab === 'temp-mail' && <TempMail />}
               {activeTab === 'qr-gen' && <QRGen />}
               {activeTab === 'security-suite' && <SecuritySuite />}
               {activeTab === 'ai-writer' && <AIWriter />}
               {activeTab === 'cv-builder' && <CVBuilder />}
               {activeTab === 'invoice-gen' && <InvoiceGenerator />}
               {activeTab === 'legal-docs' && <LegalTemplates />}
               {activeTab === 'finance-hub' && <FinanceCalcs />}
               {activeTab === 'dashboard' && <Dashboard />}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
