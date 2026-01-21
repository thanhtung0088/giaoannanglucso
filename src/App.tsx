import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const promptsMau = [
    { label: "📝 SOẠN BÀI GIẢNG 5512", content: `Trong vai một chuyên gia giáo dục và một giáo viên [môn học] có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Số tiết: [Số tiết]\n• Đối tượng học sinh: [Trung bình / Khá / Yếu / Hỗn hợp]\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.` },
    { label: "🏫 SOẠN GIÁO ÁN (Dự giờ)", content: `Trong vai một giáo viên giỏi cấp tỉnh, hãy soạn GIÁO ÁN CHI TIẾT.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Thời lượng: [Số tiết]\n• Hình thức dạy học: [Trực tiếp / Trực tuyến / Kết hợp]\n\nYêu cầu:\n- Giáo án theo đúng mẫu hành chính\n- Mỗi hoạt động ghi rõ: Mục tiêu, Nội dung, Phương pháp – Kỹ thuật dạy học, Hoạt động của GV, Hoạt động của HS\n- Có tích hợp: Giáo dục đạo đức, Kỹ năng sống, Chuyển đổi số (nếu phù hợp)\nVăn phong chuẩn giáo án, dễ in, dễ nộp.` },
    { label: "📖 SOẠN ĐỀ CƯƠNG ÔN TẬP", content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.` },
    { label: "📊 ĐỀ KIỂM TRA 7791", content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7791.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Thời gian làm bài: [Số phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh\nĐề phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.` }
  ];

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const tailieuRef = useRef<HTMLInputElement>(null);

  // Hàm xử lý khi chọn file mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Cập nhật danh sách file (cho phép nạp thêm thay vì ghi đè hoàn toàn)
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy Tùng vui lòng dán API Key vào Vercel!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model mới nhất thầy vừa phát hiện
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Áp dụng chuyên môn cho: ${monHoc}, ${khoiLop}.\nYêu cầu:\n${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`⚠️ Lỗi: ${error.message}\n(Lưu ý: Nếu Model 3.0 chưa mở tại VN, thầy hãy đổi về 'gemini-1.5-pro' trong mã nguồn)`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-800/60 rounded-2xl border border-slate-700 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">⚡</div>
            <div>
              <h1 className="text-lg font-black uppercase text-white leading-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center">Bình Hòa</p>
            </div>
          </div>
          <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black italic text-sm animate-pulse">Chào mừng quý thầy cô !</div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-md border border-blue-500/20 uppercase tracking-widest">Version 34.0 Next-Gen</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* CỘT TRÁI - ĐÃ FIX HIỂN THỊ FILE */}
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-5">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">⚙️ Cấu hình môn học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:ring-2 ring-blue-500 transition-all">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:ring-2 ring-blue-500 transition-all">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg flex justify-between px-5 items-center hover:bg-orange-500 transition-all">
                📝 Lệnh Prompt mẫu {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute left-0 w-full mt-2 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-[500] animate-in slide-in-from-top-2">
                  {promptsMau.map((p, i) => (
                    <button key={i} onClick={() => { setCustomPrompt(p.content); setShowPromptMenu(false); }} className="w-full px-5 py-4 text-left text-[11px] font-bold hover:bg-blue-600 border-b border-slate-700 text-slate-200 transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FIX LỖI ĐẾM FILE VÀ HIỂN THỊ TÊN FILE */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest italic flex justify-between">
              <span>📂 Hồ sơ tài liệu</span>
              {/* Đếm chính xác số lượng file trong mảng selectedFiles */}
              <span className="text-white">({selectedFiles.length})</span>
            </h2>
            
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-all shrink-0 mb-4">
              <span className="text-3xl mb-1">📎</span>
              <p className="text-[9px] font-black text-slate-500 uppercase">Bấm để gắn tệp</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
            </div>

            {/* DANH SÁCH TÊN FILE - SẼ HIỆN Ở ĐÂY */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group animate-in fade-in slide-in-from-left-2">
                  <span className="text-lg">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate text-slate-300 group-hover:text-white">{file.name}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-500 font-black px-2 hover:scale-125 transition-transform">✕</button>
                </div>
              ))}
              {selectedFiles.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-[10px] uppercase font-bold tracking-widest">Trống</div>
              )}
            </div>
          </div>
          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-blue-500 transition-all border-t border-white/10">
             {loading ? "🤖 AI ĐANG SOẠN THẢO..." : "🚀 KÍCH HOẠT GEMINI 3.0"}
          </button>
        </div>

        {/* CỘT PHẢI - KHÔNG GIAN LÀM VIỆC */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-800/40 backdrop-blur-3xl rounded-[2rem] border border-slate-700 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/40">
              <div className="flex gap-4">
                 <button className="px-8 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Soạn bài dạy</button>
              </div>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors tracking-widest">Làm mới nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Nhập yêu cầu chuyên môn hoặc chọn mẫu Prompt bên trái..." className="w-full flex-1 bg-transparent p-12 text-lg outline-none resize-none font-medium text-slate-300 leading-relaxed custom-scrollbar placeholder:text-slate-700" />
            <div className="absolute bottom-10 right-10 flex gap-4">
                <button onClick={() => window.open('https://canva.com', '_blank')} className="px-10 py-5 bg-[#8b3dff] text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2">🎨 Canva</button>
                <button onClick={() => {saveAs(new Blob([aiResponse]), "HoSoGiaoDuc_ThayTung.docx");}} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all flex items-center gap-2">📥 Xuất Hồ Sơ Số</button>
            </div>
          </div>
        </div>
      </main>

      {/* KẾT QUẢ AI */}
      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-700 transform ${isChatOpen ? 'w-[92vw] md:w-[800px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-slate-900 rounded-[3rem] border border-slate-700 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-[78vh] overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">✨</div>
                  <div>
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] block">Kết quả biên soạn</span>
                    <span className="text-[9px] text-blue-200 font-bold uppercase tracking-widest italic opacity-70">Sử dụng hệ thống Gemini Next-Gen</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center hover:bg-red-500 transition-all text-2xl font-bold">✕</button>
            </div>
            <div className="p-14 overflow-y-auto text-[18px] leading-[1.85] whitespace-pre-wrap font-medium text-slate-300 flex-1 custom-scrollbar selection:bg-blue-600/40">
                {loading ? "🤖 AI đang tổng hợp tài liệu của thầy và kiến tạo kịch bản sư phạm..." : aiResponse || "Sẵn sàng khởi tạo."}
            </div>
          </div>
      </div>
    </div>
  );
};

export default App;