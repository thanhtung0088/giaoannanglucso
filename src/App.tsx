import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // Danh sách 4 luồng Prompt chuẩn của thầy
  const promptsMau = [
    { label: "📝 Giáo án 5512", content: "Soạn giáo án chi tiết theo Công văn 5512: Mục tiêu (Kiến thức, Năng lực, Phẩm chất), Thiết bị dạy học và Tiến trình 4 hoạt động." },
    { label: "🎨 Bài giảng PPT", content: "Thiết kế kịch bản PowerPoint: Chia slide, nội dung chính, ý tưởng hình ảnh và lời dẫn giáo viên." },
    { label: "📖 Soạn Đề cương", content: "Xây dựng đề cương ôn tập: Lý thuyết trọng tâm, câu hỏi ôn tập và hệ thống kiến thức." },
    { label: "📊 Đề kiểm tra 7991", content: "Thiết kế ma trận đặc tả và đề kiểm tra chuẩn Công văn 7991: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao kèm đáp án." }
  ];

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const tailieuRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Lỗi: Kiểm tra API Key.");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Môn ${monHoc}, ${khoiLop}. Yêu cầu: ${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`⚠️ Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#7eb5f0] text-slate-800 font-sans overflow-hidden flex flex-col p-3">
      {/* HEADER GIỮ NGUYÊN PHONG CÁCH CŨ */}
      <header className="h-20 mb-3 px-8 flex justify-between items-center bg-white/90 backdrop-blur-md rounded-xl border border-white shadow-lg z-[100] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-black">⚡</div>
            <div>
              <h1 className="text-md font-black uppercase text-blue-900 leading-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[9px] font-bold text-blue-500 uppercase">Trường THCS Bình Hòa</p>
            </div>
          </div>
          <h2 className="text-4xl font-black italic text-orange-600 drop-shadow-sm">
            Chào mừng quý thầy cô !
          </h2>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase">
           Hệ thống v23.0 PRO
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* CỘT TRÁI */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/95 p-5 rounded-xl border border-white shadow-md space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-600">⚙️ Cấu hình</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none focus:border-blue-500">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none focus:border-blue-500">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>

            {/* FIX: HIỂN THỊ ĐẦY ĐỦ 4 LỰA CHỌN */}
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-500 text-white rounded-lg font-black text-[10px] uppercase shadow-md flex justify-between px-4 items-center transition-all">
                📝 Lệnh Prompt mẫu <span>{showPromptMenu ? '▲' : '▼'}</span>
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden z-[200]">
                  {promptsMau.map((p, i) => (
                    <button 
                      key={i}
                      onClick={() => { setCustomPrompt(p.content); setShowPromptMenu(false); }}
                      className="w-full px-4 py-3 text-left text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 last:border-0"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/95 p-5 rounded-xl border border-white shadow-md flex-1 flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest">📂 Tài liệu đính kèm ({selectedFiles.length})</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 shrink-0">
              <span className="text-2xl">📎</span>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Bấm để đính kèm</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            </div>
            {/* HIỂN THỊ DANH SÁCH FILE ĐÍNH KÈM */}
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-white shadow-sm animate-in fade-in">
                  <span className="text-xs">📄</span>
                  <p className="text-[9px] font-bold truncate flex-1 text-blue-900">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 font-bold px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAiAction} className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all">🚀 Kích hoạt AI 2.5</button>
        </div>

        {/* CỘT PHẢI */}
        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/95 backdrop-blur-3xl rounded-xl border border-white flex flex-col flex-1 shadow-xl relative overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-widest">Hệ thống soạn thảo chuyên sâu</span>
                <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Xóa hết nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Dán nội dung hoặc chọn Prompt mẫu..." className="w-full flex-1 bg-transparent p-10 text-md outline-none resize-none font-medium text-slate-700 leading-relaxed custom-scrollbar" />
            
            <div className="absolute bottom-6 right-6 flex gap-3">
                {/* NÚT CANVA ĐÃ TRỞ LẠI */}
                <button onClick={() => window.open('https://canva.com', '_blank')} className="px-8 py-4 bg-[#8b3dff] text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  🎨 Gợi ý Canva
                </button>

                <div className="relative">
                  <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-500 flex items-center gap-2 transition-all">
                      📥 Xuất File ▾
                  </button>
                  {showExportMenu && (
                      <div className="absolute bottom-full right-0 mb-3 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-2">
                          <button onClick={() => {saveAs(new Blob([aiResponse]), "GiaoAn.docx"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-blue-50 border-b border-slate-50">Microsoft Word</button>
                          <button onClick={() => {saveAs(new Blob([aiResponse]), "TaiLieu.pdf"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-red-50 border-b border-slate-50">Bản PDF</button>
                          <button onClick={() => {saveAs(new Blob([aiResponse]), "BaiGiang.pptx"); setShowExportMenu(false)}} className="w-full px-4 py-3 text-left text-[9px] font-bold hover:bg-orange-50">PowerPoint</button>
                      </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL KẾT QUẢ AI */}
      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-500 transform ${isChatOpen ? 'w-[90vw] md:w-[650px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-white rounded-2xl border border-white shadow-2xl flex flex-col h-[70vh] overflow-hidden">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shadow-lg">
                <span className="text-[11px] font-black uppercase tracking-widest">Sản phẩm AI Gemini 2.5</span>
                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 transition-all font-black text-xs">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-slate-700 flex-1 bg-slate-50/30 custom-scrollbar">
                {loading ? "🤖 AI đang biên soạn bài cho thầy..." : aiResponse || "Sẵn sàng nhận lệnh."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl z-[301] animate-bounce">🤖</button>}
    </div>
  );
};

export default App;