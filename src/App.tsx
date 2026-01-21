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

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy hãy kiểm tra lại API Key!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const result = await model.generateContent([customPrompt || "Soạn giáo án bài mới", ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (error: any) {
      setAiResponse(`⚠️ Lỗi: ${error.message}`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#c2e7ff] text-slate-800 font-sans overflow-hidden flex flex-col relative p-4">
      {/* Hiệu ứng mờ nền tạo chiều sâu */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white/40 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]"></div>

      {/* HEADER SIÊU GLASS 3D */}
      <header className="h-24 mb-4 px-10 flex justify-between items-center bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[0_15px_35px_rgba(0,0,0,0.05)] z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r-2 border-slate-100 pr-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_20px_rgba(37,99,235,0.3)]">⚡</div>
            <div>
              <h1 className="text-lg font-black uppercase text-blue-900 leading-tight tracking-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Trường THCS Bình Hòa</p>
            </div>
          </div>
          
          {/* Chào mừng to hơn, màu vàng cam cực sang */}
          <div className="flex flex-col">
            <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]">
              Chào mừng quý thầy cô !
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">Hệ thống trợ lý giáo dục chuyên nghiệp</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-200">
           Verson PRO 2026
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden relative z-10 px-2">
        {/* PANEL TRÁI: Cấu hình */}
        <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white/90 backdrop-blur-2xl p-7 rounded-[3rem] border border-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] space-y-5 transform hover:scale-[1.01] transition-transform">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Cấu hình bài dạy
            </h2>
            <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Môn học</label>
                  <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 outline-none transition-all shadow-sm">
                    {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Khối lớp</label>
                  <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 outline-none transition-all shadow-sm">
                    {dsKhoi.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
            </div>
            <button onClick={() => setCustomPrompt("Hãy soạn thảo bài dạy chuẩn Công văn 5512...")} className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black text-[11px] uppercase shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 transition-all">
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl p-7 rounded-[3rem] border border-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex-1 flex flex-col min-h-0">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest mb-4">📂 Tài liệu đính kèm</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-10 border-2 border-dashed border-blue-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all shrink-0">
              <span className="text-4xl mb-2">📎</span>
              <p className="text-[9px] font-black text-slate-400 uppercase">Tải tệp lên</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            </div>
            <div className="mt-5 space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-white shadow-sm animate-in zoom-in-95">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">FILE</div>
                  <p className="text-[10px] font-bold truncate flex-1 text-blue-900">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAiAction} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-95 transition-all">🚀 Kích hoạt AI</button>
        </div>

        {/* PANEL PHẢI: Tabs & Editor */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="flex p-2 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white shadow-sm shrink-0">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-4 rounded-[1.5rem] text-[11px] font-black uppercase transition-all duration-300 ${tabHienTai === id ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]' : 'text-blue-400 hover:bg-white/80'}`}>
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white/95 backdrop-blur-3xl rounded-[3.5rem] border border-white flex flex-col flex-1 shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative overflow-hidden group transform hover:scale-[1.005] transition-transform">
            <div className="px-12 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <span className="text-[11px] font-black uppercase text-blue-500/50 tracking-[0.3em] italic">Trình soạn thảo chuyên sâu v20.0</span>
                <div className="flex gap-4">
                  {tabHienTai === "PPT" && (
                    <button onClick={() => window.open('https://canva.com', '_blank')} className="px-6 py-2 bg-[#8b3dff] text-white text-[10px] font-black rounded-full shadow-lg hover:rotate-2 transition-all">✨ LIÊN KẾT CANVA</button>
                  )}
                  <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-red-400 uppercase hover:text-red-600 transition-colors">Làm mới</button>
                </div>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Mời thầy nhập yêu cầu bài giảng chi tiết tại đây..." className="w-full flex-1 bg-transparent p-14 text-lg outline-none resize-none font-medium text-slate-700 leading-relaxed custom-scrollbar placeholder:text-slate-200" />
            
            <div className="absolute bottom-10 right-10 flex gap-4">
                <div className="relative">
                  <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-12 py-5 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all flex items-center gap-3">
                      📥 Xuất hồ sơ số ▾
                  </button>
                  {showExportMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-56 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-4">
                          <button onClick={() => exportFile('DOCX')} className="w-full px-6 py-5 text-left text-[11px] font-bold hover:bg-blue-50 border-b border-slate-50 flex items-center gap-4 transition-colors">
                            <span className="text-blue-500 text-xl">📄</span> Microsoft Word
                          </button>
                          <button onClick={() => exportFile('PDF')} className="w-full px-6 py-5 text-left text-[11px] font-bold hover:bg-red-50 border-b border-slate-50 flex items-center gap-4 transition-colors">
                            <span className="text-red-500 text-xl">📕</span> Bản PDF chuẩn
                          </button>
                          <button onClick={() => exportFile('PPTX')} className="w-full px-6 py-5 text-left text-[11px] font-bold hover:bg-orange-50 flex items-center gap-4 transition-colors">
                            <span className="text-orange-500 text-xl">📊</span> PowerPoint
                          </button>
                      </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL KẾT QUẢ */}
      <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-700 transform ${isChatOpen ? 'w-[95vw] md:w-[700px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[4rem] border border-white shadow-[0_50px_100px_rgba(0,0,0,0.2)] flex flex-col h-[75vh] overflow-hidden">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-spin-slow">⭐</div>
                  <span className="text-[12px] font-black uppercase tracking-[0.2em]">Sản phẩm trí tuệ Gemini 2.0</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center hover:bg-red-500 transition-all font-black text-sm">✕</button>
            </div>
            <div className="p-12 overflow-y-auto text-[16px] leading-relaxed whitespace-pre-wrap font-medium text-slate-700 flex-1 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-blue-600 uppercase text-xs tracking-widest">Đang soạn thảo bài giảng...</p>
                  </div>
                ) : aiResponse || "Kết quả sẽ xuất hiện tại đây."}
            </div>
          </div>
      </div>
      {!isChatOpen && <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-10 w-20 h-20 bg-blue-600 text-white rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center text-4xl z-[101] hover:scale-110 active:scale-95 transition-all">🤖</button>}
    </div>
  );
};

const exportFile = (type: string) => {
  alert(`Đang chuẩn bị xuất tệp ${type}...`);
};

export default App;