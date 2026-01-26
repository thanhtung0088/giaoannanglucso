import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState("");
  const [khoiLop, setKhoiLop] = useState("");
  const [tenBai, setTenBai] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const menuPrompts = [
    {
      title: "📑 SOẠN KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG cho bài ${tenBai} (${khoiLop}) theo định hướng chương trình GDPT 2018...\n\n(Nội dung chi tiết theo yêu cầu của Thầy)`
    },
    {
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA môn ${monHoc} (${khoiLop}) bài ${tenBai} theo Thông tư 22 và định hướng 7991...\n\n(Nội dung ma trận chi tiết)`
    }
  ];

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Kiểm tra API Key!");
    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("❌ Lỗi: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#f1f5f9] text-slate-200 overflow-hidden flex flex-col font-sans relative">
      {/* TRỢ LÝ AI - PHẢI */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center animate-bounce duration-[4000ms]">
        <div className="bg-[#0f172a] p-3 rounded-xl border border-emerald-500/30 mb-2 shadow-2xl">
           <p className="text-[9px] font-black text-emerald-400 uppercase">Trợ lý Thầy Tùng!</p>
        </div>
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
          <span className="text-4xl animate-pulse">🤖</span>
        </div>
      </div>

      {/* HEADER NGỌC BÍCH GLASS - CAO THÊM 1/3 */}
      <header className="h-40 bg-emerald-700/90 backdrop-blur-xl border-b-[4px] border-emerald-900/50 px-10 flex justify-between items-center shrink-0 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-[3px] border-white/40 overflow-hidden cursor-pointer hover:scale-105 transition-all bg-emerald-800 flex items-center justify-center shadow-lg">
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-[10px] text-white/70 font-bold uppercase">Ảnh PC</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-white">
            <h1 className="text-sm font-black uppercase tracking-widest leading-tight">Ứng dụng soạn giảng năng lực số thế hệ mới</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1">Năm học: 2025-2026</p>
            <p className="text-[9px] font-bold text-emerald-100/50 uppercase tracking-widest italic">Thiết kế bởi: Thanh Tùng</p>
          </div>
        </div>

        {/* CHÀO MỪNG MÀU VÀNG CAM SANG TRỌNG */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 px-20 py-4 rounded-xl text-white font-black text-2xl shadow-[0_10px_40px_rgba(234,88,12,0.4)] animate-pulse tracking-widest border border-white/20">
           CHÀO MỪNG QUÝ THẦY CÔ !
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl border border-white/20 transition-all flex flex-col items-center gap-1 shadow-lg">
              <span className="text-xl">📹</span>
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">Google Meet</span>
           </button>
           <button onClick={() => alert("Mở Camera quét mã...")} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl border border-white/20 transition-all flex flex-col items-center gap-1 shadow-lg">
              <span className="text-xl">🔍</span>
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">Quét QR</span>
           </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-10 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* HEADER THẺ SẪM MÀU HƠN */}
            <div className="bg-[#0f172a] px-6 py-3 border-b border-slate-700">
               <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">⚙️ Thiết lập thông số</h2>
            </div>
            <div className="p-6 space-y-4">
              <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
                <option value="">-- Chọn Môn học --</option>
                {dsMonHoc.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
                <option value="">-- Chọn Khối lớp --</option>
                {dsKhoi.map(k => <option key={k}>{k}</option>)}
              </select>
              <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài học thực tế..." />
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:brightness-110">
                 📜 TẠO PROMPT MẪU ▼
              </button>
              {showPromptMenu && (
                <div className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden mt-2">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-emerald-600 text-[9px] font-black border-b border-slate-800 last:border-0 uppercase text-white">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl">
            <div className="bg-[#0f172a] px-6 py-3 border-b border-slate-700 uppercase italic font-black text-[10px] text-emerald-500">📁 Hồ sơ tài liệu</div>
            <div className="p-6 flex-1 flex flex-col">
              <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                <span className="text-4xl mb-1 text-emerald-500 font-light">+</span>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Nạp tài liệu bài giảng</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple />
              </div>
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-2xl hover:bg-blue-500 transition-all italic tracking-[0.2em]">
             🚀 KÍCH HOẠT TRÍ TUỆ SỐ
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-[0.3em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest">XÓA BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-200 outline-none resize-none leading-relaxed font-medium placeholder:text-slate-600" placeholder="Chọn mẫu lệnh chi tiết tại sidebar..." />
            
            <div className="absolute bottom-10 right-10 flex gap-4">
               <button onClick={() => alert("Kích hoạt minh họa AI...")} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all italic tracking-tighter">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_NangLucSo.docx")} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;