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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v83"));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_v83", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getHardcodedPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài dạy]";
    const thongTin = `môn ${monHoc}, khối ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng ${doiTuongHS}.`;
    if (type === '5512') return `HÃY SOẠN GIÁO ÁN CHI TIẾT THEO CÔNG VĂN 5512 cho ${thongTin}\nYêu cầu: Phân chia rõ 4 hoạt động dạy học, tích hợp NL số và quyền con người.`;
    if (type === 'ppt') return `Xây dựng kịch bản PowerPoint 10 slide cho bài dạy: ${thongTin}\nMỗi slide ghi rõ tiêu đề và nội dung trọng tâm.`;
    if (type === '7991') return `Thiết kế đề kiểm tra kèm ma trận đặc tả cho: ${thongTin}\nĐảm bảo cấu trúc theo hướng dẫn mới nhất của Bộ GD.`;
    if (type === 'ontap') return `Lập đề cương ôn tập kiến thức trọng tâm cho bài: ${thongTin}.`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey) return alert("Hệ thống yêu cầu API Key để soạn bài!");
    if (!customPrompt.trim()) return alert("Vui lòng chọn lệnh Prompt mẫu hoặc nhập yêu cầu soạn bài vào Thẻ Workspace!");
    
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // SỬ DỤNG MODEL GEMINI 2.5 FLASH (BẢN GA ỔN ĐỊNH CHO VERCEL 2026)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
      
      const result = await model.generateContent(customPrompt);
      const text = result.response.text();
      setAiResponse(text);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    } catch (e: any) { 
      setAiResponse(`❌ LỖI SOẠN BÀI:\n- Hệ thống không thể kết nối AI (404/500).\n- Chi tiết: ${e.message}\n\nThầy hãy kiểm tra xem API Key đã được dán vào Settings của Vercel chưa.`); 
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
            <h1 className="text-white text-2xl font-black uppercase leading-none tracking-tight">Hệ thống soạn giảng năng lực số</h1>
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
              <div className="absolute left-10 w-64 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic overflow-hidden">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">📑 SOẠN GIÁO ÁN 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">💻 KỊCH BẢN PPT</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">✍️ ĐỀ KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-white text-[10px] uppercase italic">📚 ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl shrink-0 min-h-[250px]">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase underline italic">📁 HỒ SƠ TÀI LIỆU (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              <div onClick={() => fileInputRef.current?.click()} className="h-14 shrink-0 border-2 border-dashed border-slate-500 rounded-xl flex items-center justify-center cursor-pointer mb-4 hover:border-emerald-500 bg-slate-900/50">
                <span className="text-3xl text-emerald-500 font-bold italic">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => { 
                  if(e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
                  }
                }} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center italic animate-in fade-in">
                    <span className="truncate w-36 text-emerald-300 font-black italic">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black px-1 italic">✕</button>
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
             <div className="px-6 py-4 bg-slate-900 border-b border-slate-700 text-[10px] font-black text-orange-500 uppercase italic">Thẻ Workspace (Nhập yêu cầu tại đây)</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Chọn Lệnh Prompt mẫu hoặc nhập nội dung Thầy cần soạn tại đây..." className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col min-h-0 relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
               <span className="text-xs font-black text-emerald-500 uppercase underline underline-offset-8 italic">Bảng Preview Kết Quả Soạn Bài</span>
               <div className="flex gap-4">
                 <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT HỒ SƠ</button>
               </div>
             </div>
             <div className="flex-1 bg-black/10 p-12 overflow-y-auto custom-scrollbar italic">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse italic">
                     <div className="w-16 h-16 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="font-black text-lg text-orange-400 uppercase">Hệ thống đang soạn giáo án...</p>
                  </div>
                ) : (
                  <div className="text-xl leading-loose text-slate-100 whitespace-pre-wrap font-medium italic">{aiResponse || "Thầy hãy chọn một lệnh Prompt và nhấn nút Kích hoạt để bắt đầu soạn bài."}</div>
                )}
             </div>
          </div>
        </section>
      </main>

      {/* Trợ lý Chat - Chỉ để giải đáp nhanh, không dùng để soạn bài chính */}
      {isChatOpen && (
        <div className="fixed bottom-32 right-10 w-80 h-[400px] bg-slate-800 border-4 border-emerald-600 rounded-2xl shadow-2xl z-[2000] flex flex-col overflow-hidden italic">
           <div className="bg-emerald-600 p-3 flex justify-between items-center text-white font-black uppercase text-[10px]"><span>Giải đáp nhanh AI</span><button onClick={() => setIsChatOpen(false)}>✕</button></div>
           <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-900 custom-scrollbar italic text-[11px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-emerald-300 border border-emerald-900'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <div className="p-3 bg-slate-800 flex gap-2 border-t border-slate-700">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAssistantChat()} placeholder="Hỏi nhanh..." className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-[10px] text-white outline-none border border-slate-600 italic" />
              <button onClick={handleAssistantChat} className="bg-emerald-600 px-3 rounded-lg text-white font-black text-[10px] italic">GỬI</button>
           </div>
        </div>
      )}

      <div onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-10 right-10 z-[2001] animate-bounce cursor-pointer hover:scale-110">
        <div className="w-16 h-16 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30">
           <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-10 h-10" alt="AI Bot" />
        </div>
      </div>
    </div>
  );
};

export default App;