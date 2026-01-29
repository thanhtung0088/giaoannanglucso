import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("user_avatar"));
  
  // State cho Trợ lý AI Widget
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChat, setAiChat] = useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("user_avatar", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài dạy]";
    const context = `cho môn ${monHoc}, ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng học sinh ${doiTuongHS}.`;
    if (type === '5512') return `Bạn là chuyên gia xây dựng KHBD theo CV 5512/BGDĐT-GDTrH, Phụ lục 4 ${context}. Yêu cầu: Đúng cấu trúc, dạy học phát triển năng lực, tích hợp Năng lực số, Quyền con người, QP-AN, Tư tưởng HCM.`;
    if (type === 'ppt') return `Soạn nội dung Slide Powerpoint ${context}. Tối thiểu 10 slide, thẩm mỹ cao.`;
    if (type === '7991') return `Soạn ĐỀ KIỂM TRA chuẩn CV 7991 ${context}. Gồm Ma trận, Đặc tả, Đề, Đáp án.`;
    if (type === 'ontap') return `Soạn ĐỀ CƯƠNG ÔN TẬP ngắn gọn, trọng tâm cho ${context}.`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Vui lòng nhập API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 200, spread: 90 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  // Hàm chat riêng với Trợ lý AI
  const handleAiChat = async () => {
    if (!chatInput.trim()) return;
    const msg = { role: "user", text: chatInput };
    setAiChat(prev => [...prev, msg]);
    setChatInput("");
    // Logic AI trả lời nhanh ở đây (có thể dùng chung Gemini)
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans relative">
      <header className="h-32 bg-emerald-700 px-8 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-40">
        <div className="flex items-center gap-4">
          <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black text-center uppercase">LOGO</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic leading-none">Soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="bg-orange-600 px-8 py-2 rounded-xl text-white font-black text-xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
            <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="bg-white/10 hover:bg-emerald-500 px-4 py-1 rounded-lg border border-white/20 text-[10px] font-bold">🟢 Tạo nhanh Google Meet</button>
        </div>
        <div className="flex gap-2">
           <button className="bg-white/10 p-3 rounded-xl border border-white/20 text-xl hover:bg-white/20">📹</button>
           <button className="bg-white/10 p-3 rounded-xl border border-white/20 text-xl hover:bg-white/20">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* SIDEBAR TRÁI */}
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic">⚙️ Thông số bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none ring-emerald-500 focus:ring-2">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none ring-emerald-500 focus:ring-2">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none ring-emerald-500 focus:ring-2" placeholder="Nhập tên bài dạy..." />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-orange-500">📜 LỆNH PROMPT MẪU ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 overflow-hidden z-[100] shadow-2xl">
                  {['5512', 'ppt', '7991', 'ontap'].map(type => (
                    <button key={type} onClick={() => {setCustomPrompt(getPrompt(type)); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[9px] font-black uppercase text-white border-b border-slate-700">
                      {type === '5512' ? '📑 KHBD CV 5512' : type === 'ppt' ? '💻 BÀI GIẢNG PPT' : type === '7991' ? '✍️ ĐỀ KT CV 7991' : '📚 ĐỀ CƯƠNG ÔN TẬP'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-5 py-3 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase underline">📁 Hồ sơ tài liệu (+)</div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all mb-3 group">
                <span className="text-3xl text-emerald-500 group-hover:scale-125 transition-transform">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between items-center italic">
                    <span className="truncate w-32 text-emerald-300 font-bold">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 px-1 font-black">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all italic">
            {loading ? "⌛ ĐANG THỰC THI..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        {/* WORKSPACE & PREVIEW */}
        <div className="col-span-9 grid grid-cols-12 gap-6 h-full overflow-hidden">
           <section className="col-span-4 flex flex-col min-h-0">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-5 py-3 bg-[#0f172a] border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none custom-scrollbar" />
             </div>
           </section>

           <section className="col-span-8 flex flex-col min-h-0 relative">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-8 py-4 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic underline decoration-2">Bảng Preview Kết Quả AI</span>
                  <div className="relative">
                    <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-lg">♻️ XUẤT HỒ SƠ</button>
                    {showExportMenu && (
                      <div className="absolute top-full right-0 mt-2 w-44 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[100] overflow-hidden">
                        <button onClick={() => {saveAs(new Blob([aiResponse]), 'SoanBai.docx'); setShowExportMenu(false);}} className="w-full px-5 py-3 text-left text-[9px] font-black text-white hover:bg-blue-600 border-b border-slate-700">📄 FILE WORD</button>
                        <button onClick={() => {saveAs(new Blob([aiResponse]), 'SoanBai.pdf'); setShowExportMenu(false);}} className="w-full px-5 py-3 text-left text-[9px] font-black text-white hover:bg-red-600 border-b border-slate-700">📕 FILE PDF</button>
                        <button onClick={() => {saveAs(new Blob([aiResponse]), 'SoanBai.pptx'); setShowExportMenu(false);}} className="w-full px-5 py-3 text-left text-[9px] font-black text-white hover:bg-orange-600">📽️ FILE PPT</button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 relative overflow-hidden bg-slate-900/40">
                  <div className="absolute inset-0 overflow-y-scroll p-10 text-lg leading-relaxed text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar selection:bg-emerald-500/30">
                     {loading ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-6 text-orange-400">
                          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="font-black text-xl animate-pulse uppercase">Đang soạn giáo án...</p>
                       </div>
                     ) : (
                       aiResponse || <div className="text-slate-600 italic text-center mt-20 uppercase text-[11px] tracking-widest">Hệ thống sẵn sàng. Vui lòng nhấn lệnh mẫu.</div>
                     )}
                  </div>
                </div>
             </div>
           </section>
        </div>
      </main>

      {/* TRỢ LÝ AI WIDGET (DỄ THƯƠNG GÓC PHẢI) */}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
        {isAiOpen && (
          <div className="w-80 h-96 bg-[#1e293b] border-2 border-emerald-500 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-emerald-600 p-4 text-white font-black text-xs uppercase flex justify-between">
               <span>🤖 Trợ lý AI sư phạm</span>
               <button onClick={()=>setIsAiOpen(false)}>✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-[11px] custom-scrollbar">
               <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 italic">Chào Thầy Tùng! Thầy cần hỗ trợ gì về nghiệp vụ sư phạm hôm nay ạ?</div>
               {aiChat.map((c, i) => (
                 <div key={i} className={`p-2 rounded-lg ${c.role === 'user' ? 'bg-blue-600 ml-8' : 'bg-slate-700 mr-8'}`}>{c.text}</div>
               ))}
            </div>
            <div className="p-3 bg-slate-900 flex gap-2">
               <input type="text" value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleAiChat()} className="flex-1 bg-slate-800 rounded-lg p-2 text-xs outline-none" placeholder="Chat với AI..." />
               <button onClick={handleAiChat} className="text-emerald-500 font-bold">Gửi</button>
            </div>
          </div>
        )}
        <div onClick={() => setIsAiOpen(!isAiOpen)} className="w-16 h-16 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer animate-bounce hover:scale-110 transition-transform border-4 border-white/20">
           <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-10 h-10 object-contain" alt="AI Bot" />
        </div>
      </div>
    </div>
  );
};

export default App;