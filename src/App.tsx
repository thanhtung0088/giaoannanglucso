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
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v82"));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_v82", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getHardcodedPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài dạy]";
    const thongTin = `cho môn ${monHoc}, ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng học sinh ${doiTuongHS}.`;
    if (type === '5512') return `Soạn KHBD CV 5512 ${thongTin}. Tích hợp NL số, Quyền con người.`;
    if (type === 'ppt') return `Soạn nội dung PPT 10 slide ${thongTin}.`;
    if (type === '7991') return `Soạn đề kiểm tra ma trận đặc tả ${thongTin}.`;
    if (type === 'ontap') return `Soạn đề cương ôn tập ${thongTin}.`;
    return "";
  };

  const handleSoanBai = async () => {
    // LẤY BIẾN TỪ VERCEL HOẶC .ENV
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey) return alert("Hệ thống chưa tìm thấy API Key trên Vercel!");
    
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // SỬ DỤNG MODEL GEMINI 3 FLASH PREVIEW THEO BẢNG 2026 CỦA THẦY
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
      const result = await model.generateContent(customPrompt || "Chào Thầy Tùng");
      const text = result.response.text();
      setAiResponse(text);
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { 
      // HIỂN THỊ LỖI CHI TIẾT ĐỂ KIỂM TRA TRÊN VERCEL
      setAiResponse(`❌ LỖI KẾT NỐI VERCEL:\n- Model: gemini-3-flash-preview\n- Chi tiết: ${e.message}\n\nHướng dẫn: Thầy kiểm tra lại API Key trong phần Settings > Environment Variables trên Vercel.`); 
    } finally { setLoading(false); }
  };

  const handleAssistantChat = async () => {
    if (!chatInput.trim()) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Nhập API Key!");
    const newHistory = [...chatHistory, { role: "user", text: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const result = await model.generateContent(chatInput);
      setChatHistory([...newHistory, { role: "ai", text: result.response.text() }]);
    } catch (e) { setChatHistory([...newHistory, { role: "ai", text: "Lỗi kết nối!" }]); }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic">
      <header className="h-32 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-white font-black uppercase">LOGO</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black uppercase leading-none tracking-tight italic">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase mt-2 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-600 px-10 py-3 rounded-2xl text-white font-black text-2xl shadow-2xl uppercase border-2 border-orange-400 italic">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-2xl hover:bg-red-600">📹</button>
           <button className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-2xl hover:bg-blue-600">🔳</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-500 shadow-2xl space-y-4 shrink-0">
            <h2 className="text-xs font-black text-emerald-400 uppercase italic">⚙️ Thiết lập bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white uppercase outline-none italic">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white uppercase outline-none italic">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none italic" placeholder="Nhập tên bài dạy..." />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none italic" placeholder="Số tiết" />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-4 text-xs font-bold text-white outline-none italic">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-orange-500 italic">📜 LỆNH PROMPT MẪU ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-64 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">📑 SOẠN KHBD CV 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">💻 BÀI GIẢNG PPT</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">✍️ ĐỀ KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white text-[10px] uppercase italic">📚 ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl shrink-0 min-h-[350px]">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase underline italic">📁 HỒ SƠ TÀI LIỆU (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 shrink-0 border-2 border-dashed border-slate-500 rounded-2xl flex items-center justify-center cursor-pointer mb-4 hover:border-emerald-500 bg-slate-900/50">
                <span className="text-4xl text-emerald-500 font-bold italic">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => { 
                  if(e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
                  }
                }} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-[11px] flex justify-between items-center italic">
                    <span className="truncate w-40 text-emerald-300 font-black italic">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black px-2 hover:scale-125 italic">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-8 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 active:translate-y-1 transition-all italic">
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-6 py-4 bg-slate-900 border-b border-slate-700 text-[10px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none font-bold leading-relaxed italic" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col min-h-0 relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
               <span className="text-xs font-black text-emerald-500 uppercase underline underline-offset-8 italic">Bảng Preview Kết Quả AI</span>
               <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT HỒ SƠ</button>
             </div>
             <div className="flex-1 bg-black/10 p-12 overflow-y-auto custom-scrollbar italic">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                     <div className="w-16 h-16 border-8 border-orange-500 border-t-transparent rounded-full animate-spin italic"></div>
                     <p className="font-black text-lg text-orange-400 uppercase italic">Hệ thống đang kiến tạo...</p>
                  </div>
                ) : (
                  <div className="text-xl leading-loose text-slate-100 whitespace-pre-wrap font-medium italic">{aiResponse || "Đã sẵn sàng với Gemini 3 Flash!"}</div>
                )}
             </div>
          </div>
        </section>
      </main>

      {isChatOpen && (
        <div className="fixed bottom-32 right-10 w-96 h-[500px] bg-slate-800 border-4 border-emerald-600 rounded-3xl shadow-2xl z-[2000] flex flex-col overflow-hidden italic">
           <div className="bg-emerald-600 p-4 flex justify-between items-center text-white font-black uppercase text-[10px] italic"><span>Trợ lý AI Thầy Tùng</span><button onClick={() => setIsChatOpen(false)}>✕</button></div>
           <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900 custom-scrollbar italic">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} italic`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-emerald-300 border border-emerald-900'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <div className="p-4 bg-slate-800 flex gap-2 border-t border-slate-700 italic">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAssistantChat()} placeholder="Hỏi AI..." className="flex-1 bg-slate-900 rounded-xl px-4 py-2 text-xs text-white outline-none border border-slate-600 italic" />
              <button onClick={handleAssistantChat} className="bg-emerald-600 px-4 rounded-xl text-white font-black text-xs hover:bg-emerald-500 italic">GỬI</button>
           </div>
        </div>
      )}

      <div onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-10 right-10 z-[2001] animate-bounce cursor-pointer hover:scale-110 italic">
        <div className="w-20 h-20 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30">
           <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-12 h-12" alt="AI Bot" />
        </div>
      </div>
    </div>
  );
};

export default App;