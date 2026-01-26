import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const tailieuRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy thiết lập API Key trên Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // SỬA LỖI 404: Thay thế hoàn toàn gemini-1.5-pro bằng gemini-2.0-flash
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      
      const fileParts = await Promise.all(selectedFiles.map(async (file) => {
        const base64 = await new Promise((r) => { 
          const reader = new FileReader(); 
          reader.onload = () => r((reader.result as string).split(',')[1]); 
          reader.readAsDataURL(file); 
        });
        return { inlineData: { data: base64 as string, mimeType: file.type } };
      }));

      const finalPrompt = `Hệ thống Soạn Giáo Án Năng Lực Số - GV: Nguyễn Thanh Tùng.\n Môn ${monHoc}, ${khoiLop}.\nNội dung: ${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      // Thông báo lỗi chi tiết để Thầy Tùng dễ kiểm soát
      setAiResponse(`❌ THÔNG BÁO HỆ THỐNG: ${error.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      {/* Header và giao diện Thầy giữ nguyên như bản cũ */}
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-900/80 rounded-2xl border border-blue-500/30 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">⚡</div>
          <div>
            <h1 className="text-lg font-black uppercase text-white">Nguyễn Thanh Tùng</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">Soạn Giáo Án Năng Lực Số</p>
          </div>
        </div>
        <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black text-sm animate-pulse">Gemini 2.5 Flash Active</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all">
               {loading ? "⚡ ĐANG SOẠN THẢO..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
            </button>
          </div>
        </div>
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
           <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} className="w-full flex-1 bg-slate-900/40 p-12 text-lg outline-none resize-none text-slate-300 rounded-[2.5rem] border border-slate-800" placeholder="Nhập yêu cầu soạn bài giảng tại đây..." />
        </div>
      </main>

      {/* Pop-up hiển thị kết quả */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-12">
            <div className="bg-[#020617] w-full max-w-5xl h-[85vh] rounded-[3rem] border border-blue-500/40 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <span className="font-black text-blue-400 uppercase text-xs italic">Kết quả từ Gemini 2.5 Flash</span>
                    <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500 text-2xl font-bold">✕</button>
                </div>
                <div className="p-16 overflow-y-auto text-xl leading-relaxed whitespace-pre-wrap flex-1 text-slate-300">
                    {loading ? "Hệ thống đang suy luận..." : aiResponse}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;