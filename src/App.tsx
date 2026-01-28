import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState("GD Công dân"); // Mặc định theo yêu cầu của Thầy
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGIC PROMPT: ÉP AI PHẢI ĐI THEO MÔN HỌC ĐÃ CHỌN [cite: 2026-01-17]
  const menuPrompts = [
    { id: "5512", title: "📑 Soạn KHBD 5512", content: `Hãy soạn BÀI GIẢNG môn ${monHoc} (TUYỆT ĐỐI KHÔNG SOẠN MÔN KHÁC) cho ${khoiLop}, bài "${tenBai || '[Tên bài]'}" theo công văn 5512.` },
    { id: "PPT", title: "💻 Soạn bài giảng điện tử", content: `Thiết kế cấu trúc Slide bài giảng điện tử môn ${monHoc}, bài "${tenBai || '[Tên bài]'}" cho ${khoiLop}.` },
    { id: "7991", title: "✍️ Soạn đề kiểm tra (7991)", content: `Soạn ĐỀ KIỂM TRA môn ${monHoc} lớp ${khoiLop} theo ma trận 7991.` },
    { id: "ONTAP", title: "📚 Soạn đề cương ôn tập", content: `Soạn ĐỀ CƯƠNG ÔN TẬP môn ${monHoc} lớp ${khoiLop} kiến thức trọng tâm.` }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray].slice(-10)); // Lưu tối đa 10 file gần nhất
    }
  };

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy chưa cấu hình API Key!");
    
    // Ép Prompt sử dụng chính xác môn học hiện tại
    const currentPrompt = overridePrompt || customPrompt;
    const finalPrompt = `[YÊU CẦU QUAN TRỌNG: CHỈ SOẠN MÔN ${monHoc.toUpperCase()}] \n\n ${currentPrompt}`;

    setLoading(true); 
    setIsChatOpen(true);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(finalPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      setAiResponse(`❌ Lỗi hệ thống: ${e.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center">
             <span className="text-[10px] text-white font-black">THCS BÌNH HÒA</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase tracking-tight italic">Hệ thống soạn bài năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase tracking-widest">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-emerald-500">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài dạy..." />
            
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg flex justify-center items-center gap-2">
                📑 LỆNH PROMPT MẪU {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  {menuPrompts.map((p) => (
                    <button key={p.id} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 last:border-0">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* HIỂN THỊ FILE KHI TẢI LÊN */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase tracking-widest">📁 Danh sách tài liệu</div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-28 shrink-0 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all mb-4">
                <span className="text-4xl text-emerald-500 font-thin">+</span>
                <p className="text-[9px] text-slate-500 uppercase font-black">Nạp tài liệu từ máy</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedFiles.length > 0 ? selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center animate-in slide-in-from-left">
                    <span className="truncate w-40 font-bold text-emerald-200 italic">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 px-2 font-black text-xs">✕</button>
                  </div>
                )) : (
                  <p className="text-[9px] text-slate-600 text-center mt-10 uppercase italic">Chưa có tệp nào được gán...</p>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleAiAction()} 
            disabled={loading} 
            className={`w-full py-7 rounded-2xl font-black text-sm uppercase shadow-2xl transition-all italic tracking-[0.3em] ${loading ? 'bg-orange-600' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}
          >
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 BẮT ĐẦU SOẠN BÀI"}
          </button>
        </aside>

        {/* WORKSPACE */}
        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic underline decoration-2">WORKSPACE CHUYÊN SÂU - MÔN {monHoc.toUpperCase()}</span>
              <button onClick={() => {setCustomPrompt(""); setAiResponse(""); setSelectedFiles([])}} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase transition-colors">DỌN DẸP BẢNG</button>
            </div>
            <textarea 
              value={customPrompt} 
              onChange={(e) => setCustomPrompt(e.target.value)} 
              className="w-full flex-1 bg-transparent p-12 text-xl text-slate-100 outline-none resize-none custom-scrollbar leading-relaxed font-medium" 
              placeholder={`Thầy hãy nhập nội dung chi tiết bài soạn môn ${monHoc} tại đây...`} 
            />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), `GiaoAn_${monHoc}.docx`)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL TRỢ LÝ AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000] flex items-center justify-center p-10 animate-in fade-in">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[3rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white">
                <div className="flex items-center gap-4">
                   <span className="text-2xl animate-bounce">🤖</span>
                   <span className="font-black uppercase text-xs tracking-widest italic">PREVIEW: KẾT QUẢ SOẠN GIẢNG MÔN {monHoc.toUpperCase()}</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-2 rounded-full bg-white/10 hover:bg-white/30 font-black text-[9px] uppercase border border-white/20">✕ ĐÓNG CỬA SỔ</button>
             </div>
             <div className="flex-1 p-20 overflow-y-auto text-xl leading-relaxed text-slate-300 whitespace-pre-wrap custom-scrollbar font-medium">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-16 h-16 border-8 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Đang kiến tạo bài giảng môn {monHoc}...</p>
                   </div>
                ) : aiResponse || "Vui lòng nhập lệnh để AI bắt đầu làm việc."}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;