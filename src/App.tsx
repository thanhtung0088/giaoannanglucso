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
  const [mainImg, setMainImg] = useState<string | null>(null);
  const tailieuRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy kiểm tra lại API Key trên Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || "Soạn giáo án", ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 100, spread: 70 });
    } catch (error: any) {
      setAiResponse(`⚠️ Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#f0f9ff] text-slate-800 font-sans overflow-hidden flex flex-col relative">
      {/* Background hiệu ứng ánh sáng xanh chuyên nghiệp */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-white to-blue-50 pointer-events-none"></div>

      {/* HEADER TÍCH HỢP CHỮ CHÀO MỪNG VÀNG CAM */}
      <header className="h-20 px-10 flex justify-between items-center bg-white/70 backdrop-blur-2xl border-b border-blue-200 shadow-sm z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">⚡</div>
            <div>
              <h1 className="text-sm font-black uppercase text-blue-900 leading-none">Nguyễn Thanh Tùng</h1>
              <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 tracking-tighter">Trường THCS Bình Hòa</p>
            </div>
          </div>
          
          {/* Dòng chữ Vàng Cam Sang Xịn */}
          <div className="relative group">
            <h2 className="text-2xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 drop-shadow-sm animate-pulse">
              Chào mừng quý thầy cô !
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-30"></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hệ thống v19.0 Pro</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 grid grid-cols-12 gap-5 overflow-hidden z-10">
        {/* PANEL TRÁI */}
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-xl shadow-blue-100/50">
            <h2 className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Cấu hình hệ thống
            </h2>
            <div className="space-y-4">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold focus:ring-2 ring-blue-500/20 outline-none transition-all">
                  {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold focus:ring-2 ring-blue-500/20 outline-none transition-all">
                  {dsKhoi.map(k => <option key={k}>{k}</option>)}
                </select>
            </div>
            <button onClick={() => setCustomPrompt("Hãy soạn thảo theo CV 5512...")} className="w-full mt-5 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-xl shadow-blue-100/50 flex-1 flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black uppercase text-blue-600 mb-4">📂 Tài liệu đính kèm ({selectedFiles.length})</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-8 border-2 border-dashed border-blue-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-all shrink-0 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">📎</span>
              <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">Chọn tệp tài liệu</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 animate-in slide-in-from-left-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-[9px] font-bold truncate flex-1 text-blue-900">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 font-bold px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">🚀 Soạn bài ngay</button>
        </div>

        {/* PANEL PHẢI */}
        <div className="col-span-9 flex flex-col gap-5 overflow-hidden">
          {/* KHUNG HÌNH 16:9 TỰ DÁN ẢNH */}
          <div 
            onClick={() => imgRef.current?.click()}
            className="aspect-[16/4.5] w-full bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-inner flex items-center justify-center overflow-hidden cursor-pointer group relative"
          >
            {mainImg ? (
              <img src={mainImg} alt="Minh họa" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
              <div className="flex flex-col items-center opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-4xl">🖼️</span>
                <p className="text-[10px] font-black uppercase mt-2">Nhấn để dán ảnh minh họa 16:9</p>
              </div>
            )}
            <input type="file" ref={imgRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setMainImg(URL.createObjectURL(e.target.files[0]))} />
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm shrink-0">
                {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
                <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tabHienTai === id ? 'bg-blue-600 text-white shadow-md' : 'text-blue-400 hover:bg-white/50'}`}>
                    {id.replace("_", " ")}
                </button>
                ))}
            </div>

            <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] border border-white flex flex-col flex-1 shadow-2xl relative overflow-hidden group">
                <div className="px-10 py-4 border-b border-blue-50 flex justify-between items-center bg-blue-50/20">
                    <span className="text-[10px] font-black uppercase text-blue-500/40 tracking-[0.2em] italic">Không gian làm việc số</span>
                    {tabHienTai === "PPT" && (
                      <button onClick={() => window.open('https://canva.com', '_blank')} className="px-5 py-1.5 bg-[#8b3dff] text-white text-[9px] font-black rounded-full shadow-lg hover:scale-105 transition-all">✨ LIÊN KẾT CANVA</button>
                    )}
                </div>
                <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Nhập nội dung bài dạy của thầy tại đây..." className="w-full flex-1 bg-transparent p-12 text-[15px] outline-none resize-none font-medium text-slate-700 leading-relaxed custom-scrollbar" />
                
                <div className="absolute bottom-8 right-8 flex gap-3">
                    <div className="relative">
                      <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                          📥 Tải tài liệu ▾
                      </button>
                      {showExportMenu && (
                          <div className="absolute bottom-full right-0 mb-3 w-48 bg-white/95 backdrop-blur-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-2">
                              <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_Doc.docx"); setShowExportMenu(false)}} className="w-full px-5 py-4 text-left text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 flex items-center gap-3"><span>📄</span> Word (.docx)</button>
                              <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_PDF.pdf"); setShowExportMenu(false)}} className="w-full px-5 py-4 text-left text-[10px] font-bold hover:bg-red-50 border-b border-slate-50 flex items-center gap-3"><span>📕</span> PDF (.pdf)</button>
                              <button onClick={() => {saveAs(new Blob([aiResponse]), "Tung_PPT.pptx"); setShowExportMenu(false)}} className="w-full px-5 py-4 text-left text-[10px] font-bold hover:bg-orange-50 flex items-center gap-3"><span>📊</span> PowerPoint (.pptx)</button>
                          </div>
                      )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* CHATBOX KẾT QUẢ */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${isChatOpen ? 'w-[95vw] md:w-[650px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] border border-blue-100 shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col h-[75vh] overflow-hidden">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Kết quả biên soạn - v19.0</span>
                <button onClick={() => setIsChatOpen(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition-all font-black text-sm">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-slate-600 flex-1 custom-scrollbar bg-slate-50/30">
                {loading ? "🤖 Đang xử lý dữ liệu..." : aiResponse || "Hệ thống đang chờ thầy..."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl z-[101] hover:rotate-12 transition-all animate-bounce">🤖</button>}
    </div>
  );
};

export default App;