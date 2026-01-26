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
      content: `Trong vai một chuyên gia giáo dục và một giáo viên [Môn học] có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: [Nhập tên môn]\n• Lớp: [Nhập lớp]\n• Bài: [Nhập tên bài]\n• Số tiết: [Nhập số tiết]\n• Đối tượng học sinh: [Trung bình/Khá/Yếu/Hỗn hợp]\n\nYêu cầu bài giảng gồm: ...`
    },
    {
      title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP",
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu: ...`
    }
  ];

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Vui lòng thiết lập API Key!");
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
    <div className="h-screen bg-[#020817] text-slate-200 overflow-hidden flex flex-col font-sans relative">
      {/* TRỢ LÝ AI HÌNH NGƯỜI MÁY CHUYỂN ĐỘNG */}
      <div className="fixed bottom-5 left-5 z-[100] animate-bounce duration-[3000ms]">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <span className="text-4xl animate-pulse">🤖</span>
        </div>
        <div className="absolute -top-10 left-full ml-2 bg-white text-black text-[9px] font-bold p-2 rounded-lg whitespace-nowrap shadow-xl">
          Chào Thầy Tùng! Con sẵn sàng rồi ạ.
        </div>
      </div>

      <header className="h-24 bg-[#0f172a]/90 border-b border-blue-900/50 px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-5">
          {/* KHUNG TRÒN DÁN ẢNH TỪ PC */}
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-slate-800 flex items-center justify-center shadow-lg"
          >
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-xs text-blue-400">Dán ảnh</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">NGUYỄN THANH TÙNG</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Năm học: 2025-2026</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Thiết kế by: Thanh Tùng</p>
          </div>
        </div>

        {/* DÒNG CHỮ CHÀO MỪNG MÀU VÀNG CAM TO */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-12 py-3 rounded-full text-white font-black text-xl shadow-2xl animate-pulse">
           CHÀO MỪNG QUÝ THẦY CÔ !
        </div>

        <div className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest italic">HỆ THỐNG V37.0 PRO</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 space-y-3 shadow-2xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
              <option value="">-- Chọn Khối lớp --</option>
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none" placeholder="Nhập tên bài học..." />
            
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-[#f97316] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:brightness-110 transition-all">
               📜 TẠO PROMPT MẪU ▼
            </button>
            {showPromptMenu && (
              <div className="bg-[#0f172a] border border-blue-500/50 rounded-2xl overflow-hidden mt-2">
                {menuPrompts.map((p, i) => (
                  <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-blue-600 text-[9px] font-black border-b border-slate-800 last:border-0 uppercase text-white transition-colors">{p.title}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black text-slate-500 uppercase italic mb-3">📁 Hồ sơ tài liệu</h2>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 transition-all">
               <span className="text-4xl mb-1 text-blue-500 font-black">+</span>
               <p className="text-[9px] text-slate-500 uppercase font-black">Thêm tài liệu tham khảo</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all italic">
             🚀 Kích hoạt trí tuệ số
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 border-b border-slate-800 flex justify-between items-center bg-black/10">
              <span className="text-[10px] font-black text-blue-500/50 tracking-[0.3em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase">Xóa bảng</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-lg text-slate-300 outline-none resize-none leading-relaxed custom-scrollbar" placeholder="Hãy nhập yêu cầu hoặc chọn mẫu lệnh..." />
            
            <div className="absolute bottom-10 right-10 flex gap-4">
               <button onClick={() => alert("Chức năng minh họa ảnh đang nạp...")} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 Minh họa AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all italic">🎨 Canva</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "GiaoAn_ThanhTung.docx")} className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">♻️ Xuất file hồ sơ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-12">
          <div className="bg-[#020817] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/20 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-slate-800 flex justify-between bg-slate-900/40">
                <span className="font-black text-blue-400 uppercase text-[10px] tracking-[0.3em] italic">Next-Gen Intelligence AI</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500 font-bold">✕ ĐÓNG</button>
             </div>
             <div className="p-20 overflow-y-auto text-xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium">
                {loading ? "Robot AI đang soạn thảo..." : aiResponse}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;