import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  Hash,
  Info,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { CURRENCIES } from '../../constants/currencies';
import { CurrencySelector } from '../CurrencySelector';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGenerator() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting Services', quantity: 1, rate: 100 }
  ]);
  const [invoiceInfo, setInvoiceInfo] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    fromName: '',
    fromEmail: '',
    toName: '',
    toEmail: '',
    notes: 'Thank you for your business!',
    currency: '$'
  });
  const [isExporting, setIsExporting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1; // Default 10% tax
  const total = subtotal + tax;

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let y = 750;
      const margin = 50;

      // Header
      page.drawText('INVOICE', { x: margin, y, size: 30, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
      y -= 40;

      // Invoice Details
      page.drawText(`Invoice #: ${invoiceInfo.invoiceNumber}`, { x: margin, y, size: 10, font });
      page.drawText(`Date: ${invoiceInfo.date}`, { x: 450, y, size: 10, font });
      y -= 40;

      // From / To
      page.drawText('FROM', { x: margin, y, size: 10, font: boldFont });
      page.drawText('BILL TO', { x: 300, y, size: 10, font: boldFont });
      y -= 15;
      page.drawText(invoiceInfo.fromName || 'Your Name', { x: margin, y, size: 10, font });
      page.drawText(invoiceInfo.toName || 'Client Name', { x: 300, y, size: 10, font });
      y -= 15;
      page.drawText(invoiceInfo.fromEmail || 'your@email.com', { x: margin, y, size: 10, font });
      page.drawText(invoiceInfo.toEmail || 'client@email.com', { x: 300, y, size: 10, font });
      y -= 40;

      // Table Header
      page.drawRectangle({ x: margin, y: y - 5, width: 500, height: 20, color: rgb(0.95, 0.95, 0.95) });
      page.drawText('Description', { x: margin + 5, y, size: 10, font: boldFont });
      page.drawText('Qty', { x: 350, y, size: 10, font: boldFont });
      page.drawText('Rate', { x: 410, y, size: 10, font: boldFont });
      page.drawText('Amount', { x: 480, y, size: 10, font: boldFont });
      y -= 25;

      // Items
      items.forEach(item => {
        page.drawText(item.description || 'Service', { x: margin + 5, y, size: 10, font });
        page.drawText(item.quantity.toString(), { x: 350, y, size: 10, font });
        page.drawText(`${invoiceInfo.currency}${item.rate.toFixed(2)}`, { x: 410, y, size: 10, font });
        page.drawText(`${invoiceInfo.currency}${(item.quantity * item.rate).toFixed(2)}`, { x: 480, y, size: 10, font });
        y -= 20;
      });

      y -= 20;
      // Totals
      page.drawText('Subtotal:', { x: 400, y, size: 10, font });
      page.drawText(`${invoiceInfo.currency}${subtotal.toFixed(2)}`, { x: 480, y, size: 10, font });
      y -= 15;
      page.drawText('Tax (10%):', { x: 400, y, size: 10, font });
      page.drawText(`${invoiceInfo.currency}${tax.toFixed(2)}`, { x: 480, y, size: 10, font });
      y -= 20;
      page.drawRectangle({ x: 390, y: y - 5, width: 160, height: 25, color: rgb(0.1, 0.4, 0.9) });
      page.drawText('TOTAL:', { x: 400, y, size: 12, font: boldFont, color: rgb(1, 1, 1) });
      page.drawText(`${invoiceInfo.currency}${total.toFixed(2)}`, { x: 480, y, size: 12, font: boldFont, color: rgb(1, 1, 1) });

      // Notes
      if (invoiceInfo.notes) {
        y -= 60;
        page.drawText('NOTES', { x: margin, y, size: 10, font: boldFont });
        y -= 15;
        page.drawText(invoiceInfo.notes, { x: margin, y, size: 9, font });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceInfo.invoiceNumber}.pdf`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">Professional Invoice</h1>
          <p className="text-zinc-500 font-medium">Create and send high-quality invoices in seconds.</p>
        </div>
        <button 
          onClick={generatePDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isExporting ? <DollarSign className="animate-spin" size={20} /> : <Download size={20} />}
          Export PDF Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Invoice Data */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                  <Hash size={12} /> Invoice Number
                </label>
                <input 
                  type="text" 
                  value={invoiceInfo.invoiceNumber}
                  onChange={e => setInvoiceInfo({...invoiceInfo, invoiceNumber: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2">
                  <Calendar size={12} /> Billing Date
                </label>
                <input 
                  type="date" 
                  value={invoiceInfo.date}
                  onChange={e => setInvoiceInfo({...invoiceInfo, date: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-zinc-400 border-b pb-2">Sender (From)</h3>
                <input 
                  placeholder="Your Business Name" 
                  value={invoiceInfo.fromName}
                  onChange={e => setInvoiceInfo({...invoiceInfo, fromName: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium"
                />
                <input 
                  placeholder="Your Email" 
                  value={invoiceInfo.fromEmail}
                  onChange={e => setInvoiceInfo({...invoiceInfo, fromEmail: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-zinc-400 border-b pb-2">Client (Bill To)</h3>
                <input 
                  placeholder="Client Name" 
                  value={invoiceInfo.toName}
                  onChange={e => setInvoiceInfo({...invoiceInfo, toName: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium"
                />
                <input 
                  placeholder="Client Email" 
                  value={invoiceInfo.toEmail}
                  onChange={e => setInvoiceInfo({...invoiceInfo, toEmail: e.target.value})}
                  className="w-full bg-zinc-50 border-none rounded-xl p-4 font-medium"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-zinc-900 underline decoration-zinc-200 decoration-4">Line Items</h3>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-12 gap-3 items-center group"
                  >
                    <div className="col-span-6">
                      <input 
                        placeholder="Item Description" 
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="w-full bg-zinc-50 border-none rounded-xl p-3 font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-50 border-none rounded-xl p-3 font-medium text-center"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">{invoiceInfo.currency}</span>
                        <input 
                          type="number" 
                          placeholder="Rate" 
                          value={item.rate}
                          onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-zinc-50 border-none rounded-xl p-3 pl-7 font-medium"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
           <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100">
              <CurrencySelector 
                value={CURRENCIES.find(c => c.symbol === invoiceInfo.currency)?.code || 'USD'}
                onChange={selected => setInvoiceInfo({...invoiceInfo, currency: selected.symbol})}
              />
           </section>

           <section className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl shadow-zinc-200">
             <h3 className="text-xs font-black tracking-widest uppercase text-zinc-500 mb-6 flex items-center gap-2">
               <DollarSign size={14} /> Totals View
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center text-zinc-400 font-medium">
                 <span>Subtotal</span>
                 <span>{invoiceInfo.currency}{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-zinc-400 font-medium">
                 <span>Tax (10%)</span>
                 <span>{invoiceInfo.currency}{tax.toFixed(2)}</span>
               </div>
               <div className="h-px bg-zinc-800 my-4" />
               <div className="flex justify-between items-center">
                 <span className="text-lg font-black">TOTAL</span>
                 <span className="text-2xl font-black text-orange-400">
                   {invoiceInfo.currency}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                 </span>
               </div>
             </div>
           </section>

           <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100 space-y-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-zinc-400 flex items-center gap-2">
                <Info size={14} /> Notes & Terms
              </h3>
              <textarea 
                placeholder="Additional notes, payment terms, etc."
                value={invoiceInfo.notes}
                onChange={e => setInvoiceInfo({...invoiceInfo, notes: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl p-4 font-medium h-32 resize-none focus:ring-2 focus:ring-zinc-900 transition-all"
              />
           </section>
        </div>
      </div>
    </div>
  );
}
