import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Login Screen (giữ nguyên)
const LoginScreen: React.FC<{ onLogin: (userInfo: any) => void }> = ({ onLogin }) => {
  // ... (giữ nguyên toàn bộ LoginScreen như trước)
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
  const [chatHistory, setChatHistory] = useState<string[]>(["Chào Thầy/Cô ! 🌸 Em là trợ lý AI dễ thương đây ạ! Thầy/Cô cần em giúp gì hôm nay? 💕"]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null); // Theo dõi lệnh nào đang chọn để hiện nút phụ

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
      return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm.\n\nHãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ bài học trên, đảm bảo:\nYêu cầu:\n* Ít nhất 10 slide\n* Nội dung bám sát KHBD\n* Dạy học theo định hướng phát triển năng lực\n* AI tự chọn màu sắc – bố cục đẹp – dễ nhìn\n* Phù hợp học sinh theo chương trình GDPT 2018\n\nMỗi slide gồm:\n* Tiêu đề\n* Nội dung ngắn gọn (gạch đầu dòng)\n* Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa\n\nCấu trúc gợi ý:\n* Slide 1: Tiêu đề\n* Slide 2: Mục tiêu\n* Slide 3–8: Nội dung trọng tâm\n* Slide 9: Hoạt động – câu hỏi tương tác\n* Slide 10: Tổng kết – liên hệ thực tiễn\nOutput dưới dạng HTML mô tả cấu trúc slide đẹp.`;
    } else if (type === 'kiemtra') {
      return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực.\n\nHãy soạn ĐỀ KIỂM TRA theo Công văn 7991/BGDĐT-GDTrH, đảm bảo:\nYêu cầu:\n* Đúng ma trận và đặc tả theo CV 7991\n* Đánh giá mức độ nhận thức:\n  * Nhận biết\n  * Thông hiểu\n  * Vận dụng\n  * Vận dụng cao\n* Câu hỏi gắn với thực tiễn, năng lực, phẩm chất\n\nSản phẩm gồm:\n1. Ma trận đề\n2. Bảng đặc tả\n3. Đề kiểm tra\n4. Đáp án – thang điểm chi tiết\n\nNgôn ngữ chuẩn, dùng được cho kiểm tra định kỳ / giữa kỳ / cuối kỳ. Output dưới dạng HTML đẹp.`;
    } else if (type === 'ontap') {
      return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018.\n\nHãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh, đảm bảo:\nYêu cầu:\n* Hệ thống kiến thức ngắn gọn – dễ nhớ\n* Phân chia rõ:\n  * Kiến thức trọng tâm\n  * Kỹ năng cần đạt\n  * Dạng bài thường gặp\n* Có câu hỏi gợi ý ôn luyện\n* Phù hợp đánh giá theo định hướng năng lực\n\nTrình bày mạch lạc, dễ in phát cho học sinh. Output dưới dạng HTML.`;
    } else if (type === 'trochoi') {
      return `Bạn là chuyên gia thiết kế hoạt động trải nghiệm sáng tạo.\n\nHãy soạn TRÒ CHƠI TƯƠNG TÁC giáo dục vui nhộn cho bài học trên, đảm bảo:\nYêu cầu:\n* Phù hợp học sinh lớp ${khoiLop}, môn ${monHoc}\n* Có thể chơi theo nhóm hoặc cá nhân\n* Gắn với nội dung bài học, phát triển năng lực\n* Có hướng dẫn chơi rõ ràng, thời gian ước tính\n* Có phần đánh giá kết quả trò chơi\n\nTrình bày dưới dạng HTML đẹp, dễ in phát cho học sinh.`;
    }
    return "";
  };

  const handleSelectCommand = (type: string) => {
    const prompt = getHardcodedPrompt(type);
    setCustomPrompt(prompt);
    setSelectedCommand(type); // Lưu lệnh đang chọn để hiện nút phụ nếu là PPT
    setShowPromptMenu(false);
  };

  // Các hàm khác giữ nguyên (handleSoanBai, exportFile, sendChatMessage, openGoogleMeet, handleLogout, v.v.)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-100 flex flex-col font-sans italic">
      {/* Header giữ nguyên */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-8 py-6 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        {/* ... logo, chữ chào mừng, nút bên phải ... */}
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-auto">
        <aside className="col-span-3 min-w-[320px] space-y-10 flex flex-col min-h-0 relative overflow-visible z-[50]">
          {/* ... cấu hình thiết kế ... */}
          <div className="relative w-full">
            <button 
              onClick={() => setShowPromptMenu(!showPromptMenu)} 
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black text-base uppercase shadow-xl hover:shadow-orange-500/60 transition-all"
            >
              📜 CHỌN LỆNH MẪU (5) ▼
            </button>
            {showPromptMenu && (
              <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-cyan-500 rounded-2xl shadow-2xl font-black italic overflow-hidden z-[9999]">
                <button onClick={(e) => { e.stopPropagation(); handleSelectCommand('khbd'); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                  🔹 SOẠN KẾ HOẠCH BÀI DẠY (KHBD) THEO CV 5512 – GDPT 2018
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleSelectCommand('ppt'); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                  🖥️ SOẠN BÀI GIẢNG TRÌNH CHIẾU (PPT) – THẨM MỸ, HIỆN ĐẠI
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleSelectCommand('kiemtra'); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                  📝 SOẠN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleSelectCommand('ontap'); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                  📚 SOẠN ĐỀ CƯƠNG ÔN TẬP
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleSelectCommand('trochoi'); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 text-sm leading-tight transition">
                  🎮 SOẠN TRÒ CHƠI TƯƠNG TÁC
                </button>
              </div>
            )}
          </div>

          {/* ... phần thêm file, nút kích hoạt giữ nguyên ... */}
        </aside>

        <section className="col-span-3 min-w-[300px]">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 bg-slate-900 border-b border-slate-700 text-xl font-black text-orange-300 uppercase italic">Workspace Editor</div>
            <div className="flex-1 flex flex-col">
              <textarea 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)} 
                className="flex-1 bg-transparent p-6 text-base text-slate-100 outline-none resize-none font-bold italic placeholder-cyan-300" 
                placeholder="Nhập prompt tùy chỉnh hoặc chọn lệnh mẫu..." 
              />
              {selectedCommand === 'ppt' && (
                <div className="p-4 border-t border-slate-700 bg-slate-850 flex gap-4">
                  <button 
                    onClick={() => window.open('https://www.canva.com/create/presentations', '_blank')}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
                  >
                    Liên kết Canva (Tạo PPT nhanh)
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.bing.com/images/create?prompt=Minh họa+giáo+dục+${encodeURIComponent(tenBai || 'bài học')}+môn+${encodeURIComponent(monHoc)}+lớp+${encodeURIComponent(khoiLop)}+đẹp+thẩm+mỹ`, '_blank')}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition"
                  >
                    Minh họa hình ảnh AI cho slide
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preview giữ nguyên như trước */}
        <section className="col-span-6 flex flex-col relative">
          {/* ... phần preview, xuất file ... */}
        </section>
      </main>

      {/* Modal và Trợ lý AI giữ nguyên */}
      {/* ... */}

      <style dangerouslySetInnerHTML={{ __html: `
        /* ... style cũ giữ nguyên ... */
      ` }} />
    </div>
  );
};

const App: React.FC = () => {
  // ... (giữ nguyên phần App component)
};

export default App;