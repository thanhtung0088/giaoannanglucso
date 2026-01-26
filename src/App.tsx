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
    },
    {
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA môn ${monHoc} (${khoiLop}) bài ${tenBai} theo Thông tư 22 và định hướng 7991.\n\nYêu cầu:\n1. Thiết lập ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao).\n2. Xây dựng đề kiểm tra hoàn chỉnh.\n3. Cung cấp đáp án và hướng dẫn chấm chi tiết.\n4. Bảng thang điểm rõ ràng.\n5. Nhận xét mức độ phân hóa và tính phù hợp của đề.`
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
    } catch (e: any) { setAiResponse("❌ Lỗi hệ thống: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020817] text-slate-200 overflow-hidden flex flex-col font-sans relative">
      {/* TRỢ LÝ AI - CHUYỂN SANG BÊN PHẢI */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center animate-bounce duration-[4000ms]">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 mb-2 shadow-2xl">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Sẵn sàng hỗ trợ Thầy!</p>
        </div>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border-2 border-white/20">
          <span className="text-5xl animate-pulse">🤖</span>
        </div>
      </div>

      <header className="h-24 bg-[#0f172a]/95 border-b border-blue-900/50 px-10 flex justify-between items-center shrink-0 shadow-2xl">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-2 border-orange-500 overflow-hidden cursor-pointer hover:rotate-3 transition-all bg-slate-800 flex items-center justify-center shadow-lg shadow-orange-500/20"
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

        {/* CHỮ CHÀO MỪNG GIÃN RỘNG */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 px-24 py-4 rounded-full text-white font-black text-2xl shadow-[0_10px_40px_rgba(234,88,12,0.3)] animate-pulse tracking-[0.2em]">
           CHÀO MỪNG QUÝ THẦY CÔ !
        </div>

        <div className="text-[10px] font-black text-blue-500/30 uppercase tracking-[0.3em] italic">V37.2 PRO</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        <aside className="col-span-3 space-y-5 flex flex-col min-h-0">
          <div className="bg-[#1e293b]/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-2xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-2">⚙️ THIẾT LẬP THÔNG SỐ</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors">
              <option value="">-- Chọn Khối lớp --</option>
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-black border border-slate-700 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors" placeholder="Tên bài học thực tế..." />
            
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase shadow-xl hover:scale-[1.02] transition-all">
               📜 TẠO PROMPT MẪU ▼
            </button>
            {showPromptMenu && (
              <div className="bg-[#0f172a] border border-blue-500/50 rounded-2xl overflow-hidden mt-2 shadow-2xl">
                {menuPrompts.map((p, i) => (
                  <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-5 hover:bg-orange-600 text-[10px] font-black border-b border-slate-800 last:border-0 uppercase text-white transition-all">{p.title}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1e293b]/40 p-8 rounded-[2.5rem] border border-slate-800 flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black text-slate-500 uppercase italic mb-4 tracking-widest">📁 HỒ SƠ TÀI LIỆU</h2>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-600/5 transition-all">
               <span className="text-5xl mb-2 text-orange-500 font-light">+</span>
               <p className="text-[10px] text-slate-500 uppercase font-black">Đưa tài liệu tham khảo vào</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-95 transition-all italic">
             🚀 KÍCH HOẠT TRÍ TUỆ SỐ
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#0f172a]/40 backdrop-blur-3xl rounded-[4rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-12 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[11px] font-black text-orange-500 tracking-[0.4em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors">XÓA BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-16 text-xl text-slate-300 outline-none resize-none leading-relaxed custom-scrollbar font-medium" placeholder="Nội dung chuyên sâu sẽ tự động nạp khi chọn mẫu lệnh hoặc Thầy tự nhập tại đây..." />
            
            <div className="absolute bottom-12 right-12 flex gap-5">
               <button onClick={() => alert("Hệ thống đang nạp Prompt minh họa...")} className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase shadow-2xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-10 py-5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[1.5rem] text-[11px] font-black uppercase shadow-2xl transition-all italic">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_NangLucSo.docx")} className="px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white rounded-[1.5rem] text-[11px] font-black uppercase shadow-2xl transition-all">♻️ XUẤT FILE HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-16">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[5rem] border border-blue-500/20 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)]">
             <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-4">
                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                   <span className="font-black text-blue-400 uppercase text-xs tracking-[0.4em] italic">Intelligence System - Gemini 2.0 Flash</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-3 rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase">✕ ĐÓNG CỬA SỔ</button>
             </div>
             <div className="p-24 overflow-y-auto text-2xl leading-[2] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-blue-500 tracking-[0.5em] uppercase animate-pulse">Đang kiến tạo tri thức...</p>
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