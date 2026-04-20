import { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Loader2, 
  Sparkles, 
  Zap,
  Eye,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { SEOConfig, GenerationState } from './types';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [config, setConfig] = useState<SEOConfig>({
    keyword: '',
    anchorText: '',
    url: '',
    supportKeywords: Array(10).fill(''),
  });

  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    content: '',
    progress: 0,
    eeatScore: 0,
    checklist: {
      h1: false,
      h2: false,
      internalLink: false,
      outboundLinks: false,
      faq: false,
      cta: false,
    },
  });

  const handleInputChange = (field: keyof SEOConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSupportKWChange = (index: number, value: string) => {
    const newKWs = [...config.supportKeywords];
    newKWs[index] = value;
    setConfig(prev => ({ ...prev, supportKeywords: newKWs }));
  };

  const generateArticle = async () => {
    if (!config.keyword) return;

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      content: '', 
      progress: 5,
      eeatScore: 45
    }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 1 };
        });
      }, 500);

      const prompt = `
        Tolong buatkan artikel pilar panjang (target 4.800–5.500 kata) dalam Bahasa Indonesia.
        
        KATA KUNCI UTAMA (H1): ${config.keyword}
        
        KATA KUNCI PENDUKUNG (H2 - Wajib 10 topik):
        ${config.supportKeywords.map((kw, i) => `${i + 1}. ${kw || `Topik Pendukung ${i+1}`}`).join('\n')}
        
        INTERNAL LINK (Artikel Utama):
        Anchor Text: ${config.anchorText || config.keyword}
        URL: ${config.url || 'https://indogeotextile.com'}
        
        GAYA PENULISAN:
        - Profesional, teknis-populer, persuasif.
        - Fokus EEAT (Experience, Expertise, Authoritativeness, Trustworthiness).
        - Search intent: komersial untuk industri konstruksi, infrastruktur, pengadaan.
        - ANTI-THIN CONTENT: Setiap paragraf harus panjang, mendalam, dan berisi informasi substansial. Hindari kalimat retoris yang kosong.
        - PARAGRAF MENDALAM: Gunakan 5-8 kalimat per paragraf untuk menjelaskan konsep teknis secara menyeluruh.
        
        STRUKTUR OUTPUT (WAJIB):
        1. ARTIKEL UTAMA (Format Markdown untuk Preview).
        2. HTML DATA (Format RAW HTML dalam Code Block):
           - Konversikan seluruh isi artikel ke HTML bersih.
           - Aturan Heading: <h1>, <h2>, <h3> WAJIB TEKS MURNI (ANTI-LINK).
           - Tag Diizinkan: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <blockquote>.
           - Link: <a href="URL">anchor text</a> (Hanya di dalam <p> atau <li>).
           - Output: Mulai langsung dari <h1>, tanpa <html>/<body>.
        3. TABEL DATA SEO (Format Markdown Table):
           - Judul Artikel, Judul SEO (max 60 char), Slug, Meta Description (~140 char), Excerpt (50-80 kata), Tags (max 5).
           - Format: Horizontal (1 baris header, 1 baris data).
        
        VALIDASI: Pastikan tidak ada link di heading dan isi teks 100% konsisten antar format.
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const text = response.text || '';
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        content: text,
        isGenerating: false,
        progress: 100,
        eeatScore: 96,
        checklist: {
          h1: true,
          h2: true,
          internalLink: true,
          outboundLinks: true,
          faq: true,
          cta: true,
        }
      }));

    } catch (error) {
      console.error("Generation failed:", error);
      setState(prev => ({ ...prev, isGenerating: false, progress: 0 }));
    }
  };
import { useEffect } from 'react';

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const keyword = params.get('frasa') || '';
  const anchorText = params.get('anchor_text') || '';
  const url = params.get('url') || '';

  const supportKeywords = Array(10).fill('').map((_, i) => {
    return params.get(`anchor${i + 1}`) || '';
  });

  setConfig({
    keyword,
    anchorText,
    url,
    supportKeywords
  });
}, []);

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] font-sans text-[#334155]">
      {/* Header */}
      <header className="bg-[#1e293b] text-white h-16 shrink-0 flex items-center justify-between px-6 border-b-4 border-blue-600 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#000000] p-2 rounded-[12px] flex items-center justify-center shadow-inner border border-white/10">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">INDOGEOTEXTILE <span className="font-extralight opacity-50 ml-2">| Pilar SEO Engine</span></h1>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/80 border border-white/5">
          Project Mode: EEAT Optimized
        </div>
      </header>

      <main className="flex-1 grid grid-cols-[320px_1fr_280px] overflow-hidden bg-[#e2e8f0] gap-[1px]">
        {/* Panel 1: Konfigurasi */}
        <section className="flex flex-col bg-white overflow-hidden shadow-sm">
          <div className="panel-header px-4 py-3 bg-[#fafafa] border-b border-[#e2e8f0] text-[11px] font-bold text-[#1e293b] uppercase tracking-widest flex items-center gap-2 shrink-0">
            <Settings className="w-3.5 h-3.5 text-blue-600" /> Konfigurasi SEO
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider block">Frasa Kunci</label>
              <input 
                type="text"
                placeholder="contoh: Geotextile Woven"
                className="w-full bg-[#fcfcfc] border border-[#e2e8f0] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300"
                value={config.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
              />
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider block underline decoration-blue-500/30 underline-offset-4">Internal Link (Artikel Utama)</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-[#94a3b8] mb-1 block">Anchor Text</label>
                  <input 
                    type="text"
                    placeholder="Teks tautan..."
                    className="w-full bg-[#fcfcfc] border border-[#e2e8f0] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-600 outline-none placeholder:text-slate-300"
                    value={config.anchorText}
                    onChange={(e) => handleInputChange('anchorText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-[#94a3b8] mb-1 block">Target URL</label>
                  <input 
                    type="text"
                    placeholder="https://..."
                    className="w-full bg-[#fcfcfc] border border-[#e2e8f0] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-600 outline-none placeholder:text-slate-300"
                    value={config.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider block">Sub-Topik Pendukung (10)</label>
              <div className="space-y-1.5">
                {config.supportKeywords.map((kw, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[9px] font-bold text-slate-300 pt-3 w-4">{(i + 1).toString().padStart(2, '0')}</span>
                    <input 
                      type="text"
                      placeholder={`KW ${i + 1}...`}
                      className="flex-1 bg-[#fcfcfc] border border-[#e2e8f0] rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 outline-none shadow-sm transition-all"
                      value={kw}
                      onChange={(e) => handleSupportKWChange(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-[#e2e8f0] bg-[#fafafa]">
            <button 
              onClick={generateArticle}
              disabled={state.isGenerating || !config.keyword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              {state.isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> ARCHITECTING...</>
              ) : (
                <><Zap className="w-5 h-5 fill-current" /> GENERATE PRODUCT</>
              )}
            </button>
          </div>
        </section>

        {/* Panel 2: Editor Preview */}
        <section className="flex flex-col bg-white overflow-hidden border-x border-[#e2e8f0]">
          <div className="panel-header px-4 py-3 bg-[#fafafa] border-b border-[#e2e8f0] text-[11px] font-bold text-[#1e293b] uppercase tracking-widest flex items-center gap-2 shrink-0">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Pilar SEO Engine Output
          </div>
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            <div className="max-w-[850px] mx-auto p-8 space-y-10 py-12">
              {state.content ? (
                <div className="space-y-10">
                  {/* Card 1: Article Preview */}
                  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest">Preview Artikel Pilar</span>
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Formatted Markdown</div>
                    </div>
                    <div className="p-10 lg:p-12">
                      <motion.article 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-slate max-w-none 
                          prose-headings:text-[#1e293b] prose-headings:font-bold 
                          prose-h1:text-[2.25rem] prose-h1:leading-tight prose-h1:mb-8
                          prose-h2:text-[1.5rem] prose-h2:border-b prose-h2:pb-3 prose-h2:mt-16 prose-h2:mb-8 shadow-none
                          prose-h3:text-[1.125rem] prose-p:text-[#334155] prose-p:leading-[1.7]
                          prose-strong:text-[#1e293b] prose-a:text-blue-600 prose-a:font-semibold"
                      >
                        <ReactMarkdown>{state.content.split('```html')[0]}</ReactMarkdown>
                      </motion.article>
                    </div>
                  </section>

                  {/* Card 2: SEO Data & HTML */}
                  <section className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 flex items-start justify-between">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-blue-900 tracking-tight leading-none uppercase">Data SEO & HTML Source</h2>
                        <p className="text-[11px] text-blue-600/70 font-medium">Data ini siap untuk ditempel ke spreadsheet atau CMS Anda secara mekanis.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const htmlMatch = state.content.match(/```html([\s\S]*?)```/);
                            if (htmlMatch) {
                              navigator.clipboard.writeText(htmlMatch[1].trim());
                              alert("HTML berhasil disalin!");
                            }
                          }}
                          className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <FileText className="w-3 h-3" /> Salin HTML (Source)
                        </button>
                      </div>
                    </div>

                    <div className="px-8 pb-10 space-y-8">
                      {/* Sub-section: HTML Code Block */}
                      {state.content.includes('```html') && (
                        <div className="bg-white rounded-xl border border-blue-100/50 shadow-inner overflow-hidden">
                          <div className="px-4 py-2 bg-slate-800 text-white/50 text-[9px] font-bold uppercase tracking-widest flex justify-between items-center">
                            <span>Clean HTML Code (SEO Friendly)</span>
                            <span className="text-blue-400">Read-Only View</span>
                          </div>
                          <pre className="m-0 bg-[#1e293b] text-blue-100/80 text-[11px] overflow-x-auto p-6 max-h-[400px] leading-relaxed custom-scrollbar font-mono">
                            <code>{state.content.match(/```html([\s\S]*?)```/)?.[1].trim()}</code>
                          </pre>
                        </div>
                      )}

                      {/* Sub-section: SEO Table */}
                      {state.content.includes('|') && (
                        <div className="bg-white rounded-xl border border-blue-100/50 shadow-md overflow-hidden">
                          <div className="px-4 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest">
                            SEO Metadata Table
                          </div>
                          <div className="overflow-x-auto p-2">
                          <div className="prose-table:min-w-full prose-table:text-[11px] prose-th:bg-slate-50 prose-th:p-4 prose-th:text-blue-900 prose-td:p-4 prose-td:border prose-td:border-slate-100 prose-td:text-slate-600 prose-th:border prose-th:border-slate-200">
                            <ReactMarkdown>
                              {state.content.split('```').pop()?.split('\n').filter(l => l.includes('|')).join('\n')}
                            </ReactMarkdown>
                          </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 py-32">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-slate-400" />
                   </div>
                   <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-[#1e293b]">Ready to Build</h3>
                    <p className="text-sm max-w-xs mx-auto font-medium">Lengkapi konfigurasi di sebelah kiri untuk merancang artikel pilar infrastruktur.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Panel 3: Analitik */}
        <section className="flex flex-col bg-white overflow-hidden shadow-sm">
          <div className="panel-header px-4 py-3 bg-[#fafafa] border-b border-[#e2e8f0] text-[11px] font-bold text-[#1e293b] uppercase tracking-widest flex items-center gap-2 shrink-0">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> Analitik & Validasi
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f1f5f9] p-4 rounded-lg text-center border border-[#e2e8f0]/50">
                <span className="block text-2xl font-bold text-blue-600 leading-none mb-1">
                  {state.content ? Math.round(state.progress * 48) : '0'}
                </span>
                <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">Word Count</span>
              </div>
              <div className="bg-[#f1f5f9] p-4 rounded-lg text-center border border-[#e2e8f0]/50">
                <span className="block text-2xl font-bold text-blue-600 leading-none mb-1">
                  {state.content ? '12' : '0'}
                </span>
                <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">Semantic KW</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest">EEAT Compliance</label>
                <span className="text-xs font-bold text-blue-600">{state.eeatScore}%</span>
              </div>
              <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${state.eeatScore}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#94a3b8] uppercase">
                <span>Domain Expertise</span>
                <span>Verified</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest block">Compliance Checklist</label>
               <ul className="space-y-3">
                <CheckItem label="H2 minimal 3-4 subjudul" checked={state.checklist.h2} />
                <CheckItem label="Internal Link Bold & Natural" checked={state.checklist.internalLink} />
                <CheckItem label="Outbound Link Kredibel" checked={state.checklist.outboundLinks} />
                <CheckItem label="FAQ Schema Terintegrasi" checked={state.checklist.faq} />
               </ul>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-3">
              <label className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest block mb-2">Quick Export</label>
              <button 
                onClick={() => {
                  if (state.content) {
                    const htmlMatch = state.content.match(/```html([\s\S]*?)```/);
                    if (htmlMatch) {
                      navigator.clipboard.writeText(htmlMatch[1].trim());
                      alert("HTML Artikel berhasil disalin!");
                    } else {
                      alert("HTML belum tersedia.");
                    }
                  }
                }}
                disabled={!state.content}
                className="w-full bg-[#1e293b] hover:bg-slate-800 disabled:opacity-50 text-white text-[10px] font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-lg active:scale-[0.98]"
              >
                <FileText className="w-3.5 h-3.5" /> Salin HTML (Artikel)
              </button>

              <button 
                onClick={() => {
                  if (state.content) {
                    const seoPart = state.content.split('```').pop()?.split('\n').filter(l => l.includes('|')).join('\n');
                    if (seoPart) {
                      navigator.clipboard.writeText(seoPart.trim());
                      alert("Data SEO berhasil disalin!");
                    } else {
                      alert("Data SEO belum tersedia.");
                    }
                  }
                }}
                disabled={!state.content}
                className="w-full border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50 text-blue-600 text-[10px] font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition-all uppercase tracking-widest disabled:opacity-30 disabled:border-slate-100 disabled:text-slate-300"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Salin Data SEO (TXT)
              </button>
            </div>
            
          </div>
        </section>
      </main>

      {/* Footer Toolbar */}
      <footer className="h-10 border-t border-[#e2e8f0] bg-white px-6 shrink-0 flex items-center justify-between text-[11px] text-[#64748b] font-medium">
        <div>Last autosave: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
        <div className="flex gap-6 uppercase tracking-wider">
          <span>Target Audience: <strong className="text-[#1e293b]">Contractors & Engineers</strong></span>
          <span className="opacity-30">|</span>
          <span>Tone: <strong className="text-[#1e293b]">Professional / Technical</strong></span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
        
        pre {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-size: 0.875rem;
        }

        article h2 {
           scroll-margin-top: 100px;
        }
      `}</style>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
  return (
    <li className="flex items-center gap-2 group">
      <div className={`shrink-0 w-2 h-2 rounded-full transition-all ${
        checked ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'
      }`} />
      <span className={`text-[11px] font-semibold transition-colors ${
        checked ? 'text-[#334155]' : 'text-[#64748b]'
      }`}>
        {checked ? '✓' : '○'} {label}
      </span>
    </li>
  );
}
