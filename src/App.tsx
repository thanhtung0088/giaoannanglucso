import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Login Screen
const LoginScreen: React.FC<{ onLogin: (userInfo: any) => void }> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<"teacher" | "admin">("teacher");
  const [password, setPassword] = useState("");
  const [showAdminButton, setShowAdminButton] = useState(false);
  const ADMIN_PASS = "admin123";

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setShowAdminButton(val === ADMIN_PASS);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    const token = credentialResponse.credential;
    const userInfo = JSON.parse(atob(token.split('.')[1]));
    console.log("Google User:", userInfo);
    onLogin(userInfo);
  };

  const handleGoogleFailure = () => {
    alert("Đăng nhập Google thất bại. Vui lòng thử lại!");
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl flex rounded-3xl overflow-hidden shadow-2xl bg-white">
          <div className="w-1/2 bg-gradient-to-br from-cyan-700 to-blue-800 p-20 flex flex-col justify-center items-center text-white">
            <div className="text-9xl mb-10">📚</div>
            <h1 className="text-6xl font-black mb-8 text-center">HỆ THỐNG SOẠN GIẢNG AI</h1>
            <p className="text-3xl font-semibold opacity-90">Năng lực số thế hệ mới</p>
            <p className="text-2xl mt-16 opacity-80">Trợ lý AI chuyên sâu hỗ trợ giáo viên</p>
          </div>

          <div className="w-1/2 p-20 flex flex-col justify-center">
            <h2 className="text-5xl font-bold text-center mb-6 text-blue-900">Đăng nhập</h2>
            <p className="text-center text-gray-700 text-2xl mb-12">Chào mừng Thầy/Cô quay trở lại!</p>

            <div className="flex mb-10 border-b border-gray-300">
              <button
                onClick={() => setActiveTab("teacher")}
                className={`flex-1 py-6 font-bold text-3xl ${activeTab === "teacher" ? "border-b-4 border-cyan-600 text-cyan-700" : "text-gray-600"}`}
              >
                GIÁO VIÊN
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-6 font-bold text-3xl ${activeTab === "admin" ? "border-b-4 border-cyan-600 text-cyan-700" : "text-gray-600"}`}
              >
                QUẢN TRỊ
              </button>
            </div>

            {activeTab === "teacher" && (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            )}

            {activeTab === "admin" && (
              <>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Mật khẩu Quản trị"
                  className="w-full p-8 border border-gray-300 rounded-2xl mb-8 text-2xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-300"
                />
                {showAdminButton && (
                  <button
                    onClick={() => onLogin({ name: "Admin", email: "admin@local" })}
                    className="w-full py-8 bg-green-600 hover:bg-green-700 text-white font-bold text-3xl rounded-2xl transition shadow-2xl"
                  >
                    VÀO HỆ THỐNG
                  </button>
                )}
              </>
            )}

            <p className="text-center text-xl text-gray-500 mt-12">Bảo mật dữ liệu chuẩn ngành giáo dục</p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

// Main App
const MainApp: React.FC<{ userInfo?: any }> = ({ userInfo }) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
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
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>(["Chào Thầy! 🌸 Em là trợ lý AI dễ thương đây ạ! Thầy cần em giúp gì hôm nay? 💕"]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["HS Đại trà", "HSHN"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 5;

  const getHardcodedPrompt = (type: string) => {
    const isHSHN = doiTuongHS === "HSHN";
    const mucDo = isHSHN ? "Yêu cầu: Giảm độ khó 50%, nội dung ngắn gọn, dùng từ ngữ đơn giản, dễ hiểu nhất cho học sinh hòa nhập." : "Yêu cầu: Đúng chuẩn định hướng phát triển năng lực.";
    const context = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet || 1} tiết), đối tượng ${doiTuongHS}.`;

    if (type === 'khbd') {
      return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018.\n\nHãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4, đảm bảo đầy đủ và đúng chuẩn.\nYêu cầu bắt buộc:\n* Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4\n* Dạy học theo định hướng phát triển phẩm chất và năng lực\n* TÍCH HỢP:\n  * Năng lực số\n  * Quyền con người\n  * Lồng ghép Giáo dục Quốc phòng – An ninh\n  * Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh\n\nCấu trúc KHBD gồm:\n1. MỤC TIÊU BÀI HỌC\n   * Phẩm chất\n   * Năng lực chung\n   * Năng lực đặc thù\n2. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n3. TIẾN TRÌNH DẠY HỌC:\n   * Hoạt động 1: Mở đầu\n   * Hoạt động 2: Hình thành kiến thức\n   * Hoạt động 3: Luyện tập\n   * Hoạt động 4: Vận dụng\n4. ĐIỀU CHỈNH – BỔ SUNG (nếu có)\n\nTrình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn. Output dưới dạng HTML đẹp, dùng <h2>, <h3>, <ul>, <ol>, <strong>, <em>, <table> để cấu trúc rõ ràng, dễ đọc.\n${mucDo}\n${context}`;
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        alert(`Chỉ được gắn tối đa ${MAX_FILES} file thôi ạ!`);
        return;
      }
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("API Key đang dùng:", apiKey);
    if (!apiKey) return alert("Hệ thống chưa có API Key!");

    setLoading(true);
    setAiResponse("");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(
        `Hãy trả lời với tư cách một Trợ lý AI giáo dục dễ thương, thân thiện. Output dưới dạng HTML đẹp, dùng <h2>, <h3>, <ul>, <ol>, <strong>, <em>, <table> để cấu trúc rõ ràng, dễ đọc và in ấn.\n${customPrompt}`
      );

      setAiResponse(result.response.text());

      confetti({
        particleCount: 200,
        spread: 90,
        startVelocity: 45,
        colors: ['#22c55e', '#eab308', '#a855f7', '#ef4444', '#3b82f6'],
        origin: { y: 0.6 }
      });
    } catch (e: any) {
      setAiResponse("Lỗi: " + e.message);
      console.error("Gemini error chi tiết:", e);
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: string) => {
    const blob = new Blob([aiResponse], { type: 'text/html' });
    saveAs(blob, `SoanGiang_${tenBai || 'V94'}.${format}`);
    setShowExportMenu(false);
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, `Thầy: ${chatMessage}`]);
    setChatMessage("");
    setTimeout(() => {
      setChatHistory(prev => [...prev, "Trợ lý AI: Dạ Thầy, em hiểu rồi ạ! Thầy cần em hỗ trợ soạn gì cụ thể nào? Em sẽ cố gắng làm thật đẹp và đúng chuẩn luôn 💕"]);
    }, 1500);
  };

  const openGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = window.location.origin;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-52 bg-gradient-to-r from-emerald-700 to-emerald-800 px-8 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6 w-1/3 pl-2">
          <div onClick={() => document.getElementById('avatar-input')?.click()} className="w-40 h-40 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all shadow-lg">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-base text-white font-black uppercase text-center leading-tight">DÁN<br/>LOGO</span>}
            <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-3xl font-black uppercase leading-tight">HỆ THỐNG SOẠN GIẢNG</h1>
            <p className="text-base font-bold text-emerald-200 uppercase mt-2">NĂNG LỰC SỐ THẾ HỆ MỚI</p>
          </div>
        </div>
        <div className="flex-1 flex justify-center ml-16"> {/* Dời sang trái rõ ràng hơn (ml-16 ≈ 4rem ≈ 1.6cm) */}
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-48 py-8 rounded-3xl border-2 border-yellow-300 shadow-xl">
            <h2 className="text-white text-6xl font-black uppercase italic tracking-widest animate-pulse whitespace-nowrap">
              CHÀO MỪNG QUÝ THẦY CÔ !
            </h2>
          </div>
        </div>
        <div className="w-1/3 flex justify-end gap-5">
          <button onClick={openGoogleMeet} className="bg-green-600 text-white px-8 py-5 rounded-xl font-black text-xl uppercase shadow-xl border-b-6 border-green-800 flex items-center gap-3 hover:bg-green-500 transition">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            GOOGLE MEET
          </button>
          <button onClick={() => setShowPackageModal(true)} className="bg-purple-600 text-white px-8 py-5 rounded-xl font-black text-xl uppercase shadow-xl border-b-6 border-purple-800 hover:bg-purple-500 transition">
            CẬP NHẬT NÂNG CAO
          </button>
          <button onClick={handleLogout} className="bg-red-600 text-white px-8 py-5 rounded-xl font-black text-xl uppercase shadow-xl border-b-6 border-red-800 hover:bg-red-500 transition">
            THOÁT ỨNG DỤNG
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-hidden">
        <aside className="col-span-3 space-y-10 flex flex-col min-h-0 relative overflow-visible z-[50]">
          <div className="bg-slate-800 p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-5 shrink-0 relative z-[60]">
            <h2 className="text-xl font-black text-cyan-300 uppercase italic tracking-wide">⚙️ CẤU HÌNH THIẾT KẾ</h2>
            <select value={monHoc} onChange={(e) => setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-cyan-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-cyan-400">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-5">
              <select value={khoiLop} onChange={(e) => setKhoiLop(e.target.value)} className="bg-slate-900 border border-cyan-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-cyan-400">
                {dsKhoi.map(k => <option key={k}>{k}</option>)}
              </select>
              <input type="text" value={soTiet} onChange={(e) => setSoTiet(e.target.value)} className="bg-slate-900 border border-cyan-600 rounded-xl p-4 text-base font-bold text-white placeholder-cyan-300 focus:ring-2 focus:ring-cyan-400" placeholder="Số tiết..." />
            </div>
            <input type="text" value={tenBai} onChange={(e) => setTenBai(e.target.value)} className="w-full bg-slate-900 border border-cyan-600 rounded-xl p-4 text-base font-bold text-white placeholder-cyan-300 focus:ring-2 focus:ring-cyan-400" placeholder="Tên bài dạy..." />
            <select value={doiTuongHS} onChange={(e) => setDoiTuongHS(e.target.value)} className="w-full bg-slate-900 border border-cyan-600 rounded-xl p-4 text-base font-bold text-orange-300 focus:ring-2 focus:ring-cyan-400">
              {dsDoiTuong.map(d => <option key={d}>{d}</option>)}
            </select>
            <div className="relative w-full">
              <button 
                onClick={() => setShowPromptMenu(!showPromptMenu)} 
                className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black text-base uppercase shadow-xl hover:shadow-orange-500/60 transition-all"
              >
                📜 CHỌN LỆNH MẪU (5) ▼
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-cyan-500 rounded-2xl shadow-2xl font-black italic overflow-hidden z-[9999]">
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('khbd')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    🔹 SOẠN KẾ HOẠCH BÀI DẠY (KHBD) THEO CV 5512 – GDPT 2018
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    🖥️ SOẠN BÀI GIẢNG TRÌNH CHIẾU (PPT) – THẨM MỸ, HIỆN ĐẠI
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('kiemtra')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    📝 SOẠN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    📚 SOẠN ĐỀ CƯƠNG ÔN TẬP
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('trochoi')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 text-sm leading-tight transition">
                    🎮 SOẠN TRÒ CHƠI TƯƠNG TÁC
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative z-[50] max-h-[60vh]">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 text-cyan-300 font-black text-base uppercase italic">THÊM DỮ LIỆU, HÌNH ẢNH (+)</div>
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-[60]">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log("=== DẤU + ĐƯỢC CLICK - MỞ FILE PICKER ===");
                  fileInputRef.current?.click();
                }}
                className="h-20 border-2 border-dashed border-cyan-500 rounded-3xl flex items-center justify-center cursor-pointer mb-5 bg-slate-900 hover:bg-cyan-900/30 transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto relative z-[70]"
              >
                <span className="text-5xl text-cyan-400 font-black">+</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={(e) => {
                  console.log("=== FILE ĐÃ ĐƯỢC CHỌN ===", e.target.files);
                  handleFileChange(e);
                }} 
              />
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-base text-cyan-200 italic mb-4 bg-slate-800 p-4 rounded-2xl border border-cyan-500/30 shadow-inner">
                  <span className="truncate max-w-[80%]">📄 {file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 font-bold text-2xl transition">×</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-8 rounded-3xl font-black text-xl uppercase bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-2xl shadow-cyan-500/60 border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        <section className="col-span-3">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 border-b border-slate-700 text-xl font-black text-orange-300 uppercase italic">Workspace Editor</div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-base text-slate-100 outline-none resize-none font-bold italic placeholder-cyan-300" placeholder="Nhập prompt tùy chỉnh hoặc chọn lệnh mẫu..." />
          </div>
        </section>

        <section className="col-span-6 flex flex-col relative">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-10 py-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
              <span className="text-base font-black text-emerald-300 uppercase italic">PREVIEW KẾT QUẢ</span>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-base font-black uppercase shadow-xl hover:shadow-emerald-500/60 transition">
                  ♻️ XUẤT FILE ▼
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white/95 rounded-xl shadow-2xl overflow-hidden z-[100] border border-emerald-400/30">
                    <button onClick={() => exportFile('html')} className="w-full px-5 py-4 text-left text-slate-900 hover:bg-emerald-100 font-black text-base uppercase border-b">📄 HTML (in ấn đẹp)</button>
                    <button onClick={() => exportFile('doc')} className="w-full px-5 py-4 text-left text-slate-900 hover:bg-emerald-100 font-black text-base uppercase border-b">📄 File Word (.doc)</button>
                    <button onClick={() => exportFile('pdf')} className="w-full px-5 py-4 text-left text-slate-900 hover:bg-emerald-100 font-black text-base uppercase">📕 File PDF (.pdf)</button>
                  </div>
                )}
              </div>
            </div>
            {/* Preview có thanh cuộn mạnh hơn */}
            <div className="flex-1 bg-white/95 p-10 overflow-y-auto text-slate-900 render-content custom-scrollbar" style={{ maxHeight: '70vh', minHeight: '300px' }}>
              <div dangerouslySetInnerHTML={{ __html: aiResponse || "<p className='text-center text-gray-500 italic text-lg'>Chưa có kết quả. Nhấn Kích hoạt soạn giảng để bắt đầu!</p>" }} />
            </div>
          </div>
        </section>
      </main>

      {/* Modal Cập nhật nâng cao */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[3000] p-4">
          <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-10 max-w-5xl w-full relative shadow-2xl text-white">
            <button onClick={() => setShowPackageModal(false)} className="absolute top-4 right-6 text-3xl font-black hover:text-yellow-400 transition">✕</button>
            <h2 className="text-yellow-400 text-3xl font-black text-center uppercase mb-8">CẬP NHẬT NÂNG CAO</h2>
            <p className="text-center text-lg mb-6 text-orange-300 font-bold">Người dùng mới chỉ được phép sử dụng gói FREE thôi!</p>

            <div className="grid grid-cols-3 gap-8">
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
                <h3 className="text-white font-black uppercase mb-4">Gói FREE</h3>
                <div className="text-3xl font-black text-emerald-400 mb-4">MIỄN PHÍ</div>
                <ul className="text-sm text-slate-400 text-left space-y-2">
                  <li>- Soạn 10 giáo án/tháng</li>
                  <li>- KHBD 5512, Đề 7991</li>
                </ul>
              </div>
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-emerald-500 text-center transform scale-105 shadow-2xl">
                <h3 className="text-emerald-400 font-black uppercase mb-4">PREMIUM</h3>
                <div className="text-3xl font-black text-white mb-4">199k/tháng</div>
                <ul className="text-sm text-slate-300 text-left space-y-2">
                  <li>- Soạn 4 loại bài soạn</li>
                  <li>- Không giới hạn số lượng</li>
                </ul>
              </div>
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-orange-500 text-center">
                <h3 className="text-orange-500 font-black uppercase mb-4">LOẠI PRO</h3>
                <div className="text-3xl font-black text-white mb-4">499k/năm</div>
                <ul className="text-sm text-slate-300 text-left space-y-2">
                  <li>- Soạn được 5 loại bài soạn</li>
                  <li>- KHBD 5512, PPT, Đề KT 7991</li>
                  <li>- Đề cương, Trò chơi tương tác</li>
                  <li>- Sử dụng Trợ lý AI đặc biệt</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-black">Ngân hàng: <span className="text-yellow-400 uppercase">DONGA BANK</span></p>
                <p className="font-black">Số tài khoản: <span className="text-emerald-400 text-2xl">916033681</span></p>
                <p className="font-black">Chủ TK: <span className="text-yellow-400 uppercase">NGUYỄN THANH TÙNG</span></p>
                <p className="text-orange-400 font-black">Liên hệ Zalo: 0916033681</p>
              </div>
              <div className="w-32 h-32 bg-white p-2 rounded-xl">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/0916033681" className="w-full h-full" alt="QR" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trợ lý AI robot */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end">
        <div 
          onClick={() => setShowAIChat(!showAIChat)} 
          className="relative cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 animate-bounce-slow">
            <span className="text-4xl drop-shadow-lg">🤖</span>
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black text-slate-900 shadow-md animate-pulse">
            AI
          </div>
        </div>

        {showAIChat && (
          <div className="mt-4 w-96 bg-white/95 rounded-2xl shadow-2xl border border-purple-300/50 p-5 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                <span className="text-2xl">🤖</span> Trợ lý AI dễ thương
              </h3>
              <button onClick={() => setShowAIChat(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-xl text-slate-900 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.startsWith("Thầy:") ? "text-right" : "text-left"}`}>
                  <span className={`inline-block p-3 rounded-2xl max-w-[80%] shadow-sm ${msg.startsWith("Thầy:") ? "bg-blue-100 text-blue-900" : "bg-pink-100 text-pink-900"}`}>
                    {msg}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Gõ tin nhắn cho em nè Thầy..."
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900"
              />
              <button onClick={sendChatMessage} className="px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition">
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content { overflow-y: auto; max-height: 100%; padding-right: 10px; }
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid #1e40af; margin: 20px 0; background: #f8fafc; box-shadow: 0 4px 10px rgba(30,64,175,0.2); }
        .render-content td, .render-content th { border: 1px solid #cbd5e1; padding: 14px; font-size: 15px; }
        .render-content h2 { font-size: 2rem; font-weight: bold; margin: 2rem 0 1rem; color: #1e40af; border-bottom: 3px solid #e2e8f0; padding-bottom: 0.5rem; }
        .render-content h3 { font-size: 1.5rem; font-weight: bold; margin: 1.5rem 0 0.75rem; color: #1e40af; }
        .render-content ul, .render-content ol { margin: 1.5rem 0; padding-left: 2rem; }
        .render-content li { margin-bottom: 0.8rem; font-size: 1.1rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 4s infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      ` }} />
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleLogin = (info: any) => {
    setUserInfo(info);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(info));
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log("User từ localStorage:", savedUser);
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  if (!isLoggedIn || !localStorage.getItem("user")) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp userInfo={userInfo} />;
};

export default App;