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
  
  // State mới để Thầy gõ chữ vào trợ lý
  const [chatInput, setChatInput] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const menuPrompts = [
    {
      title: "📑 SOẠN BÀI GIẢNG (20 NĂM KN)",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Bài: ${tenBai}`
    }
  ];

  // HÀM XỬ LÝ CHAT HAI CHIỀU VỚI GEMINI 2.5 FLASH
  const handleAiAction = async (inputQuery?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy vui lòng cấu hình API Key!");
    
    const finalPrompt = inputQuery || customPrompt;
    if (!finalPrompt.trim()) return alert("Vui lòng nhập nội dung!");

    setLoading(true); 
    setIsChatOpen(true); 
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Model ổn định theo yêu cầu của Thầy
      const result = await model.generateContent(finalPrompt);
      const text = result.response.text();
      
      // Nếu là chat tiếp, cộng dồn nội dung, nếu là lệnh mới thì thay thế
      setAiResponse(prev => inputQuery ? prev + "\n\n--- Trả lời bổ sung ---\n\n" + text : text);
      setChatInput(""); // Xóa ô nhập sau khi gửi
      confetti({ particleCount: 100, spread: 70 });
    } catch (e: any) { 
      setAiResponse(prev => prev + "\n❌ Lỗi: " + e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-200 overflow-hidden flex flex-col font-sans relative">
      {/* HEADER & SIDEBAR GIỮ NGUYÊN THEO THIẾT KẾ CỦA THẦY */}
      <header className="h-44 bg-emerald-700 px-10 flex justify-between items-center shrink-0 shadow-2xl z-50">
        <div className="flex items-center gap-8">
          <div onClick={() => avatarInputRef.current?.click()} className="w-28 h-28 rounded-full border-[5px] border-white/40 overflow-hidden cursor-pointer bg-emerald-800 flex items-center justify-center">
            {avatar ? <img src={avatar} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[11px] text-white/80 font-black">LOGO</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <h1 className="text-white text-base font-black uppercase">Ứng dụng soạn giảng năng lực số</h1>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-28 py-6 rounded-3xl text-white font-black text-4xl uppercase shadow-2xl">
           Chào mừng quý thầy cô !
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-hidden">
        {/* SIDEBAR BÊN TRÁI */}
        <aside className="col-span-3 space-y-8 flex flex-col">
          <div className="bg-[#1e293b] rounded-2xl p-8 space-y-5 border border-slate-700">
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 p-4 rounded-xl text-white outline-none focus:border-emerald-500">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest">📜 CHỌN MẪU LỆNH</button>
          </div>
          <button onClick={() => handleAiAction()} disabled={loading} className="w-full py-7 bg-blue-600 text-white rounded-2xl font-black text-base uppercase shadow-2xl">
             🚀 KÍCH HOẠT HỆ THỐNG
          </button>
        </aside>

        {/* WORKSPACE CHÍNH */}
        <section className="col-span-9">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl">
            <div className="px-12 py-7 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[11px] font-black text-orange-500 uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-16 text-2xl text-slate-200 outline-none resize-none" placeholder="Nội dung chuyên sâu..." />
          </div>
        </section>
      </main>

      {/* CỬA SỔ CHAT AI - CÓ THỂ GÕ CHỮ */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-10">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[2.5rem] border border-emerald-500/30 flex flex-col overflow-hidden">
             <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white shrink-0">
                <span className="font-black uppercase text-sm tracking-[0.2em]">Hệ thống Gemini 2.5 Flash</span>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/30 transition-all font-black text-[10px] uppercase">✕ Đóng</button>
             </div>
             
             {/* PHẦN HIỂN THỊ NỘI DUNG */}
             <div className="flex-1 p-15 overflow-y-auto text-2xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar p-10">
                {loading && !aiResponse ? (
                   <div className="flex flex-col items-center justify-center h-full gap-5">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-emerald-500 uppercase font-black tracking-widest animate-pulse">Đang kiến tạo...</p>
                   </div>
                ) : aiResponse}
             </div>

             {/* Ô NHẬP LIỆU ĐỂ THẦY GÕ CHỮ TRỰC TIẾP */}
             <div className="p-8 bg-[#0f172a] border-t border-slate-800 flex gap-5">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiAction(chatInput)}
                  placeholder="Thầy muốn yêu cầu Robot chỉnh sửa gì thêm? (Ví dụ: Soạn thêm trắc nghiệm cho bài này...)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500 text-lg shadow-inner"
                />
                <button 
                  onClick={() => handleAiAction(chatInput)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? "..." : "GỬI LỆNH"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;