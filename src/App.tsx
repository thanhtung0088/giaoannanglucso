import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsSoTiet = ["1", "2", "3", "4"];
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"]; // Đã thêm Hỗn hợp

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  // NỘI DUNG PROMPT BẤT DI BẤT DỊCH CỦA THẦY TÙNG
  const getPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài]";
    if (type === '5512') return `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${bai}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động:\n   - Khởi động\n   - Hình thành kiến thức\n   - Luyện tập\n   - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\n\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`;
    if (type === 'ppt') return `Dựa trên bài dạy "${bai}" môn ${monHoc} ${khoiLop}, hãy soạn cấu trúc Slide trình chiếu sinh động.\n- Phân chia nội dung theo từng Slide (Tiêu đề, gợi ý hình ảnh, nội dung cốt lõi)\n- Thiết kế các hoạt động tương tác, trò chơi giáo dục giữa giờ.\n- Gợi ý phong cách trình bày chuyên nghiệp.`;
    if (type === '7991') return `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} bài "${bai}" theo định hướng 7991.\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án và thang điểm chi tiết.`;
    if (type === 'ontap') return `Trong vai một giáo viên giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho môn ${monHoc} lớp ${khoiLop} bài "${bai}".\n1. Hệ thống kiến thức trọng tâm\n2. Các dạng bài thường gặp\n3. Ví dụ minh họa và lưu ý khi làm bài.`;
    return "";
  };

  const handleAiAction = async (p?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy chưa nhập API Key!");
    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(p || customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 100, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-all">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black text-center">CHỌN<br/>ẢNH</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic">Soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase italic">⚙️ Thiết lập</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-orange-500" placeholder="Nhập tên bài dạy..." />
            <div className="grid grid-cols-2 gap-3">
              <select value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
                {dsSoTiet.map(s => <option key={s} value={s}>{s} tiết</option>)}
              </select>
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg">LỆNH PROMPT MẪU {showPromptMenu ? '▲' : '▼'}</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">📑 Soạn KHBD 5512</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">💻 Soạn bài giảng điện tử</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">✍️ Soạn đề kiểm tra 7991</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white">📚 Soạn đề cương ôn tập</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ (Dấu +)</div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-20 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 mb-4">
                <span className="text-3xl text-emerald-500">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded border border-slate-700 text-[10px] flex justify-between items-center italic">
                    <span className="truncate w-40 text-emerald-300">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => handleAiAction()} disabled={loading} className="w-full py-7 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl">
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 BẮT ĐẦU SOẠN BÀI"}
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic underline">WORKSPACE GV NGUYỄN THANH TÙNG</span>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-100 outline-none resize-none custom-scrollbar leading-[1.8]" />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), `SoanBai_${tenBai}.docx`)} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000] flex items-center justify-center p-8">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[3rem] border border-emerald-500/30 flex flex-col overflow-hidden">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white">
                <span className="font-black uppercase text-xs italic">KẾT QUẢ SOẠN GIẢNG</span>
                <button onClick={() => setIsChatOpen(false)} className="px-10 py-2 rounded-full bg-white/10 hover:bg-white/30 font-black text-[9px] uppercase">✕ ĐÓNG</button>
             </div>
             <div className="flex-1 p-16 overflow-y-auto text-2xl leading-[2] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar">
                {loading ? "Hệ thống đang thực thi bài dạy: " + tenBai : aiResponse}
             </div>
          </div>
        </div>
      )}

      {/* ANH CHÀNG TRỢ LÝ ĐÃ QUAY TRỞ LẠI */}
      <div className="fixed bottom-8 right-8 z-[100] cursor-pointer group" onClick={() => setIsChatOpen(true)}>
         <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
            <span className="text-5xl">🤖</span>
         </div>
      </div>
    </div>
  );
};

export default App;