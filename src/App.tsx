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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuPrompts = [
    { id: "5512", title: "📑 Soạn KHBD 5512", content: `Trong vai một chuyên gia giáo dục và một giáo viên ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${tenBai}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học\n2. Chuẩn bị\n3. Tiến trình dạy học (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng)\n4. Câu hỏi gợi mở\n5. Ví dụ minh họa\n6. Dự kiến khó khăn\n7. Ghi chú sư phạm.` },
    { id: "PPT", title: "💻 Soạn bài giảng điện tử", content: `Hãy thiết kế cấu trúc Slide bài giảng điện tử cho bài "${tenBai}" môn ${monHoc} ${khoiLop}. Yêu cầu chia nội dung từng slide và gợi ý hình ảnh.` },
    { id: "7991", title: "✍️ Soạn đề kiểm tra (Ma trận 7991)", content: `Soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} theo Thông tư 22 và định hướng 7991 gồm Ma trận, Đề bài và Đáp án.` },
    { id: "ONTAP", title: "📚 Soạn đề cương ôn tập", content: `Soạn ĐỀ CƯƠNG ÔN TẬP trọng tâm môn ${monHoc} lớp ${khoiLop} gồm kiến thức chính và các dạng bài tập mẫu.` }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleAiAction = async (overridePrompt?: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy vui lòng cấu hình API Key!");
    const promptToSend = overridePrompt || customPrompt;
    if (!promptToSend.trim()) return alert("Vui lòng nhập nội dung hoặc chọn mẫu!");

    setLoading(true); 
    setIsChatOpen(true); // Hiển thị trang Preview ngay khi bấm soạn
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(promptToSend);
      setAiResponse(result.response.text());
      setChatInput("");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) {
      setAiResponse(`❌ Lỗi: ${e.message}. Thầy hãy thử lại sau giây lát.`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-xl">
             <span className="text-[10px] text-white font-black">THCS BÌNH HÒA</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase tracking-tight">Ứng dụng soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase">Thiết kế bởi: Thanh Tùng</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase tracking-widest">Chào mừng quý thầy cô !</div>
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

            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg flex justify-center items-center gap-2">
                📑 TẠO PROMPT MẪU {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  {menuPrompts.map((p) => (
                    <button key={p.id} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 last:border-0">
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu</div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-32 shrink-0 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all">
                <span className="text-5xl text-emerald-500 font-thin">+</span>
                <p className="text-[9px] text-slate-500 uppercase font-black">Chọn file từ máy tính</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              <div className="mt-4 flex-1 overflow-y-auto space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-2 rounded border border-slate-700 text-[10px] flex justify-between">
                    <span className="truncate w-40">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NÚT TƯƠNG TÁC MỚI THEO YÊU CẦU */}
          <button 
            onClick={() => handleAiAction()} 
            disabled={loading} 
            className={`w-full py-6 rounded-2xl font-black text-sm uppercase shadow-2xl transition-all italic tracking-[0.3em] ${loading ? 'bg-orange-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 BẮT ĐẦU SOẠN BÀI"}
          </button>
        </aside>

        <section className="col-span-9 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic">WORKSPACE NGUYỄN THANH TÙNG</span>
              <button onClick={() => setCustomPrompt("")} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase">LÀM MỚI</button>
            </div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl text-slate-200 outline-none resize-none custom-scrollbar" placeholder="Nội dung chuyên sâu..." />
            <div className="absolute bottom-8 right-8 flex gap-4">
               <button className="px-8 py-4 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">🎨 MINH HỌA AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">🎨 CANVA</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "GiaoAn.docx")} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">♻️ XUẤT HỒ SƠ</button>
            </div>
          </div>
        </section>
      </main>

      {/* TRANG PREVIEW / TRỢ LÝ AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-[#020817] w-full max-w-7xl h-[85vh] rounded-[2.5rem] border border-emerald-500/30 flex flex-col overflow-hidden">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-800 text-white">
                <span className="font-black uppercase text-xs tracking-widest italic">🤖 PREVIEW KẾT QUẢ SOẠN GIẢNG</span>
                <button onClick={() => setIsChatOpen(false)} className="px-8 py-2 rounded-full bg-white/10 hover:bg-white/30 font-black text-[9px] uppercase border border-white/20">✕ ĐÓNG</button>
             </div>
             <div className="flex-1 p-16 overflow-y-auto text-xl leading-relaxed text-slate-300 whitespace-pre-wrap custom-scrollbar">
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-full gap-8">
                      <div className="w-16 h-16 border-8 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Hệ thống đang soạn nội dung...</p>
                   </div>
                ) : aiResponse}
             </div>
             <div className="p-6 bg-[#0f172a] border-t border-slate-800 flex gap-4">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiAction(chatInput)} placeholder="Điều chỉnh nội dung tại đây..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-8 py-5 text-white outline-none" />
                <button onClick={() => handleAiAction(chatInput)} className="bg-emerald-600 px-12 py-5 rounded-2xl font-black text-white uppercase text-xs">GỬI LỆNH</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;