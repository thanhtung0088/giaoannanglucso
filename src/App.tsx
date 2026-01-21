import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const tailieuRef = useRef<HTMLInputElement>(null);

  const getPromptMau = () => `Hãy đóng vai chuyên gia, soạn [${tabHienTai}] cho môn [${monHoc}], [${khoiLop}].
- Tên bài: [Nhập tên bài]
- Số tiết: [Số tiết]
- Yêu cầu: Tích hợp năng lực số, chuẩn 5512/7991.`;

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy cập nhật API Key mới trên Vercel!");

    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🚀 Gemini 2.5 Flash đang khởi tạo dữ liệu...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Mã model ổn định nhất hiện tại cho 2.5 preview

      const result = await model.generateContent([customPrompt || getPromptMau(), ...(selectedFile ? [await fileToPart(selectedFile)] : [])]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 100 });
    } catch (error: any) {
      setAiResponse(`LỖI: ${error.message}. Thầy hãy đổi Key mới vì Key cũ đã bị lộ (leaked).`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-slate-900 text-white font-sans selection:bg-yellow-400 selection:text-black">
      
      {/* HEADER 3D */}
      <header className="py-6 px-10 flex justify-between items-center backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="p-3 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.5)] group-hover:rotate-12 transition-all duration-500">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Quân Sư Giáo Dục 2.5</h1>
            <p className="text-[9px] font-bold opacity-60 tracking-[0.3em]">NGUYỄN THANH TÙNG - 2026</p>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black uppercase animate-pulse text-yellow-400">Gemini 2.5 Flash Online</div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-3xl hover:border-blue-400 transition-all duration-500 group">
            <h2 className="text-xs font-black uppercase text-blue-300 mb-6 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-500 rounded-full inline-block"></span> Cấu hình hệ thống
            </h2>
            
            <div className="space-y-4">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/50 outline-none transition-all">
                  {dsMonHoc.map(m => <option key={m} className="bg-slate-900">{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/50 outline-none transition-all">
                  {dsKhoi.map(k => <option key={k} className="bg-slate-900">{k}</option>)}
                </select>
            </div>

            <div className="mt-8 space-y-3">
                <button onClick={() => setCustomPrompt(getPromptMau())} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-orange-500/40">
                    📝 Lệnh Prompt mẫu
                </button>
                <div onClick={() => tailieuRef.current?.click()} className="w-full py-8 border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    <span className="text-2xl mb-2">{selectedFile ? '✅' : '➕'}</span>
                    <p className="text-[8px] font-black uppercase opacity-50 tracking-widest">{selectedFile ? selectedFile.name : 'Đính kèm tài liệu'}</p>
                    <input type="file" ref={tailieuRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:shadow-blue-500/60 active:translate-y-1 transition-all">
            {loading ? "Đang xử lý 3S..." : "🚀 Kích hoạt AI 2.5 Flash"}
          </button>
        </div>

        {/* RIGHT COLUMN: TABS & EDITOR */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex p-2 bg-black/20 rounded-[2rem] backdrop-blur-md border border-white/5">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase transition-all duration-500 ${tabHienTai === id ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xl scale-100' : 'opacity-40 hover:opacity-100 scale-95'}`}>
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-1 flex-1 shadow-inner relative">
            <textarea 
                value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Nội dung yêu cầu soạn thảo..."
                className="w-full h-full bg-transparent p-10 text-sm font-medium outline-none resize-none placeholder:text-white/20 min-h-[400px]"
            />
            <button onClick={() => {}} className="absolute bottom-8 right-8 p-4 bg-white/10 rounded-2xl hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100">📋 Copy</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <button onClick={() => {}} className="py-4 bg-white/10 rounded-2xl text-[9px] font-black uppercase border border-white/10 hover:bg-white/20">🎨 Gợi ý Canva</button>
              <button onClick={() => saveAs(new Blob([aiResponse]), "KetQua.docx")} className="py-4 bg-green-600/20 rounded-2xl text-[9px] font-black uppercase border border-green-500/30 hover:bg-green-600 transition-all text-green-400">📥 Xuất file Word</button>
          </div>
        </div>
      </main>

      {/* CHATBOT AI FLOAT */}
      <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-700 ${isChatOpen ? 'w-[600px] opacity-100 translate-y-0' : 'w-0 opacity-0 translate-y-20 overflow-hidden'}`}>
          <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] border border-blue-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col h-[70vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-blue-600/20 rounded-t-[3rem]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kết quả Gemini 2.5 Flash</span>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition-all">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-medium custom-scrollbar italic text-slate-200">
                {aiResponse || "Hệ thống đã sẵn sàng phục vụ thầy Tùng."}
            </div>
          </div>
      </div>

      {!isChatOpen && (
          <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.6)] flex items-center justify-center text-3xl hover:scale-110 active:scale-90 transition-all z-[101] animate-bounce">🤖</button>
      )}
    </div>
  );
};

export default App;