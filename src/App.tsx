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
      content: `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG cho bài ${tenBai} (${khoiLop}) theo định hướng chương trình GDPT 2018.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.\n4. Câu hỏi gợi mở chuyên sâu cho học sinh.\n5. Ví dụ minh họa và bài tập mẫu vận dụng.\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ.\n7. Ghi chú sư phạm quan trọng.\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP",
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP môn ${monHoc} cho học sinh ${khoiLop} bài ${tenBai}.\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ).\n2. Các công thức, quy tắc hoặc nội dung cốt lõi cần thuộc.\n3. Tổng hợp các dạng bài thường gặp.\n4. Ví dụ minh họa chi tiết cho từng dạng.\n5. Các lưu ý quan trọng khi làm bài để tránh mất điểm.\n\nTrình bày dạng gạch đầu dòng, ngôn ngữ phù hợp để phát cho học sinh.`
    }
  ];

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy thiết lập API Key!");
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
      {/* TRỢ LÝ AI - BÊN PHẢI */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center animate-bounce duration-[4000ms]">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 mb-2 shadow-2xl">
           <p className="text-[9px] font-black text-blue-400 uppercase">Hỗ trợ Thầy Tùng!</p>
        </div>
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border-2 border-white/30">
          <span className="text-4xl animate-pulse">🤖</span>
        </div>
      </div>

      {/* HEADER TĂNG CHIỀU CAO 1/3 + VIỀN GLASS 3D */}
      <header className="h-32 bg-[#0f172a]/80 backdrop-blur-xl border-b-[3px] border-white/10 px-10 flex justify-between items-center shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-20 h-20 rounded-full border-[3px] border-orange-500/50 overflow-hidden cursor-pointer hover:scale-105 transition-all bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.3)]"
          >
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-[10px] text-orange-400 font-bold">ẢNH GV</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest mb-1">Ứng dụng soạn giảng năng lực số thế hệ mới</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase">Năm học: 2025-2026</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Thiết kế bởi: Thanh Tùng</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 px-16 py-4 rounded-xl text-white font-black text-2xl shadow-2xl animate-pulse tracking-[0.1em] border border-white/20">
           CHÀO MỪNG QUÝ THẦY CÔ !
        </div>

        <div className="flex items-center gap-4">
           {/* NÚT GOOGLE MEET */}
           <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all shadow-lg group">
              <span className="text-xl group-hover:scale-110 transition-transform">📹</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Google Meet</span>
           </button>
           {/* NÚT QUÉT QR */}
           <button onClick={() => alert("Hệ thống đang mở Camera quét mã QR...")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all shadow-lg group">
              <span className="text-xl group-hover:scale-110 transition-transform">🔍</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Quét QR</span>
           </button>
           <div className="w-[1px] h-10 bg-white/10 mx-2"></div>
           <div className="text-[10px] font-black text-blue-500/40 uppercase tracking-[0.2em] italic">V37.5 PRO</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">⚙️ THIẾT LẬP THÔNG SỐ</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors">
              <option value="">-- Chọn Khối lớp --</option>
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-orange-500" placeholder="Tên bài học thực tế..." />
            
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:brightness-110 transition-all">
               📜 TẠO PROMPT MẪU ▼
            </button>
            {showPromptMenu && (
              <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden mt-2 shadow-2xl">
                {menuPrompts.map((p, i) => (
                  <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-orange-600 text-[10px] font-black border-b border-white/5 last:border-0 uppercase text-white transition-all">{p.title}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black text-slate-500 uppercase italic mb-3">📁 HỒ SƠ TÀI LIỆU</h2>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
               <span className="text-4xl mb-1 text-orange-500 font-light">+</span>
               <p className="text-[10px] text-slate-500 uppercase font-black">Thêm tài liệu</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-sm uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all italic tracking-widest">
             🚀 KÍCH HOẠT TRÍ TUỆ SỐ
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 border-b border-white/10 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black text-orange-500 tracking-[0.3em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest">XÓA BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-300 outline-none resize-none leading-relaxed custom-scrollbar font-medium" placeholder="Nội dung chuyên sâu..." />
            
            <div className="absolute bottom-10 right-10 flex gap-4">
               <button onClick={() => alert("Nạp Prompt minh họa...")} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all italic">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_NangLucSo.docx")} className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">♻️ XUẤT FILE</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-12">
          <div className="bg-[#020817] w-full max-w-6xl h-[80vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                <span className="font-black text-blue-400 uppercase text-xs tracking-widest italic">Intelligence System - Gemini 2.0 Flash</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500 font-black text-xs uppercase">✕ Đóng</button>
             </div>
             <div className="p-20 overflow-y-auto text-2xl leading-[2] text-slate-300 whitespace-pre-wrap font-medium">
                {loading ? "Đang kiến tạo tri thức..." : aiResponse}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;