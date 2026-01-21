import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // KHÔI PHỤC ĐỦ 4 MẪU LỆNH THEO YÊU CẦU CỦA THẦY TÙNG
  const promptsMau = [
    { 
      label: "📝 SOẠN BÀI GIẢNG 5512", 
      content: `Trong vai một chuyên gia giáo dục và một giáo viên [môn học] có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Số tiết: [Số tiết]\n• Đối tượng học sinh: [Trung bình / Khá / Yếu / Hỗn hợp]\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.` 
    },
    { 
      label: "🏫 SOẠN GIÁO ÁN (Dự giờ)", 
      content: `Trong vai một giáo viên giỏi cấp tỉnh, hãy soạn GIÁO ÁN CHI TIẾT.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Thời lượng: [Số tiết]\n• Hình thức dạy học: [Trực tiếp / Trực tuyến / Kết hợp]\n\nYêu cầu:\n- Giáo án theo đúng mẫu hành chính\n- Mỗi hoạt động ghi rõ: Mục tiêu, Nội dung, Phương pháp – Kỹ thuật dạy học, Hoạt động của GV, Hoạt động của HS\n- Có tích hợp: Giáo dục đạo đức, Kỹ năng sống, Chuyển đổi số (nếu phù hợp)\nVăn phong chuẩn giáo án, dễ in, dễ nộp.` 
    },
    { 
      label: "📖 SOẠN ĐỀ CƯƠNG ÔN TẬP", 
      content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.` 
    },
    { 
      label: "📊 ĐỀ KIỂM TRA 7791", 
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7791.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Thời gian làm bài: [Số phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh\nĐề phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.` 
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Dùng mã model chuẩn để tránh lỗi 404
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Môn: ${monHoc}, ${khoiLop}.\nYêu cầu:\n${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`❌ THÔNG BÁO LỖI: ${error.message}\n\nThầy Tùng hãy kiểm tra lại trạng thái Model trên Google AI Studio.`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-900/80 rounded-2xl border border-blue-500/30 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg">⚡</div>
            <div>
              <h1 className="text-lg font-black uppercase text-white leading-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center italic">Bình Hòa</p>
            </div>
          </div>
          <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black italic text-sm shadow-xl">Chào mừng quý thầy cô !</div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-md border border-blue-500/20 uppercase">HỆ THỐNG V36.0 PRO</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">⚙️ Thiết lập môn học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg flex justify-between px-5 items-center hover:bg-orange-500 transition-all">
                📝 4 MẪU LỆNH CHUẨN {showPromptMenu ? '▲' : '▼'}
              </button>
              {showPromptMenu && (
                <div className="absolute left-0 w-full mt-2 bg-slate-900 rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden z-[500]">
                  {promptsMau.map((p, i) => (
                    <button key={i} onClick={() => { setCustomPrompt(p.content); setShowPromptMenu(false); }} className="w-full px-5 py-4 text-left text-[11px] font-bold hover:bg-blue-900 border-b border-slate-800 text-slate-300 transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest italic flex justify-between">
              <span>📂 Hồ sơ tài liệu</span>
              <span className="text-white bg-blue-600 px-2 rounded">({selectedFiles.length})</span>
            </h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-900/20 transition-all shrink-0 mb-4 group">
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📎</span>
              <p className="text-[9px] font-black text-slate-500 uppercase italic">Gắn tối thiểu 4 tệp</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
            </div>

            {/* DANH SÁCH FILE HIỂN THỊ ĐẦY ĐỦ TÊN NHƯ THẦY MONG MUỐN */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-slate-800 hover:border-blue-500/30 animate-in slide-in-from-left-2 transition-all">
                  <span className="text-lg">📄</span>
                  <p className="text-[10px] font-black truncate flex-1 text-slate-400 group-hover:text-white">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-900 font-black px-2 hover:text-red-500">✕</button>
                </div>
              ))}
              {selectedFiles.length === 0 && <div className="h-full flex items-center justify-center text-[9px] font-black text-slate-800 uppercase tracking-widest">No Data</div>}
            </div>
          </div>
          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-blue-500 transition-all active:scale-95">
             {loading ? "⚡ ĐANG PHÂN TÍCH DỮ LIỆU..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </div>

        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black uppercase text-blue-500/50 tracking-widest italic">Workspace Nguyễn Thanh Tùng</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase transition-colors tracking-widest">Làm mới nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Chọn 1 trong 4 mẫu lệnh bên trái để bắt đầu..." className="w-full flex-1 bg-transparent p-12 text-lg outline-none resize-none font-medium text-slate-300 leading-relaxed custom-scrollbar placeholder:text-slate-700" />
            <div className="absolute bottom-10 right-10 flex gap-4">
                <button onClick={() => window.open('https://canva.com', '_blank')} className="px-10 py-5 bg-[#8b3dff] text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:scale-105 transition-all flex items-center gap-2">🎨 Canva</button>
                <button onClick={() => {saveAs(new Blob([aiResponse]), "HoSo_ThayTung_V36.docx");}} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all">📥 Xuất file hồ sơ</button>
            </div>
          </div>
        </div>
      </main>

      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-700 transform ${isChatOpen ? 'w-[94vw] md:w-[850px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-[#020617] rounded-[3.5rem] border border-blue-500/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-[80vh] overflow-hidden">
            <div className="p-10 bg-gradient-to-r from-blue-900 to-black text-white flex justify-between items-center border-b border-blue-500/10 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">✨</div>
                  <div>
                    <span className="text-[13px] font-black uppercase tracking-[0.4em] block text-blue-400">Next-Gen Intelligence</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Cấu trúc kịch bản theo chương trình GDPT 2018</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-all text-2xl font-bold border border-slate-700">✕</button>
            </div>
            <div className="p-16 overflow-y-auto text-[19px] leading-[1.9] whitespace-pre-wrap font-medium text-slate-300 flex-1 custom-scrollbar selection:bg-blue-500/30">
                {loading ? "⚡ ĐANG KIẾN TẠO HỒ SƠ SƯ PHẠM TỪ TÀI LIỆU CỦA THẦY..." : aiResponse || "Sẵn sàng."}
            </div>
          </div>
      </div>
    </div>
  );
};

export default App;