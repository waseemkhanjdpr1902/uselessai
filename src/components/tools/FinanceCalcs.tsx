import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Percent, 
  ArrowRight,
  RefreshCw,
  PieChart as PieChartIcon,
  Info,
  DollarSign,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CURRENCIES } from '../../constants/currencies';
import { CurrencySelector } from '../CurrencySelector';

type CalcType = 'loan' | 'investment' | 'mutualfund' | 'tax';

export default function FinanceCalcs() {
  const [activeType, setActiveType] = useState<CalcType>('loan');
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default USD

  // Loan Calc State
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // Investment Calc State
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [years, setYears] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(7);

  // Mutual Fund State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipDuration, setSipDuration] = useState(10);
  const [sipRate, setSipRate] = useState(12);

  const loanResults = useMemo(() => {
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;
    const monthly = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - loanAmount;
    return { monthly, totalPaid, totalInterest };
  }, [loanAmount, interestRate, loanTerm]);

  const investmentResults = useMemo(() => {
    let total = initialInvestment;
    const r = expectedReturn / 100 / 12;
    const n = years * 12;
    for (let i = 0; i < n; i++) {
      total = (total + monthlyContrib) * (1 + r);
    }
    const totalContrib = initialInvestment + (monthlyContrib * n);
    const returns = total - totalContrib;
    return { total, totalContrib, returns };
  }, [initialInvestment, monthlyContrib, years, expectedReturn]);

  const sipResults = useMemo(() => {
    const i = sipRate / 100 / 12;
    const n = sipDuration * 12;
    // SIP Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
    const maturity = sipAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = sipAmount * n;
    const gains = maturity - invested;
    return { maturity, invested, gains };
  }, [sipAmount, sipDuration, sipRate]);

  const COLORS = ['#18181b', '#fb923c'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-100">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">Finance Pro Hub</h1>
          <p className="text-zinc-500 font-medium text-lg">Smart calculators for mortgages, investments, and taxes.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
           {[
             { id: 'loan', label: 'Loan', icon: Wallet },
             { id: 'investment', label: 'Returns', icon: TrendingUp },
             { id: 'mutualfund', label: 'Mutual Fund', icon: RefreshCw },
             { id: 'tax', label: 'Tax', icon: Percent }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveType(tab.id as CalcType)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                 activeType === tab.id 
                 ? 'bg-zinc-900 text-white shadow-lg' 
                 : 'text-zinc-500 hover:text-zinc-900'
               }`}
             >
               <tab.icon size={14} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            key={activeType}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-100 border border-zinc-100 space-y-6"
          >
            {activeType === 'loan' && (
              <>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{currency.symbol}</span>
                    <input 
                      type="number" 
                      value={loanAmount} 
                      onChange={e => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 pl-10 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Interest Rate (%)</label>
                  <input 
                    type="range" min="0" max="15" step="0.1" 
                    value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
                    className="w-full accent-zinc-900"
                  />
                  <div className="flex justify-between font-bold text-zinc-900">{interestRate}%</div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Term (Years)</label>
                  <select 
                    value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-bold"
                  >
                    <option value={10}>10 Years</option>
                    <option value={15}>15 Years</option>
                    <option value={20}>20 Years</option>
                    <option value={30}>30 Years</option>
                  </select>
                </div>
              </>
            )}

            {activeType === 'investment' && (
              <>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Initial Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{currency.symbol}</span>
                    <input 
                      type="number" 
                      value={initialInvestment} 
                      onChange={e => setInitialInvestment(Number(e.target.value))}
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 pl-10 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Monthly Contribution</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{currency.symbol}</span>
                    <input 
                      type="number" 
                      value={monthlyContrib} 
                      onChange={e => setMonthlyContrib(Number(e.target.value))}
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 pl-10 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rate of Return (%)</label>
                  <input 
                    type="range" min="1" max="20" step="0.5" 
                    value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-orange-400"
                  />
                  <div className="flex justify-between font-bold text-zinc-900">{expectedReturn}%</div>
                </div>
              </>
            )}

            {activeType === 'mutualfund' && (
              <>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Monthly SIP Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">{currency.symbol}</span>
                    <input 
                      type="number" 
                      value={sipAmount} 
                      onChange={e => setSipAmount(Number(e.target.value))}
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 pl-10 font-black text-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Investment Period (Years)</label>
                  <input 
                    type="range" min="1" max="40" step="1" 
                    value={sipDuration} onChange={e => setSipDuration(Number(e.target.value))}
                    className="w-full accent-zinc-900"
                  />
                  <div className="flex justify-between font-bold text-zinc-900">{sipDuration} Years</div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Expected Annual Return (%)</label>
                  <input 
                    type="range" min="1" max="30" step="0.5" 
                    value={sipRate} onChange={e => setSipRate(Number(e.target.value))}
                    className="w-full accent-orange-400"
                  />
                  <div className="flex justify-between font-bold text-zinc-900">{sipRate}%</div>
                </div>
              </>
            )}

            {activeType === 'tax' && (
               <div className="p-8 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                  <Percent size={40} className="mx-auto text-zinc-300 mb-4" />
                  <p className="font-bold text-zinc-500">Global tax rules vary. This tool is coming soon following regional localized packs.</p>
               </div>
            )}
          </motion.div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-100 border border-zinc-100">
            <CurrencySelector 
              value={currency.code}
              onChange={setCurrency}
            />
          </div>
        </div>

        {/* Results Viz */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="bg-zinc-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-10">
                <header>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Estimated Result</h3>
                  <div className="text-5xl font-black text-orange-400">
                    {currency.symbol}{activeType === 'loan' 
                      ? loanResults.monthly.toLocaleString('en-US', { maximumFractionDigits: 0 }) 
                      : activeType === 'investment'
                      ? investmentResults.total.toLocaleString('en-US', { maximumFractionDigits: 0 })
                      : sipResults.maturity.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    }
                    <span className="text-lg text-zinc-600 ml-2 font-black uppercase tracking-widest">
                      {activeType === 'loan' ? '/ Month' : ' Total'}
                    </span>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                      {activeType === 'loan' ? 'Total Interest' : activeType === 'investment' ? 'Total Returns' : 'Est. Wealth Gain'}
                    </p>
                    <p className="text-2xl font-black">
                      {currency.symbol}{activeType === 'loan' 
                        ? loanResults.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                        : activeType === 'investment'
                        ? investmentResults.returns.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : sipResults.gains.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      }
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                      {activeType === 'loan' ? 'Total Payments' : 'Total Contributions'}
                    </p>
                    <p className="text-2xl font-black">
                       {currency.symbol}{activeType === 'loan' 
                        ? loanResults.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                        : activeType === 'investment'
                        ? investmentResults.totalContrib.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : sipResults.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      }
                    </p>
                  </div>
                </div>
             </div>

             <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <DollarSign size={300} strokeWidth={10} />
             </div>
           </section>

           <section className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-100 flex flex-col items-center justify-center">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 self-start">Visual Breakdown</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeType === 'loan' 
                        ? [
                            { name: 'Principal', value: loanAmount },
                            { name: 'Interest', value: loanResults.totalInterest }
                          ]
                        : activeType === 'investment'
                        ? [
                            { name: 'Contributions', value: investmentResults.totalContrib },
                            { name: 'Compound Returns', value: investmentResults.returns }
                          ]
                        : [
                            { name: 'Invested', value: sipResults.invested },
                            { name: 'Wealth Gain', value: sipResults.gains }
                          ]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, idx) => <Cell key={idx} fill={color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3 mt-4">
                 <div className="flex justify-between items-center text-xs font-black">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-900" /> {activeType === 'loan' ? 'Principal' : activeType === 'investment' ? 'Savings' : 'Invested'}</div>
                   <span>{activeType === 'loan' ? 'Fixed' : 'Variable'}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-black">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> {activeType === 'loan' ? 'Interest' : activeType === 'investment' ? 'Profit' : 'Returns'}</div>
                   <span>Dynamic</span>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
