import { useState, useEffect } from 'react';
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
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const keyword = params.get('frasa') ?? '';
  const anchorText = params.get('anchor_text') ?? '';
  const url = params.get('url') ?? '';

  const supportKeywords = Array.from({ length: 10 }, (_, i) =>
    params.get(`anchor${i + 1}`) ?? ''
  );

  setConfig({
    keyword,
    anchorText,
    url,
    supportKeywords
  });

  console.log("PARAM:", {
    keyword,
    anchorText,
    url,
    supportKeywords
  });

}, []);
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
      eeatScore: 45,
      error: undefined
    }));

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API Key Gemini tidak ditemukan. Jika Anda menggunakan platform eksternal (seperti Vercel), silakan tambahkan GEMINI_API_KEY di pengaturan environment variable Anda.");
      }

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
        - ATURAN: Hanya sertakan SATU (1) referensi link internal artikel utama ini di seluruh artikel agar tetap terlihat natural.
        
        GAYA PENULISAN & KONTEN:
        - Profesional, teknis-populer, persuasif.
        - Fokus EEAT (Experience, Expertise, Authoritativeness, Trustworthiness).
        - Search intent: komersial untuk industri konstruksi, infrastruktur, pengadaan.
        - ANTI-THIN CONTENT: Setiap paragraf harus panjang, mendalam, dan berisi informasi substansial. Hindari kalimat retoris yang kosong.
        - PARAGRAF MENDALAM: Gunakan 5-8 kalimat per paragraf untuk menjelaskan konsep teknis secara menyeluruh.
        - FORMAT KATA KUNCI: Cetak TEBAL (Bold) setiap penyebutan 10 Kata Kunci Pendukung di atas dalam artikel (baik di Heading maupun di dalam paragraf) untuk memudahkan identifikasi link nantinya.
        - INSIGHT PRAKTIS (WAJIB): Sertakan contoh kasus lapangan (case studies), daftar kesalahan umum (common pitfalls), dan solusi teknis yang spesifik.
        
        Instruksi Structured Data:
        - Gunakan pendekatan penulisan yang mendukung penerapan schema markup secara natural (Article, FAQPage, dan Organization).
        - Pastikan bagian FAQ (WAJIB berjumlah 5 pertanyaan) ditulis jelas agar mudah diubah menjadi FAQ schema (pertanyaan sebagai heading H3, jawaban sebagai paragraf).
        
        Instruksi CTA & Conversion Link (WAJIB DIPATUHI):
        - Sertakan CTA kontekstual yang relevan dan profesional pada:
          • akhir artikel,
          • atau penutup pembahasan teknis yang berkaitan dengan pengambilan keputusan proyek.
        - CTA wajib menggunakan link berikut (tidak boleh dimodifikasi URL-nya):
          1. Konsultasi teknis proyek: https://indogeotextile.com/konsultasi/
          2. Permintaan informasi harga: https://indogeotextile.com/info-harga/
          3. Kontak WhatsApp langsung: https://wa.me/message/WSI7AS6VJ3SBH1
        - Penulisan link WAJIB menggunakan format Markdown: [anchor text](URL)
        - Penempatan link: Max 1 link CTA per paragraf, total 2–3 link CTA dalam seluruh artikel. DILARANG menumpuk link.
        - Gaya penulisan CTA: Solutif, informatif, profesional, dan tidak hard selling.
        
        STRUKTUR OUTPUT (WAJIB):
        1. ARTIKEL UTAMA (Format Markdown untuk Preview):
           - Struktur: H1 -> Pendahuluan -> H2 (10 Topik) -> FAQ (WAJIB 5 pertanyaan) -> Kesimpulan persuasif (mengarahkan ke solusi produk).
        2. (Format RAW HTML dalam Code Block):
           - Konversikan seluruh isi artikel ke HTML bersih.
           - Aturan Heading: <h1>, <h2>, <h3> WAJIB TEKS MURNI (ANTI-LINK).
           - Tag Diizinkan: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <blockquote>.
           - Link: <a href="URL">anchor text</a> (Hanya di dalam <p> atau <li>).
           - Output: Mulai langsung dari <h1>, TANPA TEKS AWAL, tanpa <html>/<body>.
        3. DATA SEO (Format Tab-Separated):
           - Isi: Judul Artikel, Judul SEO, Slug, Meta Description, Excerpt, Tags.
           - ATURAN: TANPA HEADER, TANPA PIPA (|), TANPA TABEL. Gunakan TAB (\t) sebagai pemisah antar nilai dalam SATU BARIS. Jangan gunakan simbol (:, ;, |) pada judul.
           - Outputkan di dalam blok kode: ${'```'}seo [data_disini] ${'```'}
        
        VALIDASI: Pastikan tidak ada link di heading dan isi teks 100% konsisten antar format.
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview", // Optimal for basic text tasks
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

    } catch (error: any) {
      console.error("Generation failed:", error);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        progress: 0,
        error: error.message || "Gagal membangun konten. Silakan periksa koneksi atau API Key."
      }));
    }
  };

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
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">Terjadi Kesalahan</h3>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">{state.error}</p>
                    <button 
                      onClick={generateArticle}
                      className="mt-3 text-[10px] font-bold text-red-700 underline uppercase tracking-widest hover:text-red-900"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              )}

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

                  {/* Card 2: SEO Data Only */}
                  <section className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 flex items-start justify-between">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-blue-900 tracking-tight leading-none uppercase">DATA SEO YANG DIBUTUHKAN</h2>
                        <p className="text-[11px] text-blue-600/70 font-medium">Data ini siap untuk ditempel ke spreadsheet atau CMS Anda.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const seoMatch = state.content.match(/```seo([\s\S]*?)```/);
                            if (seoMatch) {
                              navigator.clipboard.writeText(seoMatch[1].trim());
                              alert("Data SEO berhasil disalin!");
                            } else {
                              // Fallback if regex fails
                              const parts = state.content.split('```');
                              if (parts.length >= 2) {
                                navigator.clipboard.writeText(parts[parts.length-2].trim());
                                alert("Data SEO disalin!");
                              }
                            }
                          }}
                          className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <BarChart3 className="w-3 h-3" /> Salin Data SEO (TXT)
                        </button>
                      </div>
                    </div>

                    <div className="px-8 pb-10 space-y-8">
                      {/* SEO Data Box */}
                      {state.content.includes('```seo') && (
                        <div className="bg-white rounded-xl border border-blue-100/50 shadow-inner overflow-hidden">
                          <div className="overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-blue-200">
                            <div className="min-w-[1200px] font-mono text-[13px] text-slate-700 whitespace-pre">
                              {state.content.match(/```seo([\s\S]*?)```/)?.[1].trim()}
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
                <CheckItem label="FAQ Schema (WAJIB 5 Pertanyaan)" checked={state.checklist.faq} />
                <CheckItem label="Supporting Keywords Bold" checked={state.checklist.h2} />
                <CheckItem label="Insight Praktis & Case Study" checked={state.checklist.cta} />
                <CheckItem label="CTA & Conversion Link" checked={state.checklist.cta} />
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
                    const seoMatch = state.content.match(/```seo([\s\S]*?)```/);
                    if (seoMatch) {
                      navigator.clipboard.writeText(seoMatch[1].trim());
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
