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
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  // GIỮ NGUYÊN 4 LỆNH MẪU THEO YÊU CẦU CỦA THẦY [cite: 2026-01-17]
  const menuPrompts = [
    {
      title: "📑 SOẠN KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Bài: ${tenBai}\n• Số tiết: ${soTiet}\n• Đối tượng học sinh: ${doiTuongHS}\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      title: "💻 SOẠN SLIDE TRÌNH CHIẾU",
      content: `Dựa trên nội dung bài dạy: ${tenBai}, hãy soạn cấu trúc Slide trình chiếu sinh động.\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n\nYêu cầu:\n- Phân chia nội dung theo từng Slide (Tiêu đề, Hình ảnh gợi ý, Nội dung chính)\n- Các hoạt động tương tác trên lớp.\n- Liên kết thực tế.`
    },
    {
      title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP",
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\n\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.`
    },
    {
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7791.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Thời gian làm bài: [Số phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh đề phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.`
    }
  ];

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy vui lòng cấu hình API Key!");
    const promptToSend = overridePrompt || customPrompt;
    if (!promptToSend.trim()) return alert("Workspace đang trống!");

    setLoading(true); setIsChatOpen(true); 
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Chốt bản ổn định [cite: 2026-01-23]
      const result = await model.generateContent(promptToSend);
      const text = result.response.text();
      setAiResponse(prev => overridePrompt ? prev + "\n\n--- Bổ sung ---\n\n" + text : text);
      setChatInput("");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("❌ Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-200 overflow-hidden flex flex-col relative">
      <header className="h-44 bg-emerald-700/90 backdrop-blur-xl border-b-[4px] border-emerald-900 px-10 flex justify-between items-center z-50 shadow-2xl">
        <div className="flex items-center gap-8">
          <div onClick={() => avatarInputRef.current?.click()} className="w-28 h-28 rounded-full border-[5px] border-white/40 overflow-hidden cursor-pointer bg-emerald-800 flex items-center justify-center">
            {avatar ? <img src={avatar} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[11px] text-white/80 font-black">DÁN LOGO</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-white">
            <h1 className="text-base font-black uppercase">Ứng dụng soạn giảng năng lực số thế hệ mới</h1>
            <p className="text-xs font-bold text-emerald-200 mt-1 uppercase">Năm học: 2025-2026</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 px-28 py-6 rounded-3xl text-white font-black text-4xl shadow-2xl animate-pulse uppercase">Chào mừng quý thầy cô !</div>
        <div className="flex gap-5">
           <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="bg-white/10 p-5 rounded-2xl border border-white/20"><span className="text-3xl">📹</span></button>
           <button className="bg-white/10 p-5 rounded-2xl border border-white/20"><span className="text-3xl">🔍</span></button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-hidden">
        <aside className="col-span-3 space-y-8 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-[#0f172a] px-8 py-5 border-b border-slate-700 text-emerald-500 font-black italic text-[11px] uppercase">⚙️ Thiết lập thông số</div>
            <div className="p-8 space-y-5">
              <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-emerald-500">
                <option value="">-- Chọn Môn học --</option>
                {dsMonHoc.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-emerald-500">
                <option value="">-- Chọn Khối lớp --</option>
                {dsKhoi.map(k => <option key={k}>{k}</option>)}
              </select>
              <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none" placeholder="Tên bài học thực tế..." />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
                <input type="text" value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none" placeholder="Đối tượng HS..." />
              </div>
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg">📜 TẠO PROMPT MẪU ▼</button>
              {showPromptMenu && (
                <div className="bg-[#0f172a] border border-slate-700 rounded-xl overflow-hidden mt-2">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-5 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-800 last:border-0">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl">
            <div className="bg-[#0f172a] px-8 py-5 border-b border-slate-700 text-emerald-500 font-black italic text-[11px] uppercase">📁 Hồ sơ tài liệu</div>
            <div className="p-8 flex-1 flex flex-col">
              <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/5 group">
                <span className="text-6xl text-emerald-500 group-hover:scale-110 transition-transform">+</span>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-center px-4">Đưa tài liệu, ảnh minh chứng vào đây</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple />
              </div>
            </div>
          </div>

          <button onClick={() => handleAiAction()} disabled={loading} className="w-full py-7 bg-blue-600 text-white rounded-2xl font-black text-base uppercase shadow-2xl hover:bg-blue-500 transition-all italic tracking-[0.4em]">🚀 KÍCH HOẠT TRÍ TUỆ SỐ</button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-12 py-7 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[11px] font-black text-orange-500 tracking-[0.4em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase">XÓA BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-16 text-2xl text-slate-200 outline-none resize-none leading-relaxed font-medium custom-scrollbar" placeholder="Nội dung soạn giảng chuyên sâu..." />
            <div className="absolute bottom-12 right-12 flex gap-6">
               <button onClick={() => alert("Kích hoạt Hình ảnh AI...")} className="px-12 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl transition-all">🖼️ MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "GiaoAn_Digital.docx")} className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl">♻️ XUẤT FILE HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[1000] flex items-center justify-center p-10">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[2.5rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white shrink-0">
                <span className="font-black uppercase text-sm tracking-[0.2em] italic">⚡ Gemini 2.5 Flash - Trợ lý AI sẵn sàng</span>
                <button onClick={() => setIsChatOpen(false)} className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/30 transition-all font-black text-[10px] uppercase border border-white/20">✕ Đóng kết quả</button>
             </div>
             <div className="flex-1 p-20 overflow-y-auto text-2xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar">
                {loading && !aiResponse ? (
                   <div className="flex flex-col items-center justify-center h-full gap-10">
                      <div className="w-20 h-20 border-[8px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.6em] animate-pulse">Đang kiến tạo tri thức số...</p>
                   </div>
                ) : aiResponse}
             </div>
             <div className="p-8 bg-[#0f172a] border-t border-slate-800 flex gap-6">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiAction(chatInput)} placeholder="Thầy gõ yêu cầu điều chỉnh tại đây..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-10 py-6 text-white outline-none focus:border-emerald-500 text-xl" />
                <button onClick={() => handleAiAction(chatInput)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-6 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">GỬI LỆNH</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;