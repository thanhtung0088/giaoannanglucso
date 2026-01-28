import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BỘ PROMPT MẪU BẤT DI BẤT DỊCH CỦA THẦY [cite: 2026-01-17]
  const menuPrompts = [
    {
      title: "📑 Soạn KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${tenBai}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      title: "💻 Soạn bài giảng điện tử",
      content: `Dựa trên bài dạy "${tenBai}" môn ${monHoc} ${khoiLop}, hãy soạn cấu trúc Slide trình chiếu sinh động.\n\nYêu cầu:\n- Phân chia nội dung theo từng Slide (Tiêu đề, gợi ý hình ảnh, nội dung cốt lõi)\n- Thiết kế các hoạt động tương tác, trò chơi giáo dục giữa giờ.\n- Gợi ý phong cách trình bày chuyên nghiệp.`
    },
    {
      title: "✍️ Soạn đề kiểm tra (Ma trận 7991)",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} theo Thông tư 22 và định hướng 7991.\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh.`
    },
    {
      title: "📚 Soạn đề cương ôn tập",
      content: `Trong vai một giáo viên giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho môn ${monHoc} lớp ${khoiLop}.\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\n\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.`
    }
  ];

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy cấu hình lại API Key ạ!");
    const promptToSend = overridePrompt || customPrompt;

    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(promptToSend);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("❌ Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-xl">
             <span className="text-[10px] text-white font-black text-center">THCS<br/>BÌNH HÒA</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase tracking-tight italic underline decoration-orange-500">Ứng dụng soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase tracking-widest animate-pulse">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase italic">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài dạy thực tế..." />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
              <input type="text" value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Đối tượng HS..." />
            </div>

            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg flex justify-center items-center gap-2 hover:bg-orange-500 transition-colors">
                📜 TẠO PROMPT MẪU {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 last:border-0 transition-colors">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Danh sách tài liệu</div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-28 shrink-0 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all mb-4 group">
                <span className="text-5xl text-emerald-500 font-thin group-hover:scale-125 transition-transform">+</span>
                <p className="text-[9px] text-slate-500 uppercase font-black">Nạp tài liệu từ máy</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center italic">
                    <span className="truncate w-40 font-bold text-emerald-300">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-black">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => handleAiAction()} disabled={loading} className={`w-full py-7 rounded-2xl font-black text-sm uppercase shadow-2xl transition-all italic tracking-[0.3em] ${loading ? 'bg-orange-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}>
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 BẮT ĐẦU SOẠN BÀI"}
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic underline decoration-2">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase">LÀM MỚI BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-100 outline-none resize-none custom-scrollbar leading-[1.8] font-medium" placeholder="Thầy vui lòng chọn Prompt mẫu hoặc nhập nội dung tại đây..." />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button className="px-8 py-4 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-purple-500">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-500">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_GiaoAn.docx")} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {/* TRANG PREVIEW / TRỢ LÝ AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000] flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[3rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                   <span className="text-3xl animate-bounce">🤖</span>
                   <span className="font-black uppercase text-xs tracking-[0.4em] italic">PREVIEW KẾT QUẢ SOẠN GIẢNG GEMINI 2.5 FLASH</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/30 transition-all font-black text-[9px] uppercase border border-white/20">✕ ĐÓNG CỬA SỔ</button>
             </div>
             <div className="flex-1 p-16 overflow-y-auto text-2xl leading-[2] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar selection:bg-emerald-500/30">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-16 h-16 border-8 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Hệ thống đang kiến tạo nội dung môn {monHoc}...</p>
                   </div>
                ) : aiResponse || "Vui lòng nhập lệnh để AI bắt đầu."}
             </div>
             <div className="p-6 bg-[#0f172a] border-t border-slate-800 flex gap-4">
                <input type="text" placeholder="Thầy gõ yêu cầu điều chỉnh tại đây..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500 text-lg shadow-inner" />
                <button onClick={() => handleAiAction()} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs transition-all shadow-xl">GỬI LỆNH</button>
             </div>
          </div>
        </div>
      )}

      {/* ROBOT TRỢ LÝ GÓC PHẢI */}
      <div className="fixed bottom-8 right-8 z-[100] cursor-pointer group" onClick={() => setIsChatOpen(true)}>
         <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-white animate-pulse group-hover:scale-110 transition-transform">
            <span className="text-5xl">🤖</span>
         </div>
      </div>
    </div>
  );
};

export default App;