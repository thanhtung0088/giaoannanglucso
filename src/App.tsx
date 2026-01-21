import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
  // 1. Cấu hình danh sách dữ liệu
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // 2. State quản lý giao diện và dữ liệu
  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Hiệu ứng pháo hoa khi vào trang
  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#1e40af', '#fbbf24'] });
  }, []);

  // 4. Hàm xử lý LOGIC AI (Kích hoạt nút bấm)
  const handleSoanBaiAI = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      alert("Lỗi: Chưa tìm thấy API Key. Hãy kiểm tra lại cấu hình Vercel!");
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Bạn là một chuyên gia giáo dục. Hãy soạn một khung kế hoạch bài dạy (giáo án) phát triển năng lực số cho môn ${monHoc}, khối ${khoiLop}. Yêu cầu nội dung sáng tạo, hiện đại và bám sát chương trình GDPT 2018.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiResponse(response.text());
      setIsChatOpen(true); // Mở khung chat để hiện kết quả
    } catch (error) {
      console.error("Lỗi gọi AI:", error);
      alert("Có lỗi xảy ra khi kết nối với quân sư AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSchoolLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col overflow-hidden relative">
      
      {/* HEADER */}
      <div className="bg-[#1e40af] text-white py-1.5 px-8 flex justify-between items-center shadow-md shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1 rounded-lg text-xs">🎓</div>
          <div>
            <h2 className="text-[9px] font-black uppercase leading-none">Soạn giáo án năng lực số</h2>
            <p className="text-[7px] font-bold opacity-60 uppercase">Nguyễn Thanh Tùng</p>
          </div>
        </div>
        <div className="bg-yellow-400 text-blue-900 px-3 py-0.5 rounded-full text-[8px] font-black uppercase">
          {loading ? "Đang suy nghĩ..." : "Gemini 2.5 Flash Online"}
        </div>
      </div>

      {/* BANNER */}
      <div className="bg-[#1e40af] h-20 flex items-center px-12 relative overflow-hidden border-b-2 border-yellow-400 shadow-lg shrink-0">
        <div onClick={() => fileInputRef.current?.click()} className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-white/40 shadow-xl cursor-pointer overflow-hidden shrink-0">
          {schoolLogo ? <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-lg">🏫</span>}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
        </div>
        <div className="ml-6 z-10 flex-1">
          <h1 className="text-xl font-black text-yellow-400 italic uppercase leading-none">Chào mừng quý thầy cô !</h1>
          <p className="text-white text-[9px] font-bold tracking-[0.2em] opacity-80 uppercase mt-1">THCS Bình Hòa - Năm mới thắng lợi 2026</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto w-full flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-300/50 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-lg border border-white/40 flex-1 flex flex-col justify-center">
            <h3 className="text-blue-900 font-black text-[10px] uppercase border-l-4 border-blue-700 pl-3 mb-6">Thông tin bài dạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase">Môn học (CT 2018)</label>
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full border-b border-slate-400/50 py-1 font-bold text-xs outline-none bg-transparent">
                  {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase">Khối lớp thực hiện</label>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full border-b border-slate-400/50 py-1 font-bold text-xs outline-none bg-transparent">
                  {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSoanBaiAI}
            disabled={loading}
            className={`w-full ${loading ? 'bg-slate-500' : 'bg-[#1e40af] hover:bg-blue-900'} text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-[0.3em] text-[10px] transition-all shrink-0`}
          >
            {loading ? "● Đang soạn bài..." : "▲ Bắt đầu soạn bài với Gemini 2.5"}
          </button>
        </div>

        {/* SIDEBAR RIGHT */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="bg-[#1e3a8a] p-5 rounded-[1.5rem] text-white shadow-xl border border-white/10 flex-1">
             <h4 className="font-black uppercase text-[10px] mb-4 text-yellow-400 border-b border-white/10 pb-2">Hướng dẫn nhanh</h4>
             <p className="text-[9px] font-bold uppercase opacity-90 italic">Bấm nút xanh để kích hoạt quân sư AI soạn giáo án tự động theo môn đã chọn.</p>
          </div>
        </div>
      </div>

      {/* CHATBOX AI (Nơi hiển thị kết quả) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-12 h-12 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white transform hover:scale-110 transition-all">
          <span className="text-xl">🤖</span>
        </button>
        {isChatOpen && (
          <div className="absolute bottom-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="bg-blue-700 p-2 text-white text-[8px] font-black uppercase flex justify-between">
               <span>Quân sư Gemini 2.5</span>
               <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="p-4 overflow-y-auto text-[11px] leading-relaxed whitespace-pre-wrap">
               {aiResponse || "Chào mừng thầy cô! Hãy chọn môn học và nhấn nút soạn bài."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;