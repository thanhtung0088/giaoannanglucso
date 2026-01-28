import React, { useState, useRef } from 'react';
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
  const [soTiet, setSoTiet] = useState("3");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const getPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài]";
    const suffix = "\n\nYÊU CẦU: VIẾT CHI TIẾT, ĐẦY ĐỦ, KHÔNG TÓM TẮT. DÙNG TIẾNG VIỆT.";
    if (type === '5512') return `Soạn Kế hoạch bài dạy chuẩn Công văn 5512 cho môn ${monHoc} lớp ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng ${doiTuongHS}. Đầy đủ Mục tiêu, Thiết bị, Tiến trình 4 hoạt động.${suffix}`;
    if (type === 'ppt') return `Soạn cấu trúc Slide PowerPoint chi tiết bài "${bai}" môn ${monHoc} lớp ${khoiLop}. Tối thiểu 15 Slide, có kịch bản lời dẫn.${suffix}`;
    if (type === '7991') return `Soạn đề kiểm tra chuẩn 7991 cho bài "${bai}" môn ${monHoc} lớp ${khoiLop}. Có ma trận, đề bài và đáp án.${suffix}`;
    if (type === 'ontap') return `Soạn đề cương ôn tập trọng tâm bài "${bai}" môn ${monHoc} lớp ${khoiLop}.${suffix}`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy nhập API Key!");
    setLoading(true);
    setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: customPrompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
      });
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 100 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col">
      <header className="h-32 bg-emerald-700 px-8 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* KHUNG TRÒN DÁN HÌNH */}
          <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer shadow-inner hover:scale-105 transition-transform">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black text-center">CHỌN<br/>ẢNH</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setAvatarUrl(URL.createObjectURL(e.target.files[0]))} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic leading-none">Soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-10 py-4 rounded-2xl text-white font-black text-2xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
        <div className="flex gap-2">
           <button className="bg-white/10 p-3 rounded-xl border border-white/20">📹</button>
           <button className="bg-white/10 p-3 rounded-xl border border-white/20">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden bg-[#0f172a]">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài dạy thực tế..." />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-orange-500">📜 TẠO PROMPT MẪU ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 overflow-hidden z-[100] shadow-2xl">
                  {['5512', 'ppt', '7991', 'ontap'].map((type) => (
                    <button key={type} onClick={() => {setCustomPrompt(getPrompt(type)); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">
                      {type === '5512' ? '📑 Soạn KHBD 5512' : type === 'ppt' ? '💻 Soạn Slide PPT' : type === '7991' ? '✍️ Soạn Đề 7991' : '📚 Soạn Ôn Tập'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col min-h-[180px] overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-5 py-3 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu (+)</div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-14 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all mb-3">
                <span className="text-3xl text-emerald-500">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[100px] space-y-1.5 custom-scrollbar pr-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between items-center animate-in slide-in-from-left">
                    <span className="truncate w-32 text-slate-300 italic">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 px-1 font-black">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all">
            {loading ? "⌛ ĐANG SOẠN..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <div className="col-span-9 grid grid-cols-12 gap-6 h-full">
           <section className="col-span-4 flex flex-col min-h-0">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-5 py-3 bg-[#0f172a] border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none custom-scrollbar leading-relaxed" />
             </div>
           </section>

           <section className="col-span-8 flex flex-col min-h-0 relative">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-8 py-4 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic underline">Bảng Preview Kết Quả AI</span>
                  <div className="relative">
                    <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500">♻️ XUẤT HỒ SƠ</button>
                    {showExportMenu && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[200] overflow-hidden">
                        <button onClick={() => {saveAs(new Blob([aiResponse]), `SoanBai.docx`); setShowExportMenu(false);}} className="w-full px-4 py-3 text-left text-[9px] font-black text-white hover:bg-blue-600 border-b border-slate-700">WORD (.DOCX)</button>
                        <button onClick={() => {saveAs(new Blob([aiResponse]), `SoanBai.pdf`); setShowExportMenu(false);}} className="w-full px-4 py-3 text-left text-[9px] font-black text-white hover:bg-red-600 border-b border-slate-700">PDF (.PDF)</button>
                        <button onClick={() => {saveAs(new Blob([aiResponse]), `SoanBai.pptx`); setShowExportMenu(false);}} className="w-full px-4 py-3 text-left text-[9px] font-black text-white hover:bg-orange-600">PPT (.PPTX)</button>
                      </div>
                    )}
                  </div>
                </div>
                {/* THANH CUỘN DỨT ĐIỂM TẠI ĐÂY */}
                <div className="flex-1 p-10 overflow-y-auto max-h-full text-lg leading-relaxed text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar bg-slate-900/20">
                   {loading ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4 text-orange-400">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black animate-pulse">HỆ THỐNG ĐANG SOẠN...</p>
                     </div>
                   ) : (
                     aiResponse || <div className="text-slate-600 italic text-center mt-20 uppercase text-[10px] tracking-widest">Sẵn sàng. Vui lòng nhấn "Kích hoạt"</div>
                   )}
                </div>
             </div>
           </section>
        </div>
      </main>
    </div>
  );
};

export default App;