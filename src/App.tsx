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
  const tailieuRef = useRef<HTMLInputElement>(null);

  const getPromptMau = () => `Đóng vai chuyên gia giáo dục, soạn [${tabHienTai}] bài [Tên bài dạy], môn ${monHoc} khối ${khoiLop}. Yêu cầu: Chuẩn Công văn 5512/7991, tích hợp năng lực số 2026.`;

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy kiểm tra lại API Key trong phần Settings của Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🤖 Đang kết nối trí tuệ nhân tạo Gemini để soạn thảo...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng gemini-2.0-flash để đảm bảo ổn định quota
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || getPromptMau(), ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 } });
    } catch (error: any) {
      setAiResponse(`❌ LỖI: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  const exportFile = (type: string) => {
    saveAs(new Blob([aiResponse]), `Giao_An_Thay_Tung_${type}.${type.toLowerCase()}`);
    setShowExportMenu(false);
  };

  return (
    <div className="h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500 overflow-hidden flex flex-col relative">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

      {/* HEADER GLASS */}
      <header className="h-20 px-10 flex justify-between items-center bg-white/5 backdrop-blur-xl border-b border-white/10 z-50 shrink-0">
        <div className="flex items-center gap-4 w-1/4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-white/90">Nguyễn Thanh Tùng</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Trường THCS Bình Hòa</p>
          </div>
        </div>

        {/* BANNER CHÀO MỪNG VÀNG CAM */}
        <div className="flex-1 flex justify-center">
          <div className="px-10 py-3 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 rounded-full border border-orange-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <h2 className="text-xl font-black italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-500 animate-pulse">
              Chào mừng quý thầy cô !
            </h2>
          </div>
        </div>

        <div className="w-1/4 flex justify-end">
          <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Hệ thống v16.0</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden relative z-10">
        
        {/* PANEL TRÁI */}
        <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-5">
            <h2 className="text-[11px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Cấu hình bài dạy
            </h2>
            <div className="space-y-4">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all">
                  {dsMonHoc.map(m => <option key={m} className="bg-slate-900">{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all">
                  {dsKhoi.map(k => <option key={k} className="bg-slate-900">{k}</option>)}
                </select>
            </div>
            <button onClick={() => setCustomPrompt(getPromptMau())} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-orange-500/20 hover:scale-[1.03] active:scale-95 transition-all">
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[11px] font-black uppercase text-blue-400 tracking-[0.2em] mb-4">📂 Tài liệu ({selectedFiles.length}/4)</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-8 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all shrink-0">
              <span className="text-3xl mb-2">📎</span>
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Đính kèm dữ liệu</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files).slice(0,4))} />
            </div>
            <div className="mt-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group animate-in slide-in-from-left-2">
                  <span className="text-lg">📄</span>
                  <p className="text-[10px] font-bold truncate flex-1 text-white/70">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-white/20 hover:text-red-400 transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all ${loading ? 'bg-white/10 text-white/20' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95'}`}>
            {loading ? "Đang xử lý..." : "🚀 Kích hoạt AI"}
          </button>
        </div>

        {/* PANEL PHẢI */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm shrink-0">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${tabHienTai === id ? 'bg-blue-600 text-white shadow-xl scale-100' : 'text-white/40 hover:bg-white/5'}`}>
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex flex-col flex-1 shadow-2xl relative overflow-hidden group">
            <div className="px-8 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
               <span className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">Hệ thống soạn thảo chuyên sâu</span>
               <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-tighter transition-colors">Xóa sạch nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Nhập yêu cầu chi tiết hoặc sử dụng Prompt mẫu..." className="w-full flex-1 bg-transparent p-10 text-lg outline-none resize-none font-medium text-white/80 leading-relaxed placeholder:text-white/10" />
          </div>

          <div className="flex justify-end gap-4 shrink-0 relative">
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-12 py-5 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                    📥 Tải xuống kết quả <span className="text-xs">▼</span>
                </button>
                
                {showExportMenu && (
                    <div className="absolute bottom-full right-0 mb-4 w-56 bg-[#1e293b] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-4">
                        <button onClick={() => exportFile('DOCX')} className="w-full px-6 py-4 text-left text-[11px] font-bold flex items-center gap-4 hover:bg-white/5 border-b border-white/5 transition-colors">
                            <span className="text-blue-400 text-xl">📄</span> Microsoft Word
                        </button>
                        <button onClick={() => exportFile('PDF')} className="w-full px-6 py-4 text-left text-[11px] font-bold flex items-center gap-4 hover:bg-white/5 border-b border-white/5 transition-colors">
                            <span className="text-red-400 text-xl">📕</span> Bản PDF chuẩn
                        </button>
                        <button onClick={() => exportFile('PPTX')} className="w-full px-6 py-4 text-left text-[11px] font-bold flex items-center gap-4 hover:bg-white/5 transition-colors">
                            <span className="text-orange-400 text-xl">📊</span> Bản PowerPoint
                        </button>
                    </div>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* CHATBOX KẾT QUẢ */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-700 transform ${isChatOpen ? 'w-[95vw] md:w-[700px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-[#0f172a]/95 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col h-[75vh] overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">🤖</div>
                  <span className="text-[12px] font-black uppercase tracking-[0.2em]">Kết quả soạn thảo - Thầy Tùng</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-red-500 transition-all font-black text-sm">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-white/80 flex-1 custom-scrollbar">
                {aiResponse || "Hệ thống đang sẵn sàng..."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-20 h-20 bg-blue-600 text-white rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center text-3xl z-[101] hover:scale-110 active:scale-95 transition-all animate-bounce">🤖</button>}
    </div>
  );
};

export default App;