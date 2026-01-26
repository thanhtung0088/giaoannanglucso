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
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA môn ${monHoc} (${khoiLop}) bài ${tenBai} theo Thông tư 22 và định hướng 7991.\n\nYêu cầu:\n1. Thiết lập ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao).\n2. Xây dựng đề kiểm tra hoàn chỉnh.\n3. Cung cấp đáp án và hướng dẫn chấm chi tiết.\n4. Bảng thang điểm rõ ràng.\n5. Nhận xét mức độ phân hóa và tính phù hợp của đề.`
    }
  ];

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key!");
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
    <div className="h-screen bg-slate-50 text-slate-800 overflow-hidden flex flex-col font-sans relative">
      {/* TRỢ LÝ AI - BÊN PHẢI VỚI HIỆU ỨNG SÁNG */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center animate-bounce duration-[4000ms]">
        <div className="bg-emerald-500/10 backdrop-blur-md p-3 rounded-xl border border-emerald-200 mb-2 shadow-lg">
           <p className="text-[9px] font-black text-emerald-700 uppercase">Sẵn sàng hỗ trợ Thầy!</p>
        </div>
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
          <span className="text-5xl animate-pulse">🤖</span>
        </div>
      </div>

      {/* HEADER CHIỀU CAO TĂNG 1/3 - MÀU XANH NGỌC BÍCH GLASS */}
      <header className="h-40 bg-emerald-600/85 backdrop-blur-2xl border-b-[4px] border-white/20 px-12 flex justify-between items-center shrink-0 shadow-[0_15px_35px_rgba(5,150,105,0.2)] z-50">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-24 h-24 rounded-full border-[4px] border-white/50 overflow-hidden cursor-pointer hover:rotate-2 transition-all bg-white/20 flex items-center justify-center shadow-2xl"
          >
            {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black">ẢNH GV</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-white">
            <h1 className="text-lg font-black uppercase tracking-[0.2em] drop-shadow-md">Ứng dụng soạn giảng năng lực số thế hệ mới</h1>
            <p className="text-xs font-bold text-emerald-100 uppercase mt-1 opacity-90">Năm học: 2025-2026</p>
            <p className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-widest italic">Thiết kế bởi: Thanh Tùng</p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/30 px-24 py-5 rounded-2xl text-white font-black text-3xl shadow-inner animate-pulse tracking-[0.2em] backdrop-blur-md">
           CHÀO MỪNG QUÝ THẦY CÔ !
        </div>

        <div className="flex items-center gap-5">
           <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="bg-white/20 hover:bg-white/40 p-4 rounded-2xl border border-white/30 transition-all shadow-xl flex flex-col items-center gap-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📹</span>
              <span className="text-[9px] font-black text-white uppercase">Google Meet</span>
           </button>
           <button onClick={() => alert("Hệ thống quét QR đang mở...")} className="bg-white/20 hover:bg-white/40 p-4 rounded-2xl border border-white/30 transition-all shadow-xl flex flex-col items-center gap-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
              <span className="text-[9px] font-black text-white uppercase">Quét QR</span>
           </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-10 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-white p-8 rounded-2xl border border-emerald-100 space-y-5 shadow-xl">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic mb-2">⚙️ THIẾT LẬP THÔNG SỐ</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-emerald-100 rounded-xl p-4 text-xs font-bold text-emerald-900 outline-none focus:ring-2 ring-emerald-400">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-emerald-100 rounded-xl p-4 text-xs font-bold text-emerald-900 outline-none focus:ring-2 ring-emerald-400">
              <option value="">-- Chọn Khối lớp --</option>
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-50 border border-emerald-100 rounded-xl p-4 text-xs font-bold text-emerald-900 outline-none" placeholder="Nhập tên bài dạy..." />
            
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-orange-500 text-white rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-orange-600 transition-all tracking-widest">
               📜 TẠO PROMPT MẪU ▼
            </button>
            {showPromptMenu && (
              <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden mt-2 shadow-2xl animate-in slide-in-from-top-2">
                {menuPrompts.map((p, i) => (
                  <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-5 hover:bg-emerald-50 text-[10px] font-black border-b border-emerald-50 last:border-0 uppercase text-emerald-800 transition-all">{p.title}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-emerald-100 flex-1 flex flex-col min-h-0 shadow-xl">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase italic mb-4 tracking-widest">📁 HỒ SƠ TÀI LIỆU</h2>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-emerald-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-all">
               <span className="text-5xl mb-2 text-emerald-400 font-light">+</span>
               <p className="text-[10px] text-emerald-600 uppercase font-black">Nạp tài liệu</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase shadow-[0_15px_40px_rgba(5,150,105,0.3)] hover:bg-emerald-700 active:scale-95 transition-all italic tracking-[0.2em]">
             🚀 KÍCH HOẠT HỆ THỐNG
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-emerald-100 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-12 py-6 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
              <span className="text-[11px] font-black text-emerald-700 tracking-[0.4em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-emerald-400 hover:text-red-500 uppercase tracking-widest transition-colors">XÓA BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-16 text-xl text-slate-700 outline-none resize-none leading-relaxed font-medium placeholder:text-emerald-100" placeholder="Chọn mẫu lệnh hoặc nhập nội dung tại đây..." />
            
            <div className="absolute bottom-12 right-12 flex gap-5">
               <button onClick={() => alert("Kích hoạt minh họa AI...")} className="px-10 py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-10 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl transition-all italic">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_NangLucSo.docx")} className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl transition-all">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-md z-[1000] flex items-center justify-center p-16">
          <div className="bg-white w-full max-w-7xl h-[80vh] rounded-3xl border border-emerald-100 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-10 border-b border-emerald-50 flex justify-between items-center bg-emerald-600 text-white">
                <span className="font-black uppercase text-sm tracking-widest italic">Hệ thống Tri thức số - Gemini 2.0 Flash</span>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-3 rounded-full bg-white/20 hover:bg-white/40 transition-all font-black text-[10px] uppercase border border-white/30">✕ ĐÓNG</button>
             </div>
             <div className="p-24 overflow-y-auto text-2xl leading-[2] text-slate-700 whitespace-pre-wrap font-medium custom-scrollbar">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-20 h-20 border-8 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-emerald-600 tracking-[0.5em] uppercase animate-pulse">Đang biên soạn nội dung...</p>
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