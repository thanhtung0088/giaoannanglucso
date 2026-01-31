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
    <GoogleOAuthProvider clientId="709918336708-70ivgeftafg1n2uqd0p68ec659qhidoh.apps.googleusercontent.com"> {/* Client ID thật của Thầy */}
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
    } else if (type === 'ppt') {
      return `Soạn bài giảng PowerPoint hiện đại, thẩm mỹ cao cho ${context}. Sử dụng ngôn ngữ dễ hiểu, slide đẹp, có hình ảnh minh họa, bảng biểu, animation nhẹ nhàng.`;
    } else if (type === 'kiemtra') {
      return `Soạn đề kiểm tra theo Công văn 7991, môn ${monHoc}, lớp ${khoiLop}, bài ${tenBai}, đối tượng ${doiTuongHS}. Đề gồm trắc nghiệm và tự luận, có đáp án chi tiết.`;
    } else if (type === 'ontap') {
      return `Soạn đề cương ôn tập chi tiết cho bài ${tenBai}, môn ${monHoc}, lớp ${khoiLop}. Bao gồm kiến thức trọng tâm, bài tập, câu hỏi ôn.`;
    } else if (type === 'trochoi') {
      return `Soạn trò chơi tương tác giáo dục vui nhộn cho bài ${tenBai}, môn ${monHoc}, lớp ${khoiLop}. Có thể là trò chơi nhóm, quiz, đố vui, phù hợp ${doiTuongHS}.`;
    }
    return "";
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

      const prompt = getHardcodedPrompt('khbd'); // Hoặc tùy chọn khác nếu cần
      console.log("Prompt gửi đi cho Gemini:", prompt.substring(0, 300) + "..."); // Debug để xem prompt

      const result = await model.generateContent(prompt);

      let html = result.response.text();
      console.log("HTML nhận từ Gemini:", html.substring(0, 300) + "..."); // Debug

      // Thêm header ngày soạn / tuần dạy (luôn thêm ở đầu, ngay cả khi Gemini không có)
      const header = `
<div style="text-align: right; margin-bottom: 30px; font-size: 16px; font-style: italic; color: #333;">
  <p><strong>Ngày soạn:</strong> ................</p>
  <p><strong>Tuần dạy:</strong> ...................</p>
</div>
      `;
      html = header + html;

      setAiResponse(html);

      confetti({
        particleCount: 200,
        spread: 90,
        startVelocity: 45,
        colors: ['#22c55e', '#eab308', '#a855f7', '#ef4444', '#3b82f6'],
        origin: { y: 0.6 }
      });
    } catch (e: any) {
      console.error("Gemini error chi tiết:", e);
      setAiResponse("<p style='color:red; text-align:center;'>Lỗi khi gọi Gemini: " + e.message + "</p>");
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: string) => {
    const blob = new Blob([aiResponse], { type: 'text/html' });
    saveAs(blob, `SoanGiang_${tenBai || 'V94'}.${format}`);
    setShowExportMenu(false);
  };

  // Các hàm còn lại giữ nguyên (handleAvatarChange, handleFileChange, sendChatMessage, openGoogleMeet, handleLogout, v.v.)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-100 flex flex-col font-sans italic">
      {/* Header giữ nguyên */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-8 py-6 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        {/* ... logo, chữ chào mừng, 3 nút ... */}
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-auto">
        {/* Sidebar trái giữ nguyên */}
        <aside className="col-span-3 min-w-[320px] space-y-10 flex flex-col min-h-0 relative overflow-visible z-[50]">
          {/* ... cấu hình thiết kế, thêm file, nút kích hoạt ... */}
        </aside>

        {/* Workspace Editor giữ nguyên */}
        <section className="col-span-3 min-w-[300px]">
          {/* ... */}
        </section>

        {/* Preview - rộng sát viền */}
        <section className="col-span-6 flex flex-col relative">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-10 py-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
              <span className="text-base font-black text-emerald-300 uppercase italic">PREVIEW KẾT QUẢ</span>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-base font-black uppercase shadow-xl hover:shadow-emerald-500/60 transition">
                  ♻️ XUẤT FILE ▼
                </button>
                {/* ... menu xuất file giữ nguyên */}
              </div>
            </div>
            <div className="flex-1 bg-white/95 p-0 overflow-y-auto text-slate-900 render-content custom-scrollbar" style={{ maxHeight: '70vh', minHeight: '500px' }}>
              <div className="w-full max-w-none px-8 py-6" dangerouslySetInnerHTML={{ __html: aiResponse || "<p class='text-center text-gray-500 italic text-lg'>Chưa có kết quả. Nhấn Kích hoạt soạn giảng để bắt đầu!</p>" }} />
            </div>
          </div>
        </section>
      </main>

      {/* Modal, Trợ lý AI giữ nguyên */}
      {/* ... */}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content { width: 100%; max-width: 100%; box-sizing: border-box; word-wrap: break-word; line-height: 1.6; font-size: 16px; }
        .render-content table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .render-content td, .render-content th { border: 1px solid #ccc; padding: 12px; }
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
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
    window.location.reload();
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log("User từ localStorage:", savedUser);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserInfo(parsed);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Lỗi parse user:", e);
        localStorage.removeItem("user");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp userInfo={userInfo} />;
};

export default App;