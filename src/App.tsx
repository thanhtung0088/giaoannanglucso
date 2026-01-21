import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const frame = () => {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#1e40af', '#fbbf24'] });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1e40af', '#fbbf24'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

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
      
      {/* 1. THANH TOP NAVIGATION */}
      <div className="bg-[#1e40af] text-white py-1.5 px-8 flex justify-between items-center shadow-md shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1 rounded-lg text-xs">🎓</div>
          <div>
            <h2 className="text-[9px] font-black uppercase leading-none">Soạn giáo án năng lực số</h2>
            <p className="text-[7px] font-bold opacity-60 uppercase">Nguyễn Thanh Tùng</p>
          </div>
        </div>
        <div className="bg-yellow-400 text-blue-900 px-3 py-0.5 rounded-full text-[8px] font-black uppercase">
          Gemini 2.5 Flash
        </div>
      </div>

      {/* 2. BANNER THU GỌN */}
      <div className="bg-[#1e40af] h-20 flex items-center px-12 relative overflow-hidden border-b-2 border-yellow-400 shadow-lg shrink-0">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-white/40 shadow-xl cursor-pointer hover:scale-105 transition-all overflow-hidden shrink-0"
        >
          {schoolLogo ? (
            <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-lg">🏫</span>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
        </div>
        
        <div className="ml-6 z-10 flex-1">
          <h1 className="text-xl font-black text-yellow-400 italic uppercase leading-none">Chào mừng quý thầy cô !</h1>
          <p className="text-white text-[9px] font-bold tracking-[0.2em] opacity-80 uppercase mt-1">THCS Bình Hòa - Năm mới thắng lợi 2026</p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-white text-center">
            <p className="text-base font-black text-yellow-400 italic leading-none">2026</p>
            <p className="text-[6px] font-bold uppercase opacity-50">Năm mới thắng lợi</p>
        </div>
      </div>

      {/* 3. VÙNG NỘI DUNG CHÍNH */}
      <div className="max-w-6xl mx-auto w-full flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        
        {/* Cột trái: Form nhập liệu */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-300/50 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-lg border border-white/40 flex-1 flex flex-col justify-center">
            <h3 className="text-blue-900 font-black text-[10px] uppercase border-l-4 border-blue-700 pl-3 mb-6">Thông tin bài dạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase">Môn học (CT 2018)</label>
                <select className="w-full border-b border-slate-400/50 py-1 font-bold text-xs outline-none bg-transparent">
                  {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase">Khối lớp thực hiện</label>
                <select className="w-full border-b border-slate-400/50 py-1 font-bold text-xs outline-none bg-transparent">
                  {dsKhoi.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-300/50 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-lg border border-white/40 flex-1 flex flex-col justify-center">
            <h3 className="text-blue-900 font-black text-[10px] uppercase border-l-4 border-blue-700 pl-3 mb-6">Tài liệu đính kèm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-dashed border-slate-400 rounded-xl p-5 text-center hover:bg-white/30 transition-all cursor-pointer flex flex-col justify-center items-center">
                <p className="text-[9px] font-black text-slate-700 uppercase">Tải lên giáo án (.docx)</p>
                <p className="text-[7px] text-slate-500 font-bold uppercase mt-1 italic">Bắt buộc</p>
              </div>
              <div className="border border-dashed border-slate-400 rounded-xl p-5 text-center hover:bg-white/30 transition-all cursor-pointer flex flex-col justify-center items-center">
                <p className="text-[9px] font-black text-slate-700 uppercase">Phân phối chương trình</p>
                <p className="text-[7px] text-slate-500 font-bold uppercase mt-1 italic">Tùy chọn</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#1e40af] hover:bg-blue-900 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-[0.3em] text-[10px] transition-all shrink-0">
             ▲ Bắt đầu soạn bài với Gemini 2.5
          </button>
        </div>

        {/* Cột phải: Hướng dẫn & Miền năng lực */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Thẻ Hướng dẫn nhanh */}
          <div className="bg-[#1e3a8a] p-5 rounded-[1.5rem] text-white shadow-xl border border-white/10 flex-1 flex flex-col">
            <h4 className="font-black uppercase text-[10px] mb-4 text-yellow-400 border-b border-white/10 pb-2">Hướng dẫn nhanh</h4>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {[
                {t: "Chọn môn học và khối lớp.", icon: "1"},
                {t: "Bắt buộc: Tải lên file giáo án (.docx hoặc .pdf).", icon: "2"},
                {t: "Tùy chọn: Tải file PPCT nếu muốn AI tham khảo năng lực cụ thể.", icon: "3"}
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="bg-blue-600 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 border border-white/20 shadow-md">{item.icon}</span>
                  <p className="text-[9px] font-bold uppercase opacity-90 leading-tight">{item.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Thẻ Miền năng lực số */}
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <h4 className="text-blue-900 font-black uppercase text-[10px] mb-4 border-b border-slate-100 pb-2 tracking-wide">Miền năng lực số</h4>
            <div className="space-y-3 flex-1 flex flex-col justify-center overflow-y-auto pr-1">
              {[
                "Khai thác dữ liệu và thông tin",
                "Giao tiếp và Hợp tác",
                "Sáng tạo nội dung số",
                "An toàn số",
                "Giải quyết vấn đề",
                "Ứng dụng AI"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <span className="text-blue-500 text-xs shrink-0 group-hover:scale-125 transition-transform">●</span>
                  <p className="text-[9px] font-bold text-slate-700 uppercase leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHATBOX AI */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-12 h-12 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white transform hover:scale-110 transition-all">
          <span className="text-xl">🤖</span>
        </button>
        {isChatOpen && (
          <div className="absolute bottom-14 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-blue-700 p-2 text-white text-[8px] font-black uppercase flex justify-between">
               <span>Quân sư Gemini 2.5</span>
               <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="h-32 p-3 bg-slate-50 text-[9px] font-bold italic text-slate-500 uppercase leading-relaxed">
               Chào mừng năm mới 2026! Quân sư đã sẵn sàng hỗ trợ thầy cô.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;