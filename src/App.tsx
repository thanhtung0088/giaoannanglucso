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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v91"));

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");

  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // XỬ LÝ CHỌN FILE (ĐẢM BẢO KHÔNG BỊ ĐƠ)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_v91", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getHardcodedPrompt = (type: string) => {
    const thongTin = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet} tiết), đối tượng ${doiTuongHS}.`;
    const presentation = "\nYÊU CẦU: Trình bày HTML TABLE chuẩn CV 5512. Tự động chèn ảnh minh họa.";
    if (type === '5512') return `Bạn là chuyên gia soạn KHBD 2018. Soạn cho ${thongTin} đúng CV 5512 Phụ lục 4.${presentation}`;
    if (type === '7991') return `Soạn ĐỀ KIỂM TRA cho ${thongTin} theo CV 7991.${presentation}`;
    if (type === 'ppt') return `Thiết kế PPT 10 slide cho ${thongTin}.${presentation}`;
    if (type === 'ontap') return `Soạn ĐỀ CƯƠNG ÔN TẬP cho ${thongTin}.${presentation}`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa có API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 italic font-sans">
        <div className="bg-slate-800 p-12 rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-md space-y-8 text-center">
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter text-emerald-500">HỆ THỐNG V91.0</h1>
          <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform italic">
             <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" /> Đăng nhập Google
          </button>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hỗ trợ: 0916033681</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6 w-1/4">
          <div onClick={() => document.getElementById('avatar-input')?.click()} className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-all">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black">LOGO</span>}
             <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase leading-none">Năng lực số V91</h1>
            <p className="text-[9px] font-bold text-emerald-200 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-12 py-3 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.6)] border-2 border-yellow-300">
             <h2 className="text-white text-3xl font-black uppercase italic animate-pulse drop-shadow-md">Chào mừng quý thầy cô !</h2>
          </div>
        </div>

        <div className="flex gap-4 w-1/4 justify-end">
           <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-yellow-700 hover:bg-yellow-300 transition-colors">🚀 Nâng cấp</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic">⚙️ Cấu hình bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white outline-none italic" placeholder="Tên bài dạy..." />
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl italic">📜 LỆNH PROMPT MẪU ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-72 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 1: KHBD 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-[10px] uppercase">🔹 PROMPT 3: KIỂM TRA 7991</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl min-h-[180px]">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic">📁 HÀNH TRANG (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              {/* NÚT + ĐÃ FIX HẾT ĐƠ */}
              <div onClick={() => fileInputRef.current?.click()} className="h-14 border-2 border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-center cursor-pointer mb-2 bg-slate-900 hover:bg-emerald-900/20 hover:border-emerald-400 transition-all group">
                <span className="text-3xl text-emerald-500 font-black group-hover:scale-125 transition-transform">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar px-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between italic text-emerald-300">
                    <span className="truncate w-32 font-bold">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ ĐANG THIẾT KẾ..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic underline">Thẻ Workspace (Lệnh Prompt)</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-500 uppercase underline italic">Preview Soạn Bài Chuẩn Word</span>
               <button onClick={() => saveAs(new Blob([aiResponse], {type:'text/plain'}), 'SoanGiang.doc')} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto italic text-slate-900 render-content">
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL NÂNG CẤP - DONGA BANK - 916033681 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[3000] p-4 italic font-sans">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-10 max-w-4xl w-full relative shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-yellow-400 text-3xl font-black text-center uppercase mb-8 tracking-widest">THÔNG TIN THANH TOÁN CHÍNH CHỦ</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-10">
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center space-y-3">
                 <h3 className="text-white font-black text-lg uppercase">Gói FREE</h3>
                 <div className="text-3xl font-black text-white">0đ</div>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 text-center space-y-3 transform scale-110 shadow-2xl">
                 <h3 className="text-emerald-400 font-black text-lg uppercase">PREMIUM</h3>
                 <div className="text-3xl font-black text-white">199k<span className="text-xs">/tháng</span></div>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-orange-500 text-center space-y-3">
                 <h3 className="text-orange-500 font-black text-lg uppercase">Gói PRO AI</h3>
                 <div className="text-3xl font-black text-white">499k<span className="text-xs">/năm</span></div>
               </div>
            </div>

            <div className="border-t border-slate-700 pt-8 grid grid-cols-2 gap-10">
               <div className="space-y-4">
                 <p className="text-sm text-emerald-400 font-black uppercase italic">💳 Thông tin ngân hàng:</p>
                 <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-600 shadow-inner">
                    <p className="text-white text-sm font-bold mb-2 uppercase italic tracking-wider">NGÂN HÀNG: <span className="text-yellow-400">DONGA BANK</span></p>
                    <p className="text-white text-sm font-bold mb-2 uppercase italic tracking-wider">CHỦ TK: <span className="text-yellow-400">Nguyễn Thanh Tùng</span></p>
                    <p className="text-emerald-400 text-3xl font-black tracking-[0.2em] mt-2">916033681</p>
                 </div>
                 <p className="text-[10px] text-orange-400 font-black italic uppercase">Hotline Zalo hỗ trợ: 0916033681</p>
               </div>
               <div className="flex flex-col items-center justify-center gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-white/20 shadow-lg">
                    {/* QR Zalo dẫn về số 0916033681 */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://zalo.me/0916033681`} className="w-full h-full" alt="QR Zalo" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-black uppercase italic">Quét mã QR Zalo (Thanh Tùng)</p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; }
        .render-content td, .render-content th { border: 1px solid black; padding: 10px; }
        .render-content img { max-width: 250px; display: block; margin: 15px auto; border-radius: 10px; border: 3px solid #10b981; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;