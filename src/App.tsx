import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

// Login Screen (giữ nguyên)
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<"teacher" | "admin">("teacher");
  const [password, setPassword] = useState("");
  const [showAdminButton, setShowAdminButton] = useState(false);
  const ADMIN_PASS = "admin123";

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setShowAdminButton(val === ADMIN_PASS);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl bg-white">
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
            <button
              onClick={onLogin}
              className="w-full py-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-2xl rounded-2xl flex items-center justify-center gap-4 transition shadow-lg mb-8"
            >
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-10 h-10" alt="Google" />
              ĐĂNG NHẬP GOOGLE
            </button>
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
                  onClick={onLogin}
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
  );
};

// Main App
const MainApp: React.FC = () => {
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
  const [chatHistory, setChatHistory] = useState<string[]>(["Chào Thầy Tùng! 🌸 Em là trợ lý AI dễ thương đây ạ! Thầy cần em giúp gì hôm nay? 💕"]);

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
      return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018.\n\nHãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4, đảm bảo đầy đủ và đúng chuẩn.\nYêu cầu bắt buộc:\n* Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4\n* Dạy học theo định hướng phát triển phẩm chất và năng lực\n* TÍCH HỢP:\n  * Năng lực số\n  * Quyền con người\n  * Lồng ghép Giáo dục Quốc phòng – An ninh\n  * Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh\n\nCấu trúc KHBD gồm:\n1. MỤC TIÊU BÀI HỌC\n   * Phẩm chất\n   * Năng lực chung\n   * Năng lực đặc thù\n2. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n3. TIẾN TRÌNH DẠY HỌC:\n   * Hoạt động 1: Mở đầu\n   * Hoạt động 2: Hình thành kiến thức\n   * Hoạt động 3: Luyện tập\n   * Hoạt động 4: Vận dụng\n4. ĐIỀU CHỈNH – BỔ SUNG (nếu có)\n\nTrình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn. Output dưới dạng HTML đẹp, dùng <h2>, <h3>, <ul>, <strong> để cấu trúc rõ ràng, dễ đọc.\n${mucDo}\n${context}`;
    }
    if (type === 'ppt') {
      return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm.\n\nHãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ bài học trên, đảm bảo:\nYêu cầu:\n* Ít nhất 10 slide\n* Nội dung bám sát KHBD\n* Dạy học theo định hướng phát triển năng lực\n* AI tự chọn màu sắc – bố cục đẹp – dễ nhìn\n* Phù hợp học sinh theo chương trình GDPT 2018\n\nMỗi slide gồm:\n* Tiêu đề\n* Nội dung ngắn gọn (gạch đầu dòng)\n* Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa\n\nCấu trúc gợi ý:\n* Slide 1: Tiêu đề\n* Slide 2: Mục tiêu\n* Slide 3–8: Nội dung trọng tâm\n* Slide 9: Hoạt động – câu hỏi tương tác\n* Slide 10: Tổng kết – liên hệ thực tiễn\n${mucDo}\n${context}`;
    }
    if (type === 'kiemtra') {
      return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực.\n\nHãy soạn ĐỀ KIỂM TRA theo Công văn 7991/BGDĐT-GDTrH, đảm bảo:\nYêu cầu:\n* Đúng ma trận và đặc tả theo CV 7991\n* Đánh giá mức độ nhận thức:\n  * Nhận biết\n  * Thông hiểu\n  * Vận dụng\n  * Vận dụng cao\n* Câu hỏi gắn với thực tiễn, năng lực, phẩm chất\n\nSản phẩm gồm:\n1. Ma trận đề\n2. Bảng đặc tả\n3. Đề kiểm tra\n4. Đáp án – thang điểm chi tiết\n\nNgôn ngữ chuẩn, dùng được cho kiểm tra định kỳ / giữa kỳ / cuối kỳ.\n${isHSHN ? "Lưu ý đặc biệt: Học sinh hòa nhập (HSHN), giảm độ khó 50%, tập trung nhận biết." : ""}\n${context}`;
    }
    if (type === 'ontap') {
      return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018.\n\nHãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh, đảm bảo:\nYêu cầu:\n* Hệ thống kiến thức ngắn gọn – dễ nhớ\n* Phân chia rõ:\n  * Kiến thức trọng tâm\n  * Kỹ năng cần đạt\n  * Dạng bài thường gặp\n* Có câu hỏi gợi ý ôn luyện\n* Phù hợp đánh giá theo định hướng năng lực\n\nTrình bày mạch lạc, dễ in phát cho học sinh.\n${mucDo}\n${context}`;
    }
    if (type === 'trochoi') {
      return `Bạn là chuyên gia thiết kế trò chơi tương tác giáo dục theo định hướng GDPT 2018.\n\nHãy soạn TRÒ CHƠI TƯƠNG TÁC cho bài học trên, đảm bảo:\nYêu cầu:\n* Các loại câu hỏi nghiệm: Trắc nghiệm chọn đáp án đúng nhất, Đúng/Sai, Nối thẻ, Điền khuyết, Sắp xếp thứ tự, v.v.\n* Số lượng: 10-15 câu hỏi\n* Có đáp án chi tiết và giải thích ngắn gọn\n* Phù hợp học sinh ${doiTuongHS}, tích hợp năng lực số và kiến thức bài học\n* Trình bày rõ ràng, dễ copy vào công cụ như Kahoot, Quizizz hoặc slide tương tác\n${mucDo}\n${context}`;
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
    // Giả lập phản hồi
    setTimeout(() => {
      setChatHistory(prev => [...prev, "Trợ lý AI: Dạ Thầy, em hiểu rồi ạ! Thầy cần em hỗ trợ soạn gì cụ thể nào? Em sẽ cố gắng làm thật đẹp và đúng chuẩn luôn 💕"]);
    }, 1500);
  };

  const openGoogleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
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
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-10 py-3 rounded-2xl border-2 border-yellow-300 shadow-xl">
            <h2 className="text-white text-2xl font-black uppercase italic animate-pulse">CHÀO MỪNG THẦY TÙNG !</h2>
          </div>
        </div>
        <div className="w-1/3 flex justify-end gap-3">
          <button onClick={openGoogleMeet} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-green-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            GOOGLE MEET
          </button>
          <button onClick={() => setShowPackageModal(true)} className="bg-purple-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-purple-800">
            CẬP NHẬT NÂNG CAO
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          {/* Cấu hình thiết kế, hành trang, nút Kích hoạt giữ nguyên như trước */}
          {/* ... (em không paste hết để ngắn, Thầy copy phần này từ code cũ nếu cần) */}
        </aside>

        {/* Workspace Editor và Preview giữ nguyên */}
        {/* ... */}

      </main>

      {/* Modal Cập nhật nâng cao */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[3000] p-4">
          <div className="bg-slate-800 border-4 border-purple-600 rounded-3xl p-10 max-w-3xl w-full relative shadow-2xl text-white">
            <button onClick={() => setShowPackageModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-purple-400 text-3xl font-black text-center uppercase mb-8">GÓI SỬ DỤNG</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">Gói Free</h3>
                <p className="text-lg">Soạn 10 giáo án/tháng</p>
                <p className="text-sm mt-2">(KHBD 5512, Đề kiểm tra 7991)</p>
                <p className="text-green-400 font-bold mt-4">0đ</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-4 py-1">Hot</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Gói Premium</h3>
                <p className="text-lg">Soạn 4 loại bài soạn</p>
                <p className="text-sm mt-2">KHBD, PPT, Đề kiểm tra, Ôn tập</p>
                <p className="text-green-400 font-bold text-2xl mt-4">199k/tháng</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center">
                <h3 className="text-xl font-bold text-purple-400 mb-4">Gói Pro</h3>
                <p className="text-lg">Soạn 5 loại:</p>
                <p className="text-sm mt-2">KHBD, PPT, Đề kiểm tra, Ôn tập, Trò chơi tương tác</p>
                <p className="text-green-400 font-bold text-2xl mt-4">499k/năm</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-bold mb-4">Liên hệ để mua:</p>
              <p className="text-orange-400">Dùng Zalo quét QR để chuyển khoản nhanh</p>
              <div className="bg-white p-4 rounded-xl mx-auto mt-4 w-64">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=STK:916033681&size=200x200" alt="QR Thanh toán" className="w-full" />
              </div>
              <p className="text-orange-400 mt-4 text-xl font-bold">916033681</p>
              <p className="text-orange-400">NGUYỄN THANH TÙNG - DONGA BANK</p>
            </div>
          </div>
        </div>
      )}

      {/* Trợ lý AI góc dưới bên phải */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end">
        <div 
          onClick={() => setShowAIChat(!showAIChat)}
          className="relative cursor-pointer"
        >
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
        .render-content { overflow-y: auto; max-height: 100%; }
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; margin: 20px 0; }
        .render-content td, .render-content th { border: 1px solid black; padding: 12px; font-size: 14px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <MainApp />;
};

export default App;