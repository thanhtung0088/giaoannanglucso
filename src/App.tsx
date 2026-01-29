import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // --- TRẠNG THÁI ĐĂNG NHẬP ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'google' | 'admin' | null>(null);
  const [adminPass, setAdminPass] = useState("");

  // --- TRẠNG THÁI NÂNG CẤP ---
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // --- DỮ LIỆU ỔN ĐỊNH ---
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
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v87"));

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const handleGoogleLogin = () => {
    // Giả lập đăng nhập Google
    setLoginMethod('google');
    setIsLoggedIn(true);
    confetti({ particleCount: 100 });
  };

  const handleAdminLogin = () => {
    if (adminPass === "ADMIN2026") {
      setLoginMethod('admin');
      setIsLoggedIn(true);
      confetti({ particleCount: 150 });
    } else {
      alert("Mã Admin không chính xác!");
    }
  };

  // --- LOGIC AI & FILE (GIỮ NGUYÊN) ---
  const getHardcodedPrompt = (type: string) => {
    const thongTin = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet} tiết), đối tượng ${doiTuongHS}.`;
    const formatInstruction = "\n\nLƯU Ý TRÌNH BÀY: Hãy trình bày nội dung dưới dạng HTML, sử dụng TABLE (bảng) cho các mục I và III giống file mẫu Word. Chèn thẻ <img src='https://source.unsplash.com/featured/?education,{keyword}' />.";

    if (type === '5512') return `Bạn là chuyên gia soạn KHBD 5512 cho ${thongTin}... (Nội dung Prompt 1 của Thầy)${formatInstruction}`;
    if (type === 'ppt') return `Bạn là chuyên gia thiết kế PPT cho ${thongTin}... (Nội dung Prompt 2 của Thầy)${formatInstruction}`;
    if (type === '7991') return `Bạn là chuyên gia đề kiểm tra cho ${thongTin}... (Nội dung Prompt 3 của Thầy)${formatInstruction}`;
    if (type === 'ontap') return `Bạn là chuyên gia đề cương cho ${thongTin}... (Nội dung Prompt 4 của Thầy)${formatInstruction}`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thiếu API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 italic">
        <div className="bg-slate-800 p-10 rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-md space-y-8 text-center">
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter">HỆ THỐNG SOẠN GIẢNG V87</h1>
          <div className="space-y-4">
            <button onClick={handleGoogleLogin} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" alt="google" />
              Đăng nhập bằng Google
            </button>
            <div className="relative py-2"><hr className="border-slate-700"/><span className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 px-2 text-slate-500 text-xs uppercase">Hoặc Admin</span></div>
            <input type="password" value={adminPass} onChange={(e)=>setAdminPass(e.target.value)} placeholder="Nhập mã Admin..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-white outline-none focus:border-orange-500" />
            <button onClick={handleAdminLogin} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase hover:bg-orange-500 transition-all">Xác nhận quyền Admin</button>
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Phát triển bởi GV: Nguyễn Thanh Tùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black uppercase">LOGO</span>}
          </div>
          <div>
            <h1 className="text-white text-xl font-black uppercase tracking-tight">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase animate-pulse border-b-4 border-yellow-700 hover:scale-105 transition-all">
             🚀 Cập nhật nâng cao
           </button>
           <div className="bg-orange-600 px-8 py-2 rounded-xl text-white font-black text-xl shadow-2xl border-2 border-orange-400 italic uppercase">TRÌNH SOẠN V87</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* SIDEBAR VÀ WORKSPACE GIỮ NGUYÊN NHƯ BẢN V86 */}
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline underline-offset-4">⚙️ Thiết lập & Hồ sơ</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white uppercase italic">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white outline-none italic" placeholder="Tên bài dạy..." />
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 italic">📜 LỆNH PROMPT MẪU ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-72 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic overflow-hidden">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 1: KHBD 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-[10px] uppercase">🔹 PROMPT 3: KIỂM TRA 7991</button>
              </div>
            )}
          </div>
          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ ĐANG THIẾT KẾ..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-500 uppercase underline italic">Preview Soạn Giảng</span>
               <button onClick={() => alert("Chức năng xuất file...")} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto italic text-slate-900 render-content">
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL CẬP NHẬT NÂNG CAO */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[3000] p-4 italic">
          <div className="bg-slate-800 border-2 border-yellow-500 rounded-3xl p-8 max-w-4xl w-full relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-white text-2xl">✕</button>
            <h2 className="text-yellow-400 text-2xl font-black text-center uppercase mb-8">BẢNG TÙY CHỌN GÓI SỬ DỤNG 2026</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center space-y-4">
                <h3 className="text-white font-black text-lg uppercase">Gói FREE</h3>
                <p className="text-[10px] text-slate-400 italic">10 giáo án/tháng<br/>(KHBD 5512, Đề 7991)</p>
                <div className="text-2xl font-black text-white">0đ</div>
                <button className="w-full py-2 bg-slate-700 rounded-lg text-[10px] font-black uppercase">Đang sử dụng</button>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 text-center space-y-4 transform scale-105 shadow-2xl">
                <h3 className="text-emerald-400 font-black text-lg uppercase">Gói PREMIUM</h3>
                <p className="text-[10px] text-slate-400 italic">Soạn full 4 loại bài dạy<br/>Đầy đủ tính năng 5512, 7991</p>
                <div className="text-2xl font-black text-white">199k<span className="text-xs">/tháng</span></div>
                <button className="w-full py-2 bg-emerald-600 rounded-lg text-[10px] font-black uppercase">Nâng cấp ngay</button>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500 text-center space-y-4">
                <h3 className="text-orange-500 font-black text-lg uppercase">Gói PRO AI</h3>
                <p className="text-[10px] text-slate-400 italic">Giáo án tích hợp NL số<br/>Sử dụng Trợ lý AI đặc biệt</p>
                <div className="text-2xl font-black text-white">499k<span className="text-xs">/năm</span></div>
                <button className="w-full py-2 bg-orange-600 rounded-lg text-[10px] font-black uppercase">Mua gói ưu đãi</button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8 items-center border-t border-slate-700 pt-6">
               <div className="space-y-2">
                 <p className="text-xs text-emerald-400 font-black uppercase italic">Thông tin thanh toán:</p>
                 <p className="text-sm text-white font-bold italic">Số TK: 123456789 - MB Bank</p>
                 <p className="text-sm text-white font-bold italic">Chủ TK: NGUYEN THANH TUNG</p>
                 <p className="text-[10px] text-slate-400 italic mt-2">* Nội dung chuyển khoản: [Số điện thoại] - [Gói đăng ký]</p>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-32 h-32 bg-white p-2 rounded-xl mb-2">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/0123456789" alt="QR Zalo" className="w-full h-full" />
                 </div>
                 <p className="text-[9px] text-slate-300 font-black uppercase italic">Mã QR Zalo hỗ trợ</p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; }
        .render-content td, .render-content th { border: 1px solid black; padding: 8px; }
        .render-content img { max-width: 200px; display: block; margin: 10px auto; border: 2px solid #10b981; }
      `}} />
    </div>
  );
};

export default App;