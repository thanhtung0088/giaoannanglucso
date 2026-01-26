import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // 1. KHỞI TẠO DỮ LIỆU CẤU TRÚC
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Hoạt động trải nghiệm"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Trung bình", "Khá", "Yếu", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[5]); // Mặc định lớp 6
  const [doiTuong, setDoiTuong] = useState(dsDoiTuong[3]);
  const [soTiet, setSoTiet] = useState("1");
  const [tenBai, setTenBai] = useState("[Tên bài học]");
  
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. ĐỊNH NGHĨA 4 LUỒNG SOẠN THẢO AI
  const menuPrompts = [
    {
      title: "📝 SOẠN KHBD 5512",
      content: `Trong vai một chuyên gia giáo dục và một giáo viên [${monHoc}] có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: [${monHoc}]\n• Lớp: [${khoiLop}]\n• Bài: ${tenBai}\n• Số tiết: [${soTiet}]\n• Đối tượng học sinh: [${doiTuong}]\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động: Khởi động - Hình thành kiến thức - Luyện tập - Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn và cách hỗ trợ\n7. Ghi chú sư phạm.\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.`
    },
    {
      title: "💻 SOẠN SLIDE TRÌNH CHIẾU",
      content: `Hãy thiết kế cấu trúc Slide bài giảng cho bài: ${tenBai} (Môn ${monHoc} - ${khoiLop}).\nYêu cầu:\n- Chia theo từng Slide (Slide 1: Tiêu đề, Slide 2: Mục tiêu...)\n- Gợi ý hình ảnh minh họa cho AI Image Generator.\n- Nội dung ngắn gọn, súc tích để đưa lên Canva/Powerpoint.`
    },
    {
      title: "📚 SOẠN ĐỀ CƯƠNG ÔN TẬP",
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: [${monHoc}]\n• Lớp: [${khoiLop}]\n• Phạm vi: [Giữa kỳ / Cuối kỳ]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm\n2. Công thức/nội dung cần thuộc\n3. Các dạng bài thường gặp và ví dụ\n4. Lưu ý tránh mất điểm.\nTrình bày dạng gạch đầu dòng.`
    },
    {
      title: "✍️ SOẠN ĐỀ KIỂM TRA 7991",
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7991.\n\n• Môn: [${monHoc}]\n• Lớp: [${khoiLop}]\n• Thời gian: [45 phút / 90 phút]\n• Hình thức: [Kết hợp Trắc nghiệm & Tự luận]\n\nYêu cầu:\n1. Ma trận đề (4 mức độ)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án và thang điểm chi tiết\n4. Nhận xét mức độ phân hóa.`
    }
  ];

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key!");
    setLoading(true); setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi hệ thống: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020817] text-slate-200 overflow-hidden flex flex-col font-sans">
      {/* HEADER - Theo phong cách ảnh e4e313 */}
      <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-blue-900/50 px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]">⚡</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">NGUYỄN THANH TÙNG</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bình Hòa</p>
          </div>
        </div>
        <div className="bg-orange-600 px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg">Chào mừng quý thầy cô !</div>
        <div className="text-[10px] font-bold text-blue-500/50 uppercase">Hệ thống V36.0 PRO</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* SIDEBAR TRÁI - THIẾT LẬP */}
        <aside className="col-span-3 space-y-6 flex flex-col">
          <div className="bg-[#1e293b]/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">⚙️ Thiết lập môn học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
               <input type="text" placeholder="Tiết..." value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-black border border-slate-700 rounded-xl p-3 text-xs text-white" />
               <select value={doiTuong} onChange={(e)=>setDoiTuong(e.target.value)} className="bg-black border border-slate-700 rounded-xl p-3 text-xs text-white">
                  {dsDoiTuong.map(d => <option key={d}>{d}</option>)}
               </select>
            </div>
            
            {/* NÚT MẪU LỆNH CHUẨN */}
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-[#f97316] text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                📜 4 MẪU LỆNH CHUẨN ▼
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-blue-500/50 rounded-2xl z-50 overflow-hidden shadow-2xl">
                  {menuPrompts.map((p, i) => (
                    <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="w-full text-left p-4 hover:bg-blue-600 text-[10px] font-black border-b border-slate-800 last:border-0">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* HỒ SƠ TÀI LIỆU */}
          <div className="bg-[#1e293b]/50 p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase">📁 Hồ sơ tài liệu</h2>
              <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full text-white">({selectedFiles.length})</span>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/10 transition-all">
               <span className="text-3xl mb-2">📎</span>
               <p className="text-[10px] text-slate-500 uppercase font-bold">Gắn tối thiểu 4 tệp</p>
               <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            </div>
          </div>

          <button onClick={handleAiAction} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
             🚀 KÍCH HOẠT HỆ THỐNG
          </button>
        </aside>

        {/* WORKSPACE CHÍNH */}
        <section className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative">
            <div className="px-8 py-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black text-blue-500 tracking-widest italic uppercase">Workspace Nguyễn Thanh Tùng</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase">Làm mới nội dung</button>
            </div>
            
            <textarea 
              value={customPrompt} 
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full flex-1 bg-transparent p-10 text-lg text-slate-300 outline-none resize-none leading-relaxed" 
              placeholder="Nhập yêu cầu chi tiết hoặc chọn mẫu lệnh để bắt đầu..."
            />

            {/* BỘ NÚT CHỨC NĂNG DƯỚI WORKSPACE */}
            <div className="absolute bottom-8 right-8 flex gap-3">
               <button className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">🎨 Minh họa AI</button>
               <button onClick={() => window.open('https://www.canva.com', '_blank')} className="px-6 py-3 bg-[#8b5cf6] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">🎨 Canva</button>
               <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_GiaoVien.docx")} className="px-6 py-3 bg-[#10b981] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">♻️ Xuất file hồ sơ</button>
            </div>
          </div>
        </section>
      </main>

      {/* POPUP HIỂN THỊ KẾT QUẢ AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-10">
          <div className="bg-[#0f172a] w-full max-w-5xl h-[85vh] rounded-[3rem] border border-blue-500/30 flex flex-col overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-blue-900/20">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                   <span className="font-black text-white uppercase text-xs tracking-widest">Next-Gen Intelligence: Cấu trúc kịch bản GDPT 2018</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-red-600 transition-all">✕</button>
             </div>
             <div className="p-16 overflow-y-auto text-xl leading-relaxed text-slate-300 whitespace-pre-wrap">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                     <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-xs font-black text-blue-500 animate-pulse">HỆ THỐNG ĐANG SOẠN THẢO CHUYÊN SÂU...</p>
                  </div>
                ) : aiResponse}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;