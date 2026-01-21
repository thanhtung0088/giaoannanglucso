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

  const getPromptMau = () => {
    if (tabHienTai === "PPT") return `Đóng vai chuyên gia thiết kế bài giảng, soạn kịch bản Slide PowerPoint bài [Tên bài], môn ${monHoc} khối ${khoiLop}. Chia rõ nội dung từng Slide, từ khóa chính và gợi ý hình ảnh minh họa Canva.`;
    return `Đóng vai chuyên gia giáo dục, soạn [${tabHienTai}] bài [Tên bài dạy], môn ${monHoc} khối ${khoiLop}. Yêu cầu: Chuẩn Công văn 5512/7991, tích hợp năng lực số 2026.`;
  };

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key trên Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🚀 Đang khởi tạo nội dung với Gemini 2.0 Flash...");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || getPromptMau(), ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 } });
    } catch (error: any) {
      setAiResponse(`❌ Lỗi kết nối: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  const exportFile = (type: string) => {
    saveAs(new Blob([aiResponse]), `HeThong_ThayTung_${type}.${type.toLowerCase()}`);
    setShowExportMenu(false);
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500 overflow-hidden flex flex-col relative">
      {/* Nền hiệu ứng Blur sáng giữa các thẻ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="h-16 px-10 flex justify-between items-center bg-white/5 backdrop-blur-2xl border-b border-white/10 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">⚡</div>
          <div>
            <h1 className="text-sm font-black uppercase text-white tracking-tight">Nguyễn Thanh Tùng</h1>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Trường THCS Bình Hòa</p>
          </div>
        </div>

        <div className="px-8 py-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-[length:200%_auto] animate-gradient-x rounded-full shadow-lg">
            <h2 className="text-sm font-black italic text-white">Chào mừng quý thầy cô !</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-blue-300/50">Version 17.0 Pro</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
        </div>
      </header>

      <main className="flex-1 p-5 grid grid-cols-12 gap-5 overflow-hidden z-10">
        
        {/* PANEL TRÁI: Cấu hình & Đính kèm */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 shadow-2xl space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-400 border-b border-white/10 pb-2 flex justify-between">
              <span>Cấu hình nhanh</span>
              <span className="text-white/20">01</span>
            </h2>
            <div className="space-y-3">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500/50 transition-all">
                  {dsMonHoc.map(m => <option key={m} className="bg-slate-900">{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500/50 transition-all">
                  {dsKhoi.map(k => <option key={k} className="bg-slate-900">{k}</option>)}
                </select>
            </div>
            <button onClick={() => setCustomPrompt(getPromptMau())} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-orange-500/20 transition-all active:scale-95">
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-400 mb-3 border-b border-white/10 pb-2">📂 Tài liệu đính kèm</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/40 transition-all shrink-0">
              <span className="text-2xl mb-1">📎</span>
              <p className="text-[8px] font-bold opacity-40 uppercase">Tối đa 4 tệp</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files).slice(0,4))} />
            </div>
            {/* DANH SÁCH FILE ĐÃ ĐÍNH KÈM */}
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5 group animate-in slide-in-from-left-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-[10px]">DOC</div>
                  <p className="text-[9px] font-bold truncate flex-1 text-white/70">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-white/20 hover:text-red-400 p-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all ${loading ? 'bg-white/10' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-blue-500/20'}`}>
            {loading ? "⚡ Đang xử lý..." : "🚀 Kích hoạt AI 2.0"}
          </button>
        </div>

        {/* PANEL PHẢI: Tabs & Editor */}
        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${tabHienTai === id ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}>
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex flex-col flex-1 shadow-2xl relative overflow-hidden group">
            <div className="px-8 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center shrink-0">
               <span className="text-[9px] font-black uppercase text-blue-400/50 tracking-widest italic">
                 {tabHienTai === "PPT" ? "🎨 CHẾ ĐỘ THIẾT KẾ SLIDE PPT" : "📝 CHẾ ĐỘ SOẠN THẢO VĂN BẢN"}
               </span>
               <div className="flex gap-4">
                  {tabHienTai === "PPT" && (
                    <button onClick={() => window.open('https://www.canva.com', '_blank')} className="text-[9px] font-black bg-[#8b3dff] text-white px-4 py-1.5 rounded-full hover:scale-105 transition-all shadow-lg shadow-purple-500/20">
                      ✨ LIÊN KẾT CANVA
                    </button>
                  )}
                  <button onClick={() => setCustomPrompt("")} className="text-[9px] font-bold text-red-400 uppercase">Làm mới</button>
               </div>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={tabHienTai === "PPT" ? "Gợi ý: Hãy nhập 'Soạn Slide bài...' để AI lên kịch bản Canva" : "Nhập yêu cầu tại đây..."} className="w-full flex-1 bg-transparent p-10 text-base outline-none resize-none font-medium text-white/80 leading-relaxed custom-scrollbar" />
          </div>

          <div className="flex justify-end gap-3 shrink-0 relative">
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                    📥 Xuất hồ sơ số <span className="text-xs">▼</span>
                </button>
                {showExportMenu && (
                    <div className="absolute bottom-full right-0 mb-3 w-52 bg-slate-900/95 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[100] animate-in slide-in-from-bottom-2">
                        <button onClick={() => exportFile('DOCX')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-white/5 border-b border-white/5">
                            <span className="text-blue-400">📄</span> Microsoft Word (.docx)
                        </button>
                        <button onClick={() => exportFile('PDF')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-white/5 border-b border-white/5">
                            <span className="text-red-400">📕</span> Tài liệu PDF (.pdf)
                        </button>
                        <button onClick={() => exportFile('PPTX')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-white/5">
                            <span className="text-orange-400">📊</span> PowerPoint (.pptx)
                        </button>
                    </div>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* CHATBOX KẾT QUẢ */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${isChatOpen ? 'w-[95vw] md:w-[650px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col h-[75vh] overflow-hidden">
            <div className="p-6 bg-blue-700 text-white flex justify-between items-center shrink-0 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Hệ thống trợ lý ảo - v17.0</span>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition-all font-black text-xs">✕</button>
            </div>
            <div className="p-8 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-medium text-white/70 flex-1 custom-scrollbar">
                {aiResponse || "Mời thầy nhập yêu cầu..."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-[101] animate-bounce hover:scale-110 transition-all">🤖</button>}
    </div>
  );
};

export default App;