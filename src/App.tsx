import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // DANH SÁCH DỮ LIỆU ĐẦY ĐỦ THEO CTGDPT 2018
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "Khoa học tự nhiên", "Hoạt động trải nghiệm", "Nghệ thuật"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Hỗn hợp", "Trung bình", "Khá", "Yếu"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [doiTuong, setDoiTuong] = useState("Hỗn hợp");
  const [soTiet, setSoTiet] = useState("3");
  const [tenBai, setTenBai] = useState("Ứng phó với tình huống nguy hiểm");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HỆ THỐNG MẪU LỆNH CHI TIẾT THEO YÊU CẦU CỦA THẦY TÙNG
  const menuPrompts = [
    {
      title: "📑 SOẠN KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Bài: ${tenBai}\n• Số tiết: ${soTiet}\n• Đối tượng học sinh: ${doiTuong}\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      title: "💻 SOẠN SLIDE TRÌNH CHIẾU",
      content: `Hãy thiết kế kịch bản nội dung Slide bài giảng cho bài: ${tenBai} (Môn ${monHoc} - ${khoiLop}).\nYêu cầu:\n- Chia theo từng Slide rõ ràng.\n- Gợi ý hình ảnh minh họa cho công cụ AI Image Generator.\n- Nội dung cô đọng, phù hợp trình chiếu Canva/Powerpoint.`
    },
    {
      title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP",
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\n\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.`
    },
    {
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7991.\n\n• Môn: ${monHoc}\n• Lớp: ${khoiLop}\n• Thời gian làm bài: [45 phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh để phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.`
    }
  ];

  const handleAiAction = async (type: 'AI' | 'IMAGE') => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy Tùng hãy kiểm tra API Key trên Vercel!");
    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const promptText = type === 'IMAGE' 
        ? `Tạo prompt siêu chi tiết (tiếng Anh) để AI vẽ ảnh minh họa cho nội dung bài giảng này: ${customPrompt}` 
        : customPrompt;
      const result = await model.generateContent(promptText);
      setAiResponse(result.response.text());
      if (type === 'AI') confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("❌ Lỗi: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020817] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-20 bg-[#0f172a]/90 border-b border-blue-900/50 px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-blue-500/50 shadow-lg font-black text-white italic">⚡</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">NGUYỄN THANH TÙNG</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">BÌNH HÒA</p>
          </div>
        </div>
        <div className="bg-orange-600 px-8 py-2.5 rounded-full text-white font-black text-sm shadow-xl animate-pulse tracking-tight">CHÀO MỪNG QUÝ THẦY CÔ !</div>
        <div className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest italic">HỆ THỐNG V36.9 PRO</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 space-y-3 shadow-2xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">⚙️ Thiết lập môn học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-black border border-slate-700 rounded-xl p-3 text-xs text-white outline-none" placeholder="Tiết..." />
              <select value={doiTuong} onChange={(e)=>setDoiTuong(e.target.value)} className="bg-black border border-slate-700 rounded-xl p-3 text-[10px] text-white outline-none font-bold">
                {dsDoiTuong.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài học..." />
            
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-[#f97316] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:brightness-110 transition-all">
                📜 TẠO PROMPT MẪU ▼
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-blue-500/50 rounded-2xl z-[999] overflow-hidden shadow-2xl">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-blue-600 text-[9px] font-black border-b border-slate-800 last:border-0 uppercase text-white transition-colors tracking-tighter">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b]/40 p-6 rounded-[2rem] border border-slate-800 flex-1 flex flex-col min-h-0 relative">
            <h2 className="text-[10px] font-black text-slate-500 uppercase italic mb-3">📁 Hồ sơ tài liệu</h2>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 transition-all relative">
               <span className="text-4xl mb-1 text-blue-500 font-black">+</span>
               <p className="text-[9px] text-slate-500 uppercase font-black">Gắn tài liệu, ảnh</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple />
            </div>
          </div>

          <button onClick={() => handleAiAction('AI')} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all italic">
             🚀 Kích hoạt hệ thống
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 border-b border-slate-800 flex justify-between items-center bg-black/10">
              <span className="text-[10px] font-black text-blue-500/50 tracking-[0.3em] uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase">Làm mới nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-lg text-slate-300 outline-none resize-none leading-relaxed custom-scrollbar" placeholder="Nội dung chuyên sâu sẽ hiển thị tại đây..." />
            
            <div className="absolute bottom-10 right-10 flex gap-4">
               <button onClick={() => handleAiAction('IMAGE')} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">🎨 Minh họa AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all italic">🎨 Canva</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_ThayTung.docx")} className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all">♻️ Xuất file hồ sơ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-12">
          <div className="bg-[#020817] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/20 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-slate-800 flex justify-between bg-slate-900/40">
                <span className="font-black text-blue-400 uppercase text-[10px] tracking-[0.3em] italic">Next-Gen Intelligence AI (Gemini 2.5 Active)</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500 font-bold">✕ ĐÓNG</button>
             </div>
             <div className="p-20 overflow-y-auto text-xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium">
                {loading ? "Hệ thống đang thực thi trí tuệ nhân tạo chuyên sâu..." : aiResponse}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;