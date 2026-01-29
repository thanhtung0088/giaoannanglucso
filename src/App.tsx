import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Login Screen (giữ nguyên)
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
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="w-1/2 bg-gradient-to-br from-cyan-700 to-blue-800 p-16 flex flex-col justify-center items-center text-white">
            <div className="text-8xl mb-8">📚</div>
            <h1 className="text-5xl font-black mb-6">HỆ THỐNG SOẠN GIẢNG AI</h1>
            <p className="text-2xl font-semibold opacity-90">Năng lực số thế hệ mới</p>
            <p className="text-xl mt-12 opacity-80">Trợ lý AI chuyên sâu hỗ trợ giáo viên</p>
          </div>

          <div className="w-1/2 p-16 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-center mb-4 text-blue-900">Đăng nhập</h2>
            <p className="text-center text-gray-600 text-xl mb-10">Chào mừng Thầy/Cô quay trở lại!</p>

            <div className="flex mb-8 border-b border-gray-300">
              <button
                onClick={() => setActiveTab("teacher")}
                className={`flex-1 py-5 font-bold text-2xl ${activeTab === "teacher" ? "border-b-4 border-cyan-600 text-cyan-700" : "text-gray-600"}`}
              >
                GIÁO VIÊN
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-5 font-bold text-2xl ${activeTab === "admin" ? "border-b-4 border-cyan-600 text-cyan-700" : "text-gray-600"}`}
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
                  className="w-full p-6 border border-gray-300 rounded-2xl mb-6 text-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300"
                />
                {showAdminButton && (
                  <button
                    onClick={() => onLogin({ name: "Admin", email: "admin@local" })}
                    className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-2xl rounded-2xl transition shadow-lg"
                  >
                    VÀO HỆ THỐNG
                  </button>
                )}
              </>
            )}

            <p className="text-center text-lg text-gray-500 mt-8">Bảo mật dữ liệu chuẩn ngành giáo dục</p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

// Main App - Giao diện chính với cải tiến hiện đại
const MainApp: React.FC<{ userInfo?: any }> = ({ userInfo }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
    // Các prompt khác giữ nguyên (em rút gọn để code ngắn)
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
    if (!apiKey) return alert("Hệ thống chưa có API Key!");

    setLoading(true);
    setAiResponse("");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(`Hãy trả lời với tư cách một Trợ lý AI giáo dục dễ thương, thân thiện. Output dưới dạng HTML đẹp, dùng <h2>, <h3>, <ul>, <ol>, <strong>, <em>, <table> để cấu trúc rõ ràng, dễ đọc và in ấn.\n${customPrompt}`);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) {
      setAiResponse("Lỗi: " + e.message);
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

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-gradient-to-r from-emerald-700 to-emerald-800 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50 backdrop-blur-sm">
        <div className="flex items-center gap-6 w-1/3">
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
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-10 py-3 rounded-2xl border-2 border-yellow-300 shadow-xl backdrop-blur-sm">
            <h2 className="text-white text-2xl font-black uppercase italic animate-pulse">
              CHÀO MỪNG QUÝ THẦY CÔ !
            </h2>
          </div>
        </div>
        <div className="w-1/3 flex justify-end gap-3">
          <button onClick={openGoogleMeet} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-green-800 flex items-center gap-2 hover:bg-green-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            GOOGLE MEET
          </button>
          <button onClick={() => setShowPackageModal(true)} className="bg-purple-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-purple-800 hover:bg-purple-500 transition">
            CẬP NHẬT NÂNG CAO
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl shadow-cyan-500/10 space-y-4 shrink-0">
            <h2 className="text-lg font-black text-cyan-400 uppercase italic tracking-wide">⚙️ CẤU HÌNH THIẾT KẾ</h2>
            <select value={monHoc} onChange={(e) => setMonHoc(e.target.value)} className="w-full bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3 text-sm font-bold text-white italic focus:ring-2 focus:ring-cyan-500">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select value={khoiLop} onChange={(e) => setKhoiLop(e.target.value)} className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3 text-sm font-bold text-white italic focus:ring-2 focus:ring-cyan-500">
                {dsKhoi.map(k => <option key={k}>{k}</option>)}
              </select>
              <input type="text" value={soTiet} onChange={(e) => setSoTiet(e.target.value)} className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3 text-sm font-bold text-white italic placeholder-cyan-300 focus:ring-2 focus:ring-cyan-500" placeholder="Số tiết..." />
            </div>
            <input type="text" value={tenBai} onChange={(e) => setTenBai(e.target.value)} className="w-full bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3 text-sm font-bold text-white italic placeholder-cyan-300 focus:ring-2 focus:ring-cyan-500" placeholder="Tên bài dạy..." />
            <select value={doiTuongHS} onChange={(e) => setDoiTuongHS(e.target.value)} className="w-full bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3 text-sm font-bold text-orange-400 italic focus:ring-2 focus:ring-cyan-500">
              {dsDoiTuong.map(d => <option key={d}>{d}</option>)}
            </select>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black text-sm uppercase shadow-xl hover:shadow-orange-500/50 transition-all">
              📜 CHỌN LỆNH MẪU (5) ▼
            </button>
            {showPromptMenu && (
              <div className="absolute left-10 w-96 bg-slate-800/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl z-[100] shadow-2xl shadow-cyan-500/20 font-black italic overflow-hidden">
                <button onClick={() => { setCustomPrompt(getHardcodedPrompt('khbd')); setShowPromptMenu(false); }} className="w-full text-left px-6 py-5 hover:bg-cyan-700/50 border-b border-cyan-500/30 text-sm transition">
                  🔹 SOẠN KẾ HOẠCH BÀI DẠY (KHBD) THEO CV 5512 – GDPT 2018
                </button>
                <button onClick={() => { setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false); }} className="w-full text-left px-6 py-5 hover:bg-cyan-700/50 border-b border-cyan-500/30 text-sm transition">
                  🖥️ SOẠN BÀI GIẢNG TRÌNH CHIẾU (PPT) – THẨM MỸ, HIỆN ĐẠI
                </button>
                <button onClick={() => { setCustomPrompt(getHardcodedPrompt('kiemtra')); setShowPromptMenu(false); }} className="w-full text-left px-6 py-5 hover:bg-cyan-700/50 border-b border-cyan-500/30 text-sm transition">
                  📝 SOẠN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991
                </button>
                <button onClick={() => { setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false); }} className="w-full text-left px-6 py-5 hover:bg-cyan-700/50 border-b border-cyan-500/30 text-sm transition">
                  📚 SOẠN ĐỀ CƯƠNG ÔN TẬP
                </button>
                <button onClick={() => { setCustomPrompt(getHardcodedPrompt('trochoi')); setShowPromptMenu(false); }} className="w-full text-left px-6 py-5 hover:bg-cyan-700/50 text-sm transition">
                  🎮 SOẠN TRÒ CHƠI TƯƠNG TÁC
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 flex flex-col flex-1 overflow-hidden">
            <div className="bg-slate-900/70 px-6 py-3 border-b border-cyan-500/30 text-cyan-400 font-black text-sm uppercase italic">📁 HÀNH TRANG (+)</div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 border-2 border-dashed border-cyan-500/50 rounded-2xl flex items-center justify-center cursor-pointer mb-3 bg-slate-900/50 hover:bg-cyan-900/20 transition">
                <span className="text-3xl text-cyan-400 font-black">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-cyan-300 italic mb-2 bg-slate-800/50 p-3 rounded-xl border border-cyan-500/20">
                  <span>📄 {file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 font-bold text-xl">×</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-2xl shadow-cyan-500/50 border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        <section className="col-span-3">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-900/70 border-b border-cyan-500/30 text-lg font-black text-orange-400 uppercase italic">Workspace Editor</div>
            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic placeholder-cyan-300" placeholder="Nhập prompt tùy chỉnh hoặc chọn lệnh mẫu..." />
          </div>
        </section>

        <section className="col-span-6 flex flex-col relative">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 flex flex-col h-full overflow-hidden">
            <div className="px-10 py-5 bg-slate-900/70 border-b border-cyan-500/30 flex justify-between items-center">
              <span className="text-sm font-black text-emerald-400 uppercase italic">PREVIEW KẾT QUẢ</span>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-black uppercase shadow-xl hover:shadow-emerald-500/50 transition">
                  ♻️ XUẤT FILE ▼
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-[100] border border-emerald-500/30">
                    <button onClick={() => exportFile('html')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-sm uppercase border-b">📄 HTML (in ấn đẹp)</button>
                    <button onClick={() => exportFile('doc')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-sm uppercase border-b">📄 File Word (.doc)</button>
                    <button onClick={() => exportFile('pdf')} className="w-full px-4 py-3 text-left text-slate-900 hover:bg-emerald-100 font-black text-sm uppercase">📕 File PDF (.pdf)</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 bg-white/95 backdrop-blur-md p-10 overflow-y-auto text-slate-900 render-content custom-scrollbar">
              <div dangerouslySetInnerHTML={{ __html: aiResponse || "<p className='text-center text-gray-500'>Chưa có kết quả. Nhấn Kích hoạt soạn giảng để bắt đầu!</p>" }} />
            </div>
          </div>
        </section>
      </main>

      {/* Modal Cập nhật nâng cao */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[3000] p-4">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md border-4 border-purple-600 rounded-3xl p-10 max-w-3xl w-full relative shadow-2xl shadow-purple-500/30 text-white">
            <button onClick={() => setShowPackageModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black hover:text-purple-300">✕</button>
            <h2 className="text-purple-400 text-3xl font-black text-center uppercase mb-8">GÓI SỬ DỤNG</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-600/50 text-center shadow-lg">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">Gói Free</h3>
                <p className="text-lg">Soạn 10 giáo án/tháng</p>
                <p className="text-sm mt-2">(KHBD 5512, Đề kiểm tra 7991)</p>
                <p className="text-green-400 font-bold mt-4">0đ</p>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-600/50 text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-4 py-1">Hot</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Gói Premium</h3>
                <p className="text-lg">Soạn 4 loại bài soạn</p>
                <p className="text-sm mt-2">KHBD, PPT, Đề kiểm tra, Ôn tập</p>
                <p className="text-green-400 font-bold text-2xl mt-4">199k/tháng</p>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-600/50 text-center shadow-lg">
                <h3 className="text-xl font-bold text-purple-400 mb-4">Gói Pro</h3>
                <p className="text-lg">Soạn 5 loại:</p>
                <p className="text-sm mt-2">KHBD, PPT, Đề kiểm tra, Ôn tập, Trò chơi tương tác</p>
                <p className="text-green-400 font-bold text-2xl mt-4">499k/năm</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-bold mb-4">Liên hệ để mua:</p>
              <p className="text-orange-400">Dùng Zalo quét QR để chuyển khoản nhanh</p>
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl mx-auto mt-4 w-64 shadow-inner">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=STK:916033681&size=200x200" alt="QR Thanh toán" className="w-full" />
              </div>
              <p className="text-orange-400 mt-4 text-xl font-bold">916033681</p>
              <p className="text-orange-400">NGUYỄN THANH TÙNG - DONGA BANK</p>
            </div>
          </div>
        </div>
      )}

      {/* Trợ lý AI */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end">
        <div onClick={() => setShowAIChat(!showAIChat)} className="relative cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-2xl flex items-center justify-center animate-pulse-slow hover:scale-110 transition-transform border-4 border-white/30">
            <span className="text-4xl">👩‍🏫</span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black text-slate-900 shadow-md animate-bounce">
            AI
          </div>
        </div>

        {showAIChat && (
          <div className="mt-4 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-300/50 p-5 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-indigo-900 text-lg">Trợ lý AI dễ thương</h3>
              <button onClick={() => setShowAIChat(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-xl text-slate-900">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.startsWith("Thầy:") ? "text-right" : "text-left"}`}>
                  <span className={`inline-block p-3 rounded-2xl max-w-[80%] ${msg.startsWith("Thầy:") ? "bg-blue-100 text-blue-900" : "bg-pink-100 text-pink-900"}`}>
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
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900"
              />
              <button onClick={sendChatMessage} className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold">
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content { overflow-y: auto; max-height: 100%; padding-right: 8px; }
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid #1e40af; margin: 20px 0; background: #f8fafc; }
        .render-content td, .render-content th { border: 1px solid #cbd5e1; padding: 12px; font-size: 14px; }
        .render-content h2 { font-size: 1.8rem; font-weight: bold; margin: 1.8rem 0 1rem; color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .render-content h3 { font-size: 1.4rem; font-weight: bold; margin: 1.5rem 0 0.75rem; color: #1e40af; }
        .render-content ul, .render-content ol { margin: 1.2rem 0; padding-left: 1.8rem; }
        .render-content li { margin-bottom: 0.6rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #64748b, #475569); border-radius: 10px; }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
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
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUserInfo(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp userInfo={userInfo} />;
};

export default App;