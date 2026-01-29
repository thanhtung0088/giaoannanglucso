import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// --- LOGIN SCREEN ---
const LoginScreen: React.FC<{ onLogin: (userInfo: any) => void }> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<"teacher" | "admin">("teacher");
  const [password, setPassword] = useState("");
  const ADMIN_PASS = "admin123";

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 italic">
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700">
          <div className="w-1/2 bg-gradient-to-br from-emerald-700 to-emerald-900 p-16 flex flex-col justify-center items-center text-white border-r border-slate-700">
            <div className="text-8xl mb-8">📚</div>
            <h1 className="text-4xl font-black mb-6 uppercase text-center">HỆ THỐNG SOẠN GIẢNG AI</h1>
            <p className="text-xl font-bold opacity-90 uppercase">Năng lực số thế hệ mới</p>
          </div>
          <div className="w-1/2 p-16 flex flex-col justify-center bg-slate-800 text-white">
            <h2 className="text-3xl font-bold text-center mb-8 text-emerald-400 uppercase">Đăng nhập hệ thống</h2>
            <div className="flex mb-8 border-b border-slate-700">
              <button onClick={() => setActiveTab("teacher")} className={`flex-1 py-4 font-bold ${activeTab === "teacher" ? "border-b-4 border-emerald-500 text-emerald-400" : "text-slate-500"}`}>GIÁO VIÊN</button>
              <button onClick={() => setActiveTab("admin")} className={`flex-1 py-4 font-bold ${activeTab === "admin" ? "border-b-4 border-emerald-500 text-emerald-400" : "text-slate-500"}`}>QUẢN TRỊ</button>
            </div>
            {activeTab === "teacher" ? (
              <div className="flex justify-center"><GoogleLogin onSuccess={(res) => onLogin(res)} onError={() => alert("Lỗi!")} theme="filled_blue" /></div>
            ) : (
              <div className="space-y-4">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu Admin" className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" />
                <button onClick={() => password === ADMIN_PASS ? onLogin({name: 'Admin'}) : alert("Sai!")} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black transition shadow-lg">VÀO HỆ THỐNG</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

// --- MAIN APP ---
const MainApp: React.FC<{ userInfo?: any }> = ({ userInfo }) => {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  const getHardcodedPrompt = (type: string) => {
    const context = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet || 1} tiết), đối tượng ${doiTuongHS}.`;
    if (type === 'khbd') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) cho ${context} theo Công văn 5512/BGDĐT-GDTrH...`;
    return ""; // Các prompt khác Thầy có thể copy thêm vào đây
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        alert(`Thầy ơi, chỉ gắn được tối đa ${MAX_FILES} file thôi ạ!`);
        return;
      }
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa có API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(customPrompt || "Hãy chào tôi bằng tiếng Việt");
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-slate-700 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      {/* HEADER: XANH LÁ + MEET */}
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-xl z-50">
        <div className="flex items-center gap-6 w-1/3">
          <div className="w-16 h-16 rounded-full bg-emerald-800 border-2 border-white/50 flex items-center justify-center font-black">AI</div>
          <div>
            <h1 className="text-white text-lg font-black uppercase leading-none">HỆ THỐNG SOẠN GIẢNG</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1">NĂNG LỰC SỐ THẾ HỆ MỚI</p>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-10 py-3 rounded-2xl border-2 border-yellow-300 shadow-lg">
            <h2 className="text-white text-2xl font-black uppercase italic animate-pulse">CHÀO MỪNG QUÝ THẦY CÔ !</h2>
          </div>
        </div>
        <div className="w-1/3 flex justify-end gap-3">
          <button onClick={() => window.open("https://meet.google.com/new", "_blank")} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-lg border-b-4 border-blue-800 hover:bg-blue-500 transition">GOOGLE MEET</button>
          <button className="bg-purple-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-lg border-b-4 border-purple-800 hover:bg-purple-500 transition">NÂNG CẤP PRO</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* CỘT 1: CẤU HÌNH & HÀNH TRANG */}
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          {/* Cấu hình thiết kế - XÓA GLASSMORPHISM */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-600 shadow-xl space-y-4 shrink-0 relative">
            <h2 className="text-sm font-black text-emerald-400 uppercase italic">⚙️ CẤU HÌNH THIẾT KẾ</h2>
            <select value={monHoc} onChange={(e) => setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none">
              {["Toán", "Ngữ văn", "GD Công dân", "Tin học", "Tiếng Anh"].map(m => <option key={m}>{m}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select value={khoiLop} onChange={(e) => setKhoiLop(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none">
                {Array.from({length:12}, (_,i)=>`Lớp ${i+1}`).map(l => <option key={l}>{l}</option>)}
              </select>
              <input type="text" value={soTiet} onChange={(e) => setSoTiet(e.target.value)} placeholder="Số tiết..." className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none placeholder-slate-500" />
            </div>
            <input type="text" value={tenBai} onChange={(e) => setTenBai(e.target.value)} placeholder="Tên bài dạy..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none" />
            
            {/* Menu Lệnh Mẫu - Đặt chuẩn xác dưới nút */}
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-orange-500 transition">📜 CHỌN LỆNH MẪU ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border-2 border-orange-500 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('khbd')); setShowPromptMenu(false);}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-xs border-b border-slate-800 font-bold uppercase">🔹 SOẠN KHBD 5512</button>
                  <button onClick={() => setShowPromptMenu(false)} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-xs border-b border-slate-800 font-bold uppercase">🖥️ SOẠN BÀI GIẢNG PPT</button>
                  <button onClick={() => setShowPromptMenu(false)} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-xs font-bold uppercase">📝 SOẠN ĐỀ KIỂM TRA</button>
                </div>
              )}
            </div>
          </div>

          {/* Hành trang (+) - FIX CỨNG CLICK DẤU CỘNG */}
          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col flex-1 overflow-hidden">
            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic">THÊM DỮ LIỆU, HÌNH ẢNH (+)</div>
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="h-16 border-2 border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-center cursor-pointer bg-slate-900 hover:bg-emerald-900/20 transition-all z-[9999] relative pointer-events-auto shadow-inner"
              >
                <span className="text-4xl text-emerald-400 font-black pointer-events-none">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700 text-[11px] font-bold">
                  <span className="truncate w-4/5 text-emerald-200">📄 {file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black text-lg hover:text-red-400">×</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        {/* CỘT 2: WORKSPACE */}
        <section className="col-span-3">
          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col h-full overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-xs font-black text-orange-400 uppercase italic tracking-widest">Workspace Editor</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none font-bold italic placeholder-slate-600" placeholder="Lệnh AI sẽ xuất hiện tại đây..." />
          </div>
        </section>

        {/* CỘT 3: PREVIEW */}
        <section className="col-span-6 flex flex-col">
          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col h-full overflow-hidden">
             <div className="px-8 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-400 uppercase italic">XEM TRƯỚC KẾT QUẢ</span>
               <button onClick={() => saveAs(new Blob([aiResponse], {type:'text/html'}), `GiaoAn_${tenBai}.html`)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-lg border-b-4 border-emerald-800 hover:bg-emerald-500 transition">XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-8 overflow-y-auto text-slate-900 render-content custom-scrollbar">
                <div dangerouslySetInnerHTML={{ __html: aiResponse || "<p class='text-center text-slate-400 mt-20 italic font-bold'>Dữ liệu bài giảng sẽ hiển thị tại đây...</p>" }} />
             </div>
          </div>
        </section>
      </main>

      {/* TRỢ LÝ AI DỄ THƯƠNG */}
      <div className="fixed bottom-6 right-6 z-[2000] group">
        <div className="bg-emerald-600 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all border-4 border-white animate-bounce">
          <span className="text-2xl">🌸</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content h2 { font-size: 20px; font-weight: 900; color: #065f46; margin-bottom: 12px; border-bottom: 2px solid #10b981; text-transform: uppercase; }
        .render-content table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .render-content td, .render-content th { border: 1px solid #cbd5e1; padding: 10px; font-size: 14px; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
      `}} />
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin = (info: any) => setIsLoggedIn(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  return isLoggedIn ? <MainApp /> : <LoginScreen onLogin={handleLogin} />;
};

export default App;