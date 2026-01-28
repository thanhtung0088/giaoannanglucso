import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsSoTiet = ["1", "2", "3", "4"];
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH (Hòa nhập)"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Khá");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HÀM LẤY NỘI DUNG PROMPT MẪU BẤT DI BẤT DỊCH [cite: 2026-01-17]
  const getTemplate = (type: string) => {
    const baiHoc = tenBai || "[Tên bài dạy thực tế]";
    switch(type) {
      case '5512': 
        return `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${baiHoc}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`;
      case 'slide':
        return `Dựa trên bài dạy "${baiHoc}" môn ${monHoc} ${khoiLop}, hãy soạn cấu trúc Slide trình chiếu sinh động.\n\nYêu cầu:\n- Phân chia nội dung theo từng Slide (Tiêu đề, gợi ý hình ảnh, nội dung cốt lõi)\n- Thiết kế các hoạt động tương tác, trò chơi giáo dục giữa giờ.\n- Gợi ý phong cách trình bày chuyên nghiệp.`;
      case '7991': 
        return `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} bài "${baiHoc}" theo định hướng 7991.\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án và thang điểm chi tiết.`;
      case 'ontap':
        return `Trong vai một giáo viên giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho môn ${monHoc} lớp ${khoiLop} bài "${baiHoc}".\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm\n2. Các dạng bài thường gặp\n3. Ví dụ minh họa và lưu ý khi làm bài.`;
      default: return "";
    }
  };

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy vui lòng cấu hình API Key!");
    const promptToSend = overridePrompt || customPrompt;
    if (!promptToSend) return alert("Thầy hãy chọn hoặc nhập nội dung soạn giảng!");

    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(promptToSend);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("❌ Lỗi hệ thống: " + e.message); } finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center">
             <span className="text-[10px] text-white font-black text-center uppercase">THCS<br/>BÌNH HÒA</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic tracking-tighter">Ứng dụng soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-white/20">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-white/20">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase italic">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-emerald-500">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-emerald-500">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-orange-500" placeholder="Tên bài dạy thực tế..." />
            
            {/* HỘP CHỌN SỐ TIẾT VÀ ĐỐI TƯỢNG HS [cite: 2026-01-24] */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-slate-500 ml-1">Số tiết</label>
                <select value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
                  {dsSoTiet.map(s => <option key={s} value={s}>{s} tiết</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-slate-500 ml-1">Đối tượng HS</label>
                <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                  {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg flex justify-center items-center gap-2 hover:bg-orange-500 transition-all">
                📜 LỆNH PROMPT MẪU {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getTemplate('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">📑 Soạn KHBD 5512</button>
                  <button onClick={() => {setCustomPrompt(getTemplate('slide')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">💻 Soạn bài giảng điện tử</button>
                  <button onClick={() => {setCustomPrompt(getTemplate('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">✍️ Soạn đề kiểm tra 7991</button>
                  <button onClick={() => {setCustomPrompt(getTemplate('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white transition-colors">📚 Soạn đề cương ôn tập</button>
                </div>
              )}
            </div>
          </div>

          {/* HIỂN THỊ DANH SÁCH FILE NẠP VÀO [cite: 2026-01-17] */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu minh chứng</div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-28 shrink-0 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all mb-4 group">
                <span className="text-5xl text-emerald-500 font-thin group-hover:scale-125 transition-transform">+</span>
                <p className="text-[9px] text-slate-500 uppercase font-black">Nạp tài liệu từ máy</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {selectedFiles.length === 0 && <p className="text-[10px] text-slate-600 italic text-center mt-4">Chưa có tệp nào được chọn</p>}
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center group animate-in slide-in-from-left-2">
                    <span className="truncate w-40 font-bold text-emerald-300 italic">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 font-black px-2 hover:scale-125 transition-transform">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => handleAiAction()} disabled={loading} className={`w-full py-7 rounded-2xl font-black text-sm uppercase shadow-2xl transition-all italic tracking-[0.3em] ${loading ? 'bg-orange-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}>
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 BẮT ĐẦU SOẠN BÀI"}
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic underline decoration-2">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => {setCustomPrompt(""); setAiResponse("")}} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase">LÀM MỚI BẢNG</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-100 outline-none resize-none custom-scrollbar leading-[1.8] font-medium" placeholder={`Đang đợi Thầy nhập hoặc chọn lệnh mẫu cho môn ${monHoc}...`} />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button className="px-8 py-4 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-purple-500 transition-transform active:scale-95">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-500 transition-transform active:scale-95">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), `HoSo_${monHoc}_${tenBai}.docx`)} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-transform active:scale-95">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL TRỢ LÝ AI HIỂN THỊ KẾT QUẢ */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[3rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white shrink-0">
                <div className="flex items-center gap-4">
                   <span className="text-3xl animate-bounce">🤖</span>
                   <span className="font-black uppercase text-xs tracking-[0.4em] italic">TRỢ LÝ GEMINI 2.5 FLASH ĐANG THỰC THI</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="px-10 py-3 rounded-full bg-white/10 hover:bg-white/30 font-black text-[9px] uppercase border border-white/20 transition-all">✕ ĐÓNG CỬA SỔ</button>
             </div>
             <div className="flex-1 p-16 overflow-y-auto text-2xl leading-[2] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar selection:bg-emerald-500/30">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-16 h-16 border-8 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Đang kiến tạo nội dung bài: {tenBai || "Tài liệu chuyên môn"}...</p>
                   </div>
                ) : aiResponse || "Hệ thống đã sẵn sàng."}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;