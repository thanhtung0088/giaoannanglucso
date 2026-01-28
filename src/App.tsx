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
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4 LỰA CHỌN PROMPT MẪU - ĐÃ BỎ THAM SỐ TRÙNG LẶP [cite: 2026-01-17]
  const menuPrompts = [
    {
      id: "5512",
      title: "📑 Soạn KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${tenBai}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      id: "PPT",
      title: "💻 Soạn bài giảng điện tử",
      content: `Hãy thiết kế cấu trúc Slide bài giảng điện tử cho bài "${tenBai}" môn ${monHoc} ${khoiLop}. \n\nYêu cầu:\n- Phân chia nội dung từng slide.\n- Gợi ý hình ảnh minh họa AI cho từng slide.\n- Thiết kế hoạt động tương tác sinh động.`
    },
    {
      id: "7991",
      title: "✍️ Soạn đề kiểm tra (Ma trận 7991)",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} theo Thông tư 22 và định hướng 7991.\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết và Thang điểm.`
    },
    {
      id: "ONTAP",
      title: "📚 Soạn đề cương ôn tập",
      content: `Trong vai một giáo viên giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho môn ${monHoc} lớp ${khoiLop}.\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm.\n2. Các dạng bài tập thường gặp.\n3. Lưu ý khi làm bài.`
    }
  ];

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy vui lòng cấu hình API Key!");
    const promptToSend = overridePrompt || customPrompt;
    if (!promptToSend.trim()) return alert("Vui lòng chọn hoặc nhập nội dung!");

    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(promptToSend);
      const responseText = result.response.text();
      setAiResponse(prev => overridePrompt ? prev + "\n\n--- Trả lời bổ sung ---\n\n" + responseText : responseText);
      setChatInput("");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      setAiResponse(`❌ Lỗi: [GoogleGenerativeAI Error]: ${e.message}. (Thầy hãy thử lại sau ít phút do máy chủ quá tải)`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden cursor-pointer bg-emerald-800 flex items-center justify-center">
            {avatar ? <img src={avatar} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[10px] text-white/50 font-black">LOGO</span>}
            <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => e.target.files && setAvatar(URL.createObjectURL(e.target.files[0]))} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase">Ứng dụng soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200">THIẾT KẾ BỞI: THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase tracking-widest">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        {/* SIDEBAR TRÁI */}
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase italic">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              <option value="">-- Chọn Môn học --</option>
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              <option value="">-- Chọn Khối lớp --</option>
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài dạy thực tế..." />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
              <input type="text" value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Đối tượng HS..." />
            </div>

            {/* NÚT TẠO PROMPT MẪU VỚI MENU ĐỔ XUỐNG */}
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg flex justify-center items-center gap-2">
                📑 TẠO PROMPT MẪU {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  {menuPrompts.map((p) => (
                    <button key={p.id} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 last:border-0 transition-colors">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* HỒ SƠ TÀI LIỆU VỚI DẤU + */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu</div>
            <div className="p-6 flex-1 flex flex-col">
              <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/5 transition-all">
                <span className="text-6xl text-emerald-500 font-thin mb-2">+</span>
                <p className="text-[9px] text-slate-500 uppercase font-black text-center px-2">Đưa tài liệu minh chứng vào đây</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple />
              </div>
            </div>
          </div>

          <button onClick={() => handleAiAction()} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-2xl hover:bg-blue-500 transition-all italic tracking-[0.3em]">🚀 KÍCH HOẠT HỆ THỐNG</button>
        </aside>

        {/* WORKSPACE */}
        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase">LÀM MỚI BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-200 outline-none resize-none custom-scrollbar" placeholder="Nội dung chuyên sâu..." />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "GiaoAn.docx")} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL TRỢ LÝ AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-8">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[2.5rem] border border-emerald-500/30 flex flex-col overflow-hidden">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white shrink-0">
                <span className="font-black uppercase text-xs tracking-widest italic">🤖 HỆ THỐNG TRỢ LÝ GEMINI 2.5 FLASH</span>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-2 rounded-full bg-white/10 hover:bg-white/30 transition-all font-black text-[9px] uppercase border border-white/20">✕ ĐÓNG CỬA SỔ</button>
             </div>
             <div className="flex-1 p-16 overflow-y-auto text-xl leading-relaxed text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar">
                {loading && !aiResponse ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-16 h-16 border-8 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Đang kiến tạo...</p>
                   </div>
                ) : aiResponse}
             </div>
             <div className="p-6 bg-[#0f172a] border-t border-slate-800 flex gap-4">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiAction(chatInput)} placeholder="Thầy gõ yêu cầu điều chỉnh tại đây..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500 text-lg shadow-inner" />
                <button onClick={() => handleAiAction(chatInput)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all">GỬI LỆNH</button>
             </div>
          </div>
        </div>
      )}
      
      {/* NÚT TRỢ LÝ ROBOT GÓC PHẢI */}
      <div className="fixed bottom-6 right-6 z-[100] cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsChatOpen(true)}>
         <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] border-4 border-white">
            <span className="text-4xl animate-bounce">🤖</span>
         </div>
      </div>
    </div>
  );
};

export default App;