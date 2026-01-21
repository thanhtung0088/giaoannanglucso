import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const tailieuRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    // Trim() để loại bỏ khoảng trắng dư thừa nếu có
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        return alert("Lỗi: Thầy chưa dán API Key vào môi trường (Vercel/env)!");
    }

    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Áp dụng cho Môn: ${monHoc}, ${khoiLop}.\n\nYêu cầu:\n${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`⚠️ Lỗi: ${error.message}\n\nThầy Tùng lưu ý: Nếu báo 'API key not valid', hãy chắc chắn thầy đã REDEPLOY trên Vercel sau khi dán Key mới nhé.`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#5a9ad4] text-slate-800 font-sans overflow-hidden flex flex-col p-3">
      <header className="h-20 mb-3 px-8 flex justify-between items-center bg-white/95 rounded-xl border border-white shadow-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-black shadow-md">⚡</div>
            <div>
              <h1 className="text-md font-black uppercase text-blue-900 leading-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[9px] font-bold text-blue-500 uppercase">Trường THCS Bình Hòa</p>
            </div>
          </div>
          <h2 className="text-4xl font-black italic text-orange-600 drop-shadow-sm">Chào mừng quý thầy cô !</h2>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-md tracking-tighter">v28.0 - HỆ THỐNG CHUẨN</div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/95 p-5 rounded-xl border border-white shadow-lg space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-600">⚙️ Thiết lập chuyên môn</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-500 text-white rounded-lg font-black text-[10px] uppercase shadow-md flex justify-between px-4 items-center">
                📝 Lệnh Prompt mẫu <span>{showPromptMenu ? '▲' : '▼'}</span>
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden z-[200]">
                  {promptsMau.map((p, i) => (
                    <button key={i} onClick={() => { setCustomPrompt(p.content); setShowPromptMenu(false); }} className="w-full px-4 py-3 text-left text-[10px] font-bold hover:bg-blue-50 border-b border-slate-50 last:border-0 text-slate-700">
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/95 p-5 rounded-xl border border-white shadow-lg flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest text-center italic">📂 Tài liệu tham khảo</h2>
            <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 shrink-0">
              <span className="text-2xl mb-1">📎</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Tải tệp đính kèm</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-white shadow-sm animate-in fade-in">
                  <span className="text-xs">📄</span>
                  <p className="text-[9px] font-bold truncate flex-1 text-blue-900">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 font-bold px-1 hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all">🚀 Kích hoạt biên soạn</button>
        </div>

        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/95 backdrop-blur-3xl rounded-xl border border-white flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-widest">Trợ lý giáo dục Gemini 2.0 Lite</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Xóa trắng nội dung</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} placeholder="Chọn mẫu Prompt bên trái..." className="w-full flex-1 bg-transparent p-10 text-md outline-none resize-none font-medium text-slate-700 leading-relaxed custom-scrollbar" />
            <div className="absolute bottom-6 right-6 flex gap-3">
                <button onClick={() => window.open('https://canva.com', '_blank')} className="px-8 py-4 bg-[#8b3dff] text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2">🎨 Gợi ý Canva</button>
                <button onClick={() => {saveAs(new Blob([aiResponse]), "TaiLieuSoanThao.docx");}} className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-500 transition-all">📥 Xuất Word</button>
            </div>
          </div>
        </div>
      </main>

      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-500 transform ${isChatOpen ? 'w-[90vw] md:w-[650px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
          <div className="bg-white rounded-2xl border border-white shadow-2xl flex flex-col h-[70vh] overflow-hidden">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center shadow-lg">
                <span className="text-[11px] font-black uppercase tracking-widest italic">Kết quả AI ({loading ? "Đang soạn..." : "Hoàn tất"})</span>
                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 font-black text-xs transition-all">✕</button>
            </div>
            <div className="p-10 overflow-y-auto text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-slate-700 flex-1 bg-slate-50/30 custom-scrollbar">
                {loading ? "🤖 AI đang phân tích dữ liệu và soạn thảo kịch bản chuyên sâu..." : aiResponse || "Vui lòng nhập lệnh soạn bài."}
            </div>
          </div>
      </div>
    </div>
  );
};

export default App;