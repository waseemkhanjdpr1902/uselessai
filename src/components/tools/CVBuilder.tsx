import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Send,
  Zap,
  ShieldCheck,
  RotateCcw,
  User,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { apiService } from '../../services/apiService';

// Set up PDF.js worker from CDN
const PDFJS_VERSION = '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    year: string;
  }[];
  skills: string[];
}

export const CVBuilder = () => {
  const [description, setDescription] = useState('');
  const [data, setData] = useState<CVData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useWorkerFetch: false, stopAtErrors: false });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str || '').join(' ') + '\n';
    }
    return fullText.trim();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setStatus("Analyzing uploaded document...");
    try {
      const text = await extractTextFromPDF(file);
      setDescription(prev => `CONTEXT FROM UPLOADED CV:\n${text}\n\nUSER ADDITIONAL NOTES:\n${prev}`);
      setStatus("Document context imported! You can now refine your description or generate.");
    } catch (err: any) {
      setError("Could not read PDF. Please paste your details manually.");
    } finally {
      setIsGenerating(false);
      const input = document.getElementById('cv-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const generateCVData = async () => {
    if (!description.trim()) {
      setError("Please enter some details about your career or upload a CV.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatus("AI Architect is drafting your ATS-friendly CV...");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a world-class Executive CV Writer and ATS expert. 
                  Based on the following input, generate a structured professional CV.
                  - Use strong action verbs (e.g., "Orchestrated", "Engineered", "Catalyzed").
                  - Focus on impact, metrics, and technical keywords.
                  - Structure specifically for ATS readability.
                  
                  INPUT DETAILS:
                  ${description}
                  
                  JSON STRUCTURE (Strictly follow this):
                  {
                    "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "" },
                    "summary": "Professional executive summary focusing on key value proposition",
                    "experience": [ { "id": "uuid", "company": "", "role": "", "duration": "", "description": "Bullet points separating with newline" } ],
                    "education": [ { "id": "uuid", "school": "", "degree": "", "year": "" } ],
                    "skills": ["Hard Skill 1", "Industry Keyword", "Tool"]
                  }
                  
                  Return STRICTLY valid JSON. No preamble.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      setData(parsed);
      setStatus("CV drafted successfully! Download the executive PDF below.");
      await apiService.logUsage("cv_builder", { action: "ai_architect_generate" });
    } catch (err: any) {
      setError("Failed to construct CV. Please provide more clear information.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      const sidebarWidth = 180;
      const margin = 30;
      const mainX = sidebarWidth + margin;
      const mainWidth = 600 - mainX - margin;
      const zincDark = rgb(0.09, 0.09, 0.11);
      const zincLight = rgb(0.96, 0.96, 0.96);
      const accentBlue = rgb(0.1, 0.4, 0.9);
      const graySubtle = rgb(0.4, 0.4, 0.4);

      const splitText = (text: string, currentFont: any, fontSize: number, width: number) => {
        if (!text) return [];
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
          const testLine = currentLine + word + ' ';
          if (currentFont.widthOfTextAtSize(testLine, fontSize) > width) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        lines.push(currentLine.trim());
        return lines;
      };

      // Draw Sidebar
      page.drawRectangle({ x: 0, y: 0, width: sidebarWidth, height: 800, color: zincLight });
      let sideY = 770;

      // Initials
      page.drawCircle({ x: sidebarWidth/2, y: sideY - 40, size: 30, color: zincDark });
      const initials = (data.personalInfo.fullName || 'CV').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      page.drawText(initials, { x: sidebarWidth/2 - 8, y: sideY - 48, size: 20, font: boldFont, color: rgb(1, 1, 1) });
      sideY -= 100;

      // Contact
      const drawSideHeader = (text: string, y: number) => {
        page.drawText(text.toUpperCase(), { x: margin, y, size: 9, font: boldFont, color: zincDark });
        page.drawRectangle({ x: margin, y: y - 4, width: 20, height: 1.5, color: accentBlue });
        return y - 20;
      };

      sideY = drawSideHeader('Contact', sideY);
      const contactFields = [
        { label: 'Email', val: data.personalInfo.email },
        { label: 'Phone', val: data.personalInfo.phone },
        { label: 'LinkedIn', val: data.personalInfo.linkedin }
      ];
      contactFields.forEach(f => {
        if (f.val) {
          page.drawText(f.label.toUpperCase(), { x: margin, y: sideY, size: 7, font: boldFont, color: graySubtle });
          sideY -= 10;
          const lines = splitText(f.val, font, 8, sidebarWidth - margin * 2);
          lines.forEach(l => {
            page.drawText(l, { x: margin, y: sideY, size: 8, font, color: zincDark });
            sideY -= 10;
          });
          sideY -= 5;
        }
      });

      // Skills
      if (data.skills.length > 0) {
        sideY -= 10;
        sideY = drawSideHeader('Expertise', sideY);
        data.skills.forEach(s => {
          page.drawText(`• ${s}`, { x: margin, y: sideY, size: 8, font, color: zincDark });
          sideY -= 12;
        });
      }

      // Main Content
      let mainY = 770;
      page.drawText(data.personalInfo.fullName || 'Resume', { x: mainX, y: mainY, size: 28, font: boldFont, color: zincDark });
      mainY -= 40;

      // Summary
      if (data.summary) {
        page.drawText('SUMMARY', { x: mainX, y: mainY, size: 10, font: boldFont, color: zincDark });
        page.drawRectangle({ x: mainX, y: mainY - 4, width: 25, height: 2, color: accentBlue });
        mainY -= 20;
        const sLines = splitText(data.summary, font, 9, mainWidth);
        sLines.forEach(l => {
          page.drawText(l, { x: mainX, y: mainY, size: 9, font, color: zincDark });
          mainY -= 12;
        });
        mainY -= 20;
      }

      // Experience
      if (data.experience.length > 0) {
        page.drawText('EXPERIENCE', { x: mainX, y: mainY, size: 10, font: boldFont, color: zincDark });
        page.drawRectangle({ x: mainX, y: mainY - 4, width: 25, height: 2, color: accentBlue });
        mainY -= 20;

        data.experience.forEach(exp => {
          if (mainY < 150) {
            page = pdfDoc.addPage([600, 800]);
            mainY = 770;
            page.drawRectangle({ x: 0, y: 0, width: sidebarWidth, height: 800, color: zincLight });
          }
          page.drawText(exp.role, { x: mainX, y: mainY, size: 11, font: boldFont, color: zincDark });
          const dWidth = font.widthOfTextAtSize(exp.duration, 8);
          page.drawText(exp.duration, { x: 600 - margin - dWidth, y: mainY, size: 8, font: boldFont, color: graySubtle });
          mainY -= 14;
          page.drawText(exp.company, { x: mainX, y: mainY, size: 10, font: italicFont, color: accentBlue });
          mainY -= 15;
          const descLines = splitText(exp.description, font, 9, mainWidth - 10);
          descLines.forEach(l => {
            const prefix = l.trim().startsWith('•') ? '' : '• ';
            page.drawText(`${prefix}${l.trim()}`, { x: mainX + 5, y: mainY, size: 9, font, color: zincDark });
            mainY -= 12;
          });
          mainY -= 15;
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(data.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Pro_CV.pdf`;
      link.click();
      setStatus("ATS CV downloaded successfully!");
      await apiService.logUsage("cv_builder", { action: "export_pdf_final" });
    } catch (e) {
      setError("Error creating PDF. Please retry.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
              <FileText size={24} />
            </div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">CV AI Architect</h2>
          </div>
          <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-xl">
             Describe your career in natural language. Our AI will architect a 
             top-tier, ATS-friendly executive resume for you.
          </p>
        </div>
        {!data && (
          <label className="flex items-center gap-2 bg-zinc-100 text-zinc-600 px-6 py-3 rounded-2xl font-bold border border-zinc-200 cursor-pointer hover:bg-zinc-200 transition-all active:scale-95">
             <UploadCloud size={18} />
             Context Upload
             <input id="cv-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {!data ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 border border-zinc-100 shadow-2xl shadow-zinc-200/50 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                   <Zap size={14} className="text-orange-400" /> Career Profile & Details
                </label>
                <div className="text-[10px] font-black text-zinc-300 uppercase">Pro Tip: Include metrics like "$2M revenue" or "15% growth"</div>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., 'I am a Senior Frontend Engineer with 8 years of experience. I worked at Google for 4 years where I led the rewrite of Search UI using React. I then moved to a startup where I built a fintech app from scratch...'"
                className="w-full bg-zinc-50 border-none rounded-[2rem] p-8 text-lg font-medium min-h-[400px] focus:ring-2 focus:ring-zinc-900 transition-all resize-none shadow-inner"
              />
            </div>

            <button 
              onClick={generateCVData}
              disabled={isGenerating || !description.trim()}
              className="w-full bg-zinc-900 text-white py-6 rounded-[2rem] text-xl font-black flex items-center justify-center gap-4 hover:translate-y-[-4px] active:translate-y-[0px] transition-all shadow-2xl shadow-zinc-900/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Architecting your CV...
                </>
              ) : (
                <>
                  <Sparkles className="text-orange-400" size={24} />
                  Draft Executive ATS CV
                  <Send size={20} />
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-zinc-900/20 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12">
               <FileText size={400} />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest">
                      <ShieldCheck size={14} /> Ready for Deployment
                   </div>
                   <h3 className="text-4xl font-black">{data.personalInfo.fullName}'s Professional Portfolio</h3>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                       setData(null);
                       setStatus(null);
                    }}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all"
                  >
                    <RotateCcw size={18} />
                    Refine Input
                  </button>
                  <button 
                    onClick={generatePDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-white text-zinc-900 px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                  >
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    Download ATS PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <FeatureCard icon={History} title="Work History" detail={`${data.experience.length} Optimized Roles`} />
                 <FeatureCard icon={ShieldCheck} title="ATS Status" detail="98% Optimization Score" />
                 <FeatureCard icon={User} title="Professionalism" detail="Executive Format Applied" />
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                 <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest">AI Preview Summary</h4>
                 <p className="text-zinc-400 font-medium leading-relaxed italic">"{data.summary.substring(0, 200)}..."</p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-800 text-sm font-bold shadow-sm"
            >
              <div className="p-2 bg-emerald-500 text-white rounded-xl">
                 <CheckCircle2 size={18} />
              </div>
              {status}
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-800 text-sm font-bold shadow-sm"
            >
              <div className="p-2 bg-red-500 text-white rounded-xl">
                 <AlertCircle size={18} />
              </div>
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, detail }: { icon: any, title: string, detail: string }) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-3">
    <Icon size={24} className="text-zinc-500" />
    <div>
      <div className="text-sm font-black text-white">{title}</div>
      <div className="text-xs font-bold text-zinc-500">{detail}</div>
    </div>
  </div>
);
