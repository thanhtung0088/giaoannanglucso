import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("Lợi ích của mạng máy tính");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuPrompts = [
    { title: "📑 SOẠN KHBD 5512", content: `Trong vai chuyên gia, soạn giáo án môn ${monHoc} lớp ${khoiLop} bài ${tenBai} chuẩn 5512...` },
    { title: "💻 SOẠN SLIDE TRÌNH CHIẾU", content: `Thiết kế kịch bản slide bài ${tenBai} môn ${monHoc}...` },
    { title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP", content: `Soạn đề cương ôn tập môn ${monHoc} cho ${khoiLop}...` },
    { title: "✍️ SOẠN ĐỀ KIỂM TRA 7991", content: `Thiết kế ma trận và đề kiểm tra môn ${monHoc} theo TT22...` }
  ];

  const handleAiAction = async (type: 'AI' | 'IMAGE') => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key trên Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const promptText = type === 'IMAGE' 
        ? `Tạo prompt chi tiết cho AI tạo ảnh minh họa bài giảng: ${customPrompt}` 
        : customPrompt;

      const result = await model.generateContent(promptText);
      setAiResponse(result.response.text());
      if (type === 'AI') confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) {
      setAiResponse(e.message.includes("429") ? "⚠️ Hết lượt dùng miễn phí, Thầy chờ 1 phút nhé!" : "❌ Lỗi: " + e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020817] text-slate-200 overflow-hidden flex flex-col font-sans">
      {/* HEADER - Đúng chuẩn ảnh e4e313 */}
      <header className="h-20 bg-[#0f172a]/90 border-b border-blue-900/50 px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-blue-500/50 shadow-lg font-black text-white italic">⚡</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">NGUYỄN THANH TÙNG</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">BÌNH HÒA</p>
          </div>
        </div>
        <div className="bg-orange-600 px-8 py-2.5 rounded-full text-white font-black text-sm shadow-xl">CHÀO MỪNG QUÝ THẦY CÔ !</div>
        <div className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest italic">HỆ THỐNG V36.8 PRO</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic">⚙️ Thiết lập môn học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3.5 text-xs font-bold text-white outline-none focus:border-blue-500" />
            
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-[#f97316] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all">
                📜 4 MẪU LỆNH CHUẨN ▼
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-blue-500/30 rounded-2xl z-[100] overflow-hidden shadow-2xl">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-blue-600 text-[9px] font-black border-b border-slate-800 last:border-0 uppercase">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase italic">📁 Hồ sơ tài liệu</h2>
              <span className="bg-blue-600 text-[9px] px-2 py-0.5 rounded-full text-white font-black">(0)</span>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 transition-all">
               <span className="text-3xl mb-2 opacity-50">📎</span>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Gắn tối thiểu 4 tệp</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={() => handleAiAction('AI')} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all">
             🚀 Kích hoạt hệ thống
          </button>
        </aside>

        {/* WORKSPACE */}
        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 border-b border-slate-800 flex justify-between items-center bg-black/10">
              <span className="text-[10px] font-black text-blue-500/50 tracking-[0.3em] uppercase italic">Workspace Nguyễn Thanh Tùng</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase transition-colors">Làm mới nội dung</button>
            </div>
            
            <textarea 
              value={customPrompt} 
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full flex-1 bg-transparent p-12 text-lg text-slate-300 outline-none resize-none leading-relaxed custom-scrollbar font-medium" 
              placeholder="Nội dung giáo án sẽ hiển thị tại đây..."
            />

            <div className="absolute bottom-10 right-10 flex gap-4">
               <button onClick={() => handleAiAction('IMAGE')} className="px-8 py-4 bg-purple-600/90 hover:bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 Minh họa AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-[#8b5cf6]/90 hover:bg-[#8b5cf6] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all font-black italic">🎨 Canva</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_ThayTung.docx")} className="px-8 py-4 bg-[#10b981]/90 hover:bg-[#10b981] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">♻️ Xuất file hồ sơ</button>
            </div>
          </div>
        </section>
      </main>

      {/* POPUP AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-12">
          <div className="bg-[#020817] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/20 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)]">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                   <span className="font-black text-blue-400 uppercase text-[10px] tracking-[0.3em] italic">Next-Gen Intelligence: Cấu trúc kịch bản GDPT 2018</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-slate-800/50 text-white flex items-center justify-center hover:bg-red-600 transition-all font-bold">✕</button>
             </div>
             <div className="p-20 overflow-y-auto text-xl leading-[1.8] text-slate-300 whitespace-pre-wrap custom-scrollbar font-medium">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black text-blue-500 tracking-widest uppercase animate-pulse">Hệ thống đang thực thi trí tuệ nhân tạo...</p>
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