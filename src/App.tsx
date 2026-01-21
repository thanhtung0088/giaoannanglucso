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
    if (!apiKey) return alert("Thầy cần cấu hình API Key trên Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🤖 Trí tuệ nhân tạo đang biên soạn nội dung theo yêu cầu của thầy...");
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

  const exportFile = (type: string) => {
    const blob = new Blob([aiResponse], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `Soan_Bai_Tung_2026.${type.toLowerCase()}`);
    setShowExportMenu(false);
  };

  return (
    <div className="h-screen bg-[#fcfdfe] text-slate-800 font-sans selection:bg-blue-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* HEADER: THÔNG TIN & BANNER */}
      <header className="h-16 px-8 flex justify-between items-center bg-white border-b border-slate-200 shadow-sm z-[60] shrink-0">
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white text-xl">⚡</div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase text-blue-900 leading-none">Nguyễn Thanh Tùng</h1>
            <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">Trường THCS Bình Hòa</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
            <div className="px-8 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-[0_4px_15px_rgba(249,115,22,0.3)] animate-pulse">
                <h2 className="text-lg font-black italic text-white tracking-wide">
                    Chào mừng quý thầy cô !
                </h2>
            </div>
        </div>

        <div className="w-1/4 flex justify-end gap-2">
            <span className="bg-green-100 text-green-700 text-[8px] font-black px-3 py-1 rounded-full border border-green-200 uppercase">Hệ thống v14.0</span>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-12 gap-5 overflow-hidden">
        
        {/* PANEL TRÁI */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-md space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">⚙️ Cấu hình nhanh</h2>
            <div className="space-y-3">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none ring-blue-500/20 focus:ring-2">
                  {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none ring-blue-500/20 focus:ring-2">
                  {dsKhoi.map(k => <option key={k}>{k}</option>)}
                </select>
            </div>
            <button 
              onClick={() => setCustomPrompt(getPromptMau())} 
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
            >
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-md flex-1 flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black uppercase text-blue-600 border-b pb-2">📂 Tài liệu ({selectedFiles.length}/4)</h2>
            <div onClick={() => tailieuRef.current?.click()} className="mt-3 py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all shrink-0">
              <span className="text-2xl">➕</span>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files).slice(0,4))} />
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto pr-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-left-2">
                  <span className="text-[10px]">📄</span>
                  <p className="text-[8px] font-bold truncate flex-1">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-500 font-bold px-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-300' : 'bg-blue-700 text-white hover:bg-blue-800 active:scale-95'}`}>
            {loading ? "Đang xử lý..." : "🚀 Soạn bài ngay"}
          </button>
        </div>

        {/* PANEL PHẢI */}
        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${tabHienTai === id ? 'bg-blue-700 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 flex flex-col flex-1 shadow-inner relative overflow-hidden group">
            <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
               <span className="text-[8px] font-black uppercase opacity-40">Khu vực soạn thảo chuyên sâu</span>
               <button onClick={() => setCustomPrompt("")} className="text-[8px] font-bold text-red-500 uppercase">Xóa hết</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Dán nội dung hoặc chọn Prompt mẫu..." className="w-full flex-1 bg-transparent p-8 text-sm outline-none resize-none font-medium text-slate-700" />
          </div>

          <div className="flex justify-end gap-3 shrink-0 relative">
              <div className="relative">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-10 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-green-700 flex items-center gap-2"
                >
                    📥 Tải xuống kết quả ▾
                </button>
                
                {/* DROP-DOWN MENU XUẤT FILE */}
                {showExportMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2">
                        <button onClick={() => exportFile('DOCX')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-blue-50 border-b border-slate-50">
                            <span className="text-blue-600 text-lg">📄</span> Microsoft Word (.docx)
                        </button>
                        <button onClick={() => exportFile('PDF')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-red-50 border-b border-slate-50">
                            <span className="text-red-500 text-lg">📕</span> Adobe PDF (.pdf)
                        </button>
                        <button onClick={() => exportFile('PPTX')} className="w-full px-5 py-4 text-left text-[10px] font-bold flex items-center gap-3 hover:bg-orange-50">
                            <span className="text-orange-500 text-lg">📊</span> PowerPoint (.pptx)
                        </button>
                    </div>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* RESULT PANEL */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${isChatOpen ? 'w-[90vw] md:w-[650px] opacity-100 translate-y-0' : 'w-0 opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl flex flex-col h-[75vh] overflow-hidden">
            <div className="p-5 bg-blue-700 text-white flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Sản phẩm của thầy Tùng - v14.0</span>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 transition-all font-black text-xs">✕</button>
            </div>
            <div className="p-8 overflow-y-auto text-sm whitespace-pre-wrap font-medium text-slate-700 bg-slate-50/50 flex-1">
                {aiResponse || "Kết quả soạn thảo sẽ xuất hiện ở đây."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-[101] animate-bounce">🤖</button>}
    </div>
  );
};

export default App;