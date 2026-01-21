import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [tabHienTai, setTabHienTai] = useState("GIAO_AN"); 
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bannerImg, setBannerImg] = useState<string | null>(null);
  const tailieuRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy cài đặt API Key mới trên Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || "Soạn giáo án bài mới", ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#e0f2fe] text-slate-800 font-sans overflow-hidden flex flex-col relative">
      {/* Hiệu ứng mờ nền sáng */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100 via-white to-blue-200 pointer-events-none"></div>

      {/* HEADER */}
      <header className="h-14 px-8 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-blue-200/50 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <div>
            <h1 className="text-xs font-black uppercase text-blue-900 leading-none">Nguyễn Thanh Tùng</h1>
            <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Trường THCS Bình Hòa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-600/40 uppercase">Hệ thống giáo dục số v18.0</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden z-10">
        {/* PANEL TRÁI */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-xl space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-600 border-b border-blue-100 pb-2">⚙️ Cấu hình</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-white/50 border border-blue-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-white/50 border border-blue-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <button onClick={() => setCustomPrompt("Hãy soạn thảo nội dung theo chuẩn 5512...")} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all">
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-600 mb-3 border-b border-blue-100 pb-2">📂 Tài liệu ({selectedFiles.length}/4)</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all shrink-0">
              <span className="text-2xl">📎</span>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files).slice(0,4))} />
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in">
                  <span className="text-[10px]">📄</span>
                  <p className="text-[9px] font-bold truncate flex-1 text-blue-800">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAiAction} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">🚀 Kích hoạt AI</button>
        </div>

        {/* PANEL PHẢI */}
        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          {/* BANNER 16:9 CỰC ĐẠI */}
          <div 
            onClick={() => bannerRef.current?.click()}
            className="aspect-[16/5] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-[2.5rem] shadow-2xl relative overflow-hidden cursor-pointer group"
          >
            {bannerImg ? (
                <img src={bannerImg} alt="Banner" className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-105" />
            ) : (
                <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]"></div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)] animate-bounce">
                    CHÀO MỪNG QUÝ THẦY CÔ !
                </h2>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.5em] mt-4">Hệ thống trợ lý giáo dục chuyên nghiệp</p>
                {!bannerImg && <span className="absolute bottom-4 right-6 text-[8px] text-white/30 uppercase font-black">Nhấn để thay ảnh nền 16:9</span>}
            </div>
            <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files?.[0]) setBannerImg(URL.createObjectURL(e.target.files[0]));
            }} />
          </div>

          {/* TABS & EDITOR */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-blue-100 shadow-sm shrink-0">
                {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
                <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${tabHienTai === id ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400 hover:bg-blue-50'}`}>
                    {id.replace("_", " ")}
                </button>
                ))}
            </div>

            <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-white flex flex-col flex-1 shadow-2xl relative overflow-hidden group">
                <div className="px-8 py-3 border-b border-blue-50 flex justify-between items-center bg-blue-50/30">
                    <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest italic">{tabHienTai === "PPT" ? "🎨 Chế độ Canva Style" : "📝 Trình soạn thảo văn bản"}</span>
                    {tabHienTai === "PPT" && (
                        <button onClick={() => window.open('https://canva.com', '_blank')} className="px-4 py-1.5 bg-[#8b3dff] text-white text-[9px] font-black rounded-full shadow-lg hover:scale-105 transition-all">✨ MỞ CANVA</button>
                    )}
                </div>
                <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Nhập yêu cầu tại đây..." className="w-full flex-1 bg-transparent p-10 text-base outline-none resize-none font-medium text-slate-700 leading-relaxed" />
                <div className="absolute bottom-6 right-6 flex gap-3">
                    <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-2">
                        📥 Tải tệp ▾
                    </button>
                    {showExportMenu && (
                        <div className="absolute bottom-full right-0 mb-3 w-44 bg-white rounded-2xl shadow-2xl border border-blue-50 overflow-hidden z-[100] animate-in slide-in-from-bottom-2">
                            <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_Word.docx"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-blue-50 border-b border-slate-50">Word (.docx)</button>
                            <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_PDF.pdf"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-red-50 border-b border-slate-50">PDF (.pdf)</button>
                            <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_PPT.pptx"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-orange-50">PowerPoint (.pptx)</button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* RESULT PANEL */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${isChatOpen ? 'w-[90vw] md:w-[600px] opacity-100 translate-y-0' : 'w-0 opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex flex-col h-[70vh] overflow-hidden">
            <div className="p-5 bg-blue-600 text-white flex justify-between items-center shadow-md">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Sản phẩm từ Gemini 2.0 Flash</span>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 transition-all font-black text-xs">✕</button>
            </div>
            <div className="p-8 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-700 flex-1">
                {loading ? "🤖 AI đang làm việc..." : aiResponse || "Kết quả hiển thị tại đây."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-[101] hover:scale-110 transition-all">🤖</button>}
    </div>
  );
};

export default App;