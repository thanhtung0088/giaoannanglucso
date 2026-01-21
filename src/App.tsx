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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const tailieuRef = useRef<HTMLInputElement>(null);

  const getPromptMau = () => `Đóng vai chuyên gia giáo dục, soạn [${tabHienTai}] bài [Tên bài dạy], môn ${monHoc} khối ${khoiLop}. Yêu cầu: Chuẩn Công văn 5512/7991, tích hợp năng lực số 2026.`;

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy cần cấu hình API Key trên Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🤖 Đang phân tích dữ liệu và khởi tạo nội dung...");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || getPromptMau(), ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 } });
    } catch (error: any) {
      setAiResponse(error.message.includes("429") ? "⚠️ Hết hạn mức lượt dùng, thầy đợi 1 phút nhé!" : `❌ Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4);
      setSelectedFiles(filesArray);
    }
  };

  return (
    <div className="h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-blue-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* HEADER VỚI THÔNG TIN TRƯỜNG & CHÀO MỪNG */}
      <header className="py-4 px-10 flex justify-between items-center bg-white border-b-4 border-blue-600 shadow-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-all">
            <span className="text-2xl">⚡</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black uppercase text-blue-900 leading-tight">Nguyễn Thanh Tùng</h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-wider">TRƯỜNG THCS BÌNH HÒA</p>
          </div>
        </div>

        {/* BANNER CHÀO MỪNG GIỮA MÀN HÌNH */}
        <div className="flex-1 text-center hidden md:block">
            <h2 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 drop-shadow-md animate-pulse relative inline-block">
                Chào mừng quý thầy cô !
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
            </h2>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-blue-800 uppercase">Gemini 2.5 Flash Online</span>
          </div>
          <p className="text-[8px] mt-1 font-bold opacity-40 italic">Hệ thống trợ lý số 2026</p>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* PANEL TRÁI: CẤU HÌNH & FILE */}
        <div className="col-span-3 flex flex-col gap-5 overflow-y-auto pr-2">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-5">
            <h2 className="text-[10px] font-black uppercase text-blue-700 border-b pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Thiết lập bài dạy
            </h2>
            <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black opacity-40 ml-2 uppercase tracking-widest">Môn học</span>
                  <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs font-bold focus:border-blue-500 outline-none transition-all">
                    {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black opacity-40 ml-2 uppercase tracking-widest">Khối lớp</span>
                  <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-xs font-bold focus:border-blue-500 outline-none transition-all">
                    {dsKhoi.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
            </div>
            <button 
              onClick={() => setCustomPrompt(getPromptMau())} 
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-red-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-700 border-b pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Tài liệu ({selectedFiles.length}/4)
            </h2>
            <div onClick={() => tailieuRef.current?.click()} className="mt-4 py-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0">
              <span className="text-2xl mb-1">📁</span>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest text-center">Tải lên file của thầy</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
            </div>
            
            <div className="mt-4 space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs">📄</span>
                  <p className="text-[9px] font-bold truncate flex-1 text-blue-900">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 font-bold p-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all ${loading ? 'bg-slate-300' : 'bg-blue-700 text-white hover:bg-blue-800 active:scale-95'}`}>
            {loading ? "⚡ Đang xử lý..." : "🚀 Kích hoạt AI 2.5"}
          </button>
        </div>

        {/* PANEL PHẢI: SOẠN THẢO */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="flex p-1.5 bg-white rounded-3xl border border-slate-200 shadow-sm">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button 
                key={id} 
                onClick={() => setTabHienTai(id)} 
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${tabHienTai === id ? 'bg-blue-700 text-white shadow-xl scale-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] border-2 border-slate-100 flex flex-col flex-1 shadow-inner relative overflow-hidden group">
            <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <span className="text-[9px] font-black uppercase opacity-40 italic">Không gian soạn thảo số - Thầy Tùng</span>
               <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-red-500 uppercase px-4 py-1 hover:bg-red-50 rounded-full transition-all tracking-tighter">Xóa tất cả</button>
            </div>
            <textarea 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Nội dung chi tiết thầy muốn soạn thảo sẽ hiện ở đây..." 
                className="w-full flex-1 bg-transparent p-10 text-[15px] leading-relaxed outline-none resize-none font-medium text-slate-700"
            />
            
            <div className="absolute bottom-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { navigator.clipboard.writeText(customPrompt); alert("Đã copy!"); }} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-lg hover:bg-slate-50 font-black text-[10px]">📋 COPY</button>
              <button onClick={handleAiAction} className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all">CHẠY LỆNH</button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
              <button className="px-10 py-5 bg-white border-2 border-slate-200 rounded-[2rem] text-[11px] font-black uppercase hover:bg-slate-50 transition-all">🎨 Giao diện Canva</button>
              <button onClick={() => saveAs(new Blob([aiResponse]), "Soan_Bai_Tung_2026.docx")} className="px-12 py-5 bg-green-600 text-white rounded-[2rem] text-[11px] font-black uppercase shadow-xl hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-3">
                <span>📥</span> Tải file Word chuẩn hóa
              </button>
          </div>
        </div>
      </main>

      {/* CHATBOX KẾT QUẢ HIỆN ĐẠI */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-700 transform ${isChatOpen ? 'w-[95vw] md:w-[650px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-white rounded-[3rem] border border-blue-100 shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col h-[75vh] overflow-hidden">
            <div className="p-6 bg-blue-700 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-spin-slow">🤖</div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sản phẩm của thầy Tùng</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-red-500 transition-all font-black">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-[14px] leading-relaxed whitespace-pre-wrap font-medium text-slate-700 bg-slate-50/50 flex-1 custom-scrollbar">
                {aiResponse || "Mời thầy sử dụng 'Lệnh Prompt mẫu' rồi nhấn 'Kích hoạt AI' để bắt đầu."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-20 h-20 bg-blue-700 text-white rounded-full shadow-[0_15px_40px_rgba(29,78,216,0.4)] flex items-center justify-center text-3xl z-[101] hover:scale-110 active:scale-90 transition-all animate-bounce">🤖</button>}
    </div>
  );
};

export default App;