import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v94"));

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("HS Đại trà");
  const [customPrompt, setCustomPrompt] = useState("");

  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["HS Đại trà", "HSHN"];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HỆ THỐNG 4 LỆNH PROMPT CHUẨN (LOGIC HSHN MỚI) ---
  const getHardcodedPrompt = (type: string) => {
    const isHSHN = doiTuongHS === "HSHN";
    const mucDo = isHSHN ? "Yêu cầu: Giảm độ khó 50%, nội dung ngắn gọn, dùng từ ngữ đơn giản, dễ hiểu nhất cho học sinh hòa nhập." : "Yêu cầu: Đúng chuẩn định hướng phát triển năng lực.";
    const context = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet || 1} tiết), đối tượng ${doiTuongHS}.`;
    
    if (type === '5512') return `Chào Thầy Tùng! Em là Trợ lý AI dễ thương đây. Em sẽ soạn KHBD 5512 cho ${context}. \n${mucDo}\nTÍCH HỢP: Năng lực số, Quyền con người, QP-AN, Đạo đức Hồ Chí Minh. Trình bày HTML TABLE chuẩn.`;
    if (type === 'ppt') return `Dạ em đây! Em sẽ thiết kế Slide bài giảng cho ${context}. \n${mucDo}\nCấu trúc 10 slide, AI chọn màu sắc thẩm mỹ, mỗi slide có gợi ý hình ảnh minh họa sinh động.`;
    if (type === '7991') return `Em chào Thầy! Em soạn đề kiểm tra 7991 cho ${context}. \n${isHSHN ? "⚠️ LƯU Ý ĐẶC BIỆT: Đây là học sinh hòa nhập (HSHN), Thầy yêu cầu em làm đề dễ hơn phân nửa so với HS đại trà, tập trung vào nhận biết." : "Đúng ma trận đặc tả Nhận biết - Thông hiểu - Vận dụng."}\nSản phẩm: Ma trận, Đặc tả, Đề, Đáp án.`;
    if (type === 'ontap') return `Dạ, em sẽ lập Đề cương ôn tập cho ${context}. \n${mucDo}\nKiến thức trọng tâm, kỹ năng cần đạt và các câu hỏi gợi ý.`;
    return "";
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_v94", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa có API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
      const result = await model.generateContent(`Hãy trả lời với tư cách một Trợ lý AI giáo dục dễ thương, thân thiện. \n${customPrompt}`);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  const exportFile = (format: string) => {
    const blob = new Blob([aiResponse], { type: 'text/plain' });
    saveAs(blob, `SoanGiang_${tenBai || 'V94'}.${format}`);
    setShowExportMenu(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 italic">
        <div className="bg-slate-800 p-12 rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-md text-center space-y-6">
          <h1 className="text-white text-2xl font-black uppercase text-emerald-400">HỆ THỐNG V94.0</h1>
          <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black flex items-center justify-center gap-3">
             <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" /> Đăng nhập Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6 w-1/3">
          {/* KHUNG TRÒN DÁN ẢNH ĐÃ KHÔI PHỤC */}
          <div onClick={() => document.getElementById('avatar-input')?.click()} className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all shadow-lg">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black uppercase">DÁN ẢNH</span>}
             <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase leading-none">HỆ THỐNG SOẠN GIẢNG</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1">NĂNG LỰC SỐ THẾ HỆ MỚI</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-10 py-3 rounded-2xl border-2 border-yellow-300 shadow-xl">
             <h2 className="text-white text-2xl font-black uppercase italic animate-pulse">Chào mừng Thầy Tùng !</h2>
          </div>
        </div>

        <div className="w-1/3 flex justify-end">
           <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-yellow-700">🚀 NÂNG CẤP</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline">⚙️ Cấu hình thiết kế</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            <div className="grid grid-cols-2 gap-2">
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsKhoi.map(k => <option key={k}>{k}</option>)}</select>
                <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic" placeholder="Số tiết..." />
            </div>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic" placeholder="Tên bài dạy..." />
            
            {/* ĐỐI TƯỢNG RÚT GỌN: ĐẠI TRÀ & HSHN */}
            <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-orange-400 italic">
                {dsDoiTuong.map(d => <option key={d}>{d}</option>)}
            </select>

            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl italic transition-all">📜 CHỌN LỆNH MẪU (4) ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-80 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 1: KHBD 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 2: BÀI GIẢNG PPT</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 3: ĐỀ KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] uppercase">🔹 PROMPT 4: ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl min-h-[150px]">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic">📁 HÀNH TRANG (+)</div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 border-2 border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-center cursor-pointer mb-2 bg-slate-900 hover:bg-emerald-900/20">
                <span className="text-3xl text-emerald-500 font-black">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
              </div>
              {selectedFiles.map((f, i) => <div key={i} className="text-[9px] text-emerald-300 italic mb-1">📄 {f.name}</div>)}
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        <section className="col-span-3">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Workspace Editor</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-500 uppercase italic">Preview Kết Quả</span>
               
               {/* NÚT XUẤT FILE 3 LỰA CHỌN */}
               <div className="relative">
                 <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT FILE ▼</button>
                 {showExportMenu && (
                   <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl overflow-hidden z-[100] border-2 border-emerald-600">
                     <button onClick={() => exportFile('doc')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-[10px] uppercase border-b italic">📄 File Word (.doc)</button>
                     <button onClick={() => exportFile('pdf')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-[10px] uppercase border-b italic">📕 File PDF (.pdf)</button>
                     <button onClick={() => exportFile('ppt')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-[10px] uppercase italic">📙 File PPT (.ppt)</button>
                   </div>
                 )}
               </div>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto italic text-slate-900 render-content custom-scrollbar">
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL NÂNG CẤP - DONGA BANK 916033681 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[3000] p-4 italic">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-10 max-w-2xl w-full relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-yellow-400 text-2xl font-black text-center uppercase mb-8 italic">THANH TOÁN CHÍNH CHỦ</h2>
            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-slate-600 space-y-4">
                <p className="text-white text-lg font-bold uppercase italic">Ngân hàng: <span className="text-yellow-400">DONGA BANK</span></p>
                <p className="text-white text-lg font-bold uppercase italic">Chủ TK: <span className="text-yellow-400">NGUYỄN THANH TÙNG</span></p>
                <p className="text-emerald-400 text-4xl font-black tracking-widest italic">916033681</p>
                <hr className="border-slate-700" />
                <p className="text-orange-400 text-xs font-black uppercase italic">Hotline/Zalo hỗ trợ: 0916033681</p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; margin: 20px 0; }
        .render-content td, .render-content th { border: 1px solid black; padding: 12px; font-size: 14px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;