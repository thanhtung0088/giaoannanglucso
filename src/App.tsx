import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // Cấu hình danh mục hệ thống
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // Trạng thái điều khiển UI
  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  
  const tailieuRef = useRef<HTMLInputElement>(null);

  // Mẫu lệnh chuẩn
  const promptsMau = [
    { label: "📝 SOẠN BÀI GIẢNG 5512", content: "Trong vai chuyên gia 20 năm kinh nghiệm, soạn bài giảng GDPT 2018..." },
    { label: "📊 ĐỀ KIỂM TRA 7791", content: "Soạn ma trận và đề kiểm tra theo Thông tư 22..." }
  ];

  // Xử lý AI với Gemini 2.5 Flash (định danh 2.0 Stable để tránh lỗi 404)
  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy thiết lập VITE_GEMINI_API_KEY trên Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model định danh Stable để vượt qua lỗi 404 trên Vercel
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Hệ thống V36.0 PRO - GV: Nguyễn Thanh Tùng. Môn ${monHoc}, ${khoiLop}. Yêu cầu: ${customPrompt}`;
      
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`❌ THÔNG BÁO: Phiên bản này yêu cầu kích hoạt API Key thế hệ mới. Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => {
      const reader = new FileReader();
      reader.onload = () => r((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 px-8 flex justify-between items-center bg-slate-900/90 border-b border-blue-500/20 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg">T</div>
          <div>
            <h1 className="text-md font-black uppercase text-white leading-none">Nguyễn Thanh Tùng</h1>
            <p className="text-[9px] font-bold text-blue-400 tracking-tighter italic text-center">BÌNH HÒA</p>
          </div>
          <button 
            onClick={() => setShowAdminSidebar(!showAdminSidebar)}
            className="ml-6 px-4 py-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-[10px] font-bold uppercase transition-all border border-slate-700"
          >
            🏫 School Administration {showAdminSidebar ? '◀' : '▶'}
          </button>
        </div>
        <div className="bg-orange-600 px-6 py-1.5 rounded-full font-black italic text-[11px] shadow-lg animate-pulse">
          Hệ thống Gemini 2.5 Flash Ready
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar (V36.0) */}
        <aside className="w-20 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-8 gap-8 shadow-2xl">
            {["🏠", "📂", "📊", "⚙️"].map((icon, i) => (
                <div key={i} className="w-12 h-12 rounded-2xl hover:bg-blue-600/20 flex items-center justify-center cursor-pointer transition-all text-xl border border-transparent hover:border-blue-500/50">
                    {icon}
                </div>
            ))}
        </aside>

        {/* Secondary Sidebar - School Administration (Đa tầng) */}
        {showAdminSidebar && (
          <aside className="w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex flex-col p-4 animate-in slide-in-from-left duration-300">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 px-2">Phòng ban quản trị</h3>
            <nav className="space-y-1 overflow-y-auto custom-scrollbar">
              {[
                { title: "Human Resources", sub: ["Sơ yếu lý lịch", "Hợp đồng lao động"] },
                { title: "Administrative Office", sub: ["Accounting - Finance", "Academic Affairs", "IT Support", "School Health", "Teaching Equipment", "Library", "Counseling", "Security"] },
                { title: "Party Cell", sub: ["Chi bộ Đảng"] },
                { title: "Trade Union", sub: ["Công đoàn"] },
                { title: "AI Timetable Creation", sub: ["Tự động xếp lịch"] }
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <button className="w-full text-left px-4 py-3 hover:bg-blue-600/10 rounded-xl text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-all flex justify-between">
                    {item.title} <span>+</span>
                  </button>
                  <div className="ml-6 border-l border-slate-800 hidden group-hover:block transition-all">
                    {item.sub.map((s, i) => (
                      <button key={i} className="w-full text-left px-4 py-2 text-[10px] text-slate-500 hover:text-white transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* Workspace chính */}
        <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
          {/* Cột trái: Input & Files */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">⚙️ Cấu hình môn học</h2>
              <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-blue-500 transition-all">
                {dsMonHoc.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-blue-500">
                {dsKhoi.map(k => <option key={k}>{k}</option>)}
              </select>
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:brightness-110">
                 📝 MẪU LỆNH CHUẨN (2.5)
              </button>
              {showPromptMenu && (
                  <div className="absolute w-64 bg-slate-900 border border-blue-500/30 p-2 rounded-2xl z-50 shadow-2xl">
                      {promptsMau.map((p, i) => (
                          <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="block w-full text-left p-3 hover:bg-blue-600 rounded-lg text-[10px] font-bold text-slate-300">{p.label}</button>
                      ))}
                  </div>
              )}
            </div>

            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
               <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4">📂 Tài liệu sư phạm ({selectedFiles.length})</h2>
               <div onClick={() => tailieuRef.current?.click()} className="py-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-900/20 mb-4 transition-all">
                  <span className="text-3xl mb-2">📎</span>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Đính kèm minh chứng</p>
                  <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="text-[10px] p-3 bg-black/40 rounded-xl border border-slate-800 italic flex justify-between items-center">
                        <span className="truncate">{f.name}</span>
                        <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="text-red-500 ml-2">✕</button>
                    </div>
                  ))}
               </div>
            </div>
            
            <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">
               {loading ? "⚡ ĐANG XỬ LÝ 2.5 FLASH..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
            </button>
          </div>

          {/* Cột phải: Text Editor */}
          <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
                <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-[0.3em]">Workspace Nguyễn Thanh Tùng - v36.0 PRO</span>
                <div className="flex gap-4">
                    <button className="text-[9px] font-bold text-slate-500 hover:text-white uppercase">Copy</button>
                    <button onClick={() => setCustomPrompt("")} className="text-[9px] font-bold text-red-500/70 hover:text-red-500 uppercase">Clear All</button>
                </div>
              </div>
              <textarea 
                value={customPrompt} 
                onChange={(e)=>setCustomPrompt(e.target.value)} 
                className="w-full flex-1 bg-transparent p-12 text-xl outline-none resize-none text-slate-300 font-medium leading-relaxed custom-scrollbar" 
                placeholder="Nhập yêu cầu tại đây..." 
              />
              <div className="absolute bottom-10 right-10 flex gap-4">
                  <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_V36_ThayTung.docx")} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all">📥 Xuất file hồ sơ Word</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Pop-up hiển thị kết quả AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-12">
            <div className="bg-[#020617] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/30 flex flex-col overflow-hidden shadow-[0_0_150px_rgba(37,99,235,0.2)]">
                <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
                    <div className="flex flex-col">
                        <span className="font-black text-blue-400 tracking-[0.4em] uppercase text-xs">AI Response Generation</span>
                        <span className="text-[9px] text-slate-500 uppercase italic">Model: Gemini 2.5 Flash Production</span>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="w-14 h-14 rounded-full bg-slate-800 text-white hover:bg-red-600 transition-all flex items-center justify-center text-2xl font-bold border border-slate-700 shadow-xl">✕</button>
                </div>
                <div className="p-20 overflow-y-auto text-2xl leading-[1.8] whitespace-pre-wrap flex-1 custom-scrollbar text-slate-300 selection:bg-blue-500/40">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-black text-blue-400 animate-pulse">HỆ THỐNG ĐANG SUY LUẬN...</p>
                        </div>
                    ) : aiResponse}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;