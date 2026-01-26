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
      label: "📊 ĐỀ KIỂM TRA 7791", 
      content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7791.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Thời gian làm bài: [Số phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\nĐề phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.` 
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
    if (!apiKey) return alert("Thầy hãy thiết lập VITE_GEMINI_API_KEY trên Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // CẬP NHẬT MODEL 2.5 FLASH THEO TÀI LIỆU MỚI NHẤT CỦA THẦY TÙNG
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
      
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Hệ thống giáo dục V36.0 PRO - GV: Nguyễn Thanh Tùng.\n Môn ${monHoc}, ${khoiLop}.\nYêu cầu chuyên môn:\n${customPrompt}`;
      
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`❌ THÔNG BÁO LỖI: ${error.message}\n\nThầy hãy kiểm tra xem Model gemini-2.5-flash đã được bật trong Google AI Studio chưa.`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { 
      const reader = new FileReader(); 
      reader.onload = () => r((reader.result as string).split(',')[1]); 
      reader.readAsDataURL(file); 
    });
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
          <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black italic text-sm shadow-xl">Hệ thống Gemini 2.5 Flash</div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-md border border-blue-500/20 uppercase">V36.0 PRO EDITION</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">⚙️ Cấu hình chuyên môn</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">
               📝 MẪU LỆNH GEMINI 2.5
            </button>
            {showPromptMenu && (
                <div className="absolute bg-slate-900 border border-slate-700 p-2 rounded-xl z-50">
                    {promptsMau.map((p, i) => (
                        <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="block w-full text-left p-2 hover:bg-blue-600 text-[10px]">{p.label}</button>
                    ))}
                </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
             <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest">📂 Tài liệu sư phạm ({selectedFiles.length})</h2>
             <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-900/20 mb-4">
                <span className="text-2xl">📎</span>
                <p className="text-[9px] font-black text-slate-500 uppercase">Đính kèm minh chứng</p>
                <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedFiles.map((f, i) => <div key={i} className="text-[10px] p-2 bg-black/40 rounded border border-slate-800 italic">{f.name}</div>)}
             </div>
          </div>
          
          <button onClick={handleAiAction} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">
             {loading ? "⚡ ĐANG KÍCH HOẠT 2.5 FLASH..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </div>

        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-widest">Workspace Nguyễn Thanh Tùng - Bình Hòa</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] text-slate-600 uppercase hover:text-red-500 transition-colors">Làm mới Workspace</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-lg outline-none resize-none text-slate-300 font-medium leading-relaxed" placeholder="Dán yêu cầu hoặc chọn mẫu lệnh chuẩn 5512/7791 tại đây..." />
            <div className="absolute bottom-10 right-10 flex gap-4">
                <button onClick={() => saveAs(new Blob([aiResponse]), "HoSo_V36_ThayTung.docx")} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all">📥 Xuất hồ sơ Microsoft Word</button>
            </div>
          </div>
        </div>
      </main>

      {/* Kết quả AI hiển thị nguyên khối */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-12">
            <div className="bg-[#020617] w-full max-w-5xl h-[85vh] rounded-[3.5rem] border border-blue-500/40 flex flex-col overflow-hidden shadow-[0_0_150px_rgba(37,99,235,0.3)]">
                <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-transparent">
                    <div className="flex flex-col">
                        <span className="font-black text-blue-400 tracking-[0.3em] uppercase text-xs">Gemini 2.5 Flash Response</span>
                        <span className="text-[9px] text-slate-500 uppercase italic">Xử lý dữ liệu bởi hệ thống V36.0 PRO</span>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-slate-800 text-white hover:bg-red-600 transition-all flex items-center justify-center text-xl font-bold border border-slate-700">✕</button>
                </div>
                <div className="p-16 overflow-y-auto text-xl leading-relaxed whitespace-pre-wrap flex-1 custom-scrollbar text-slate-300 selection:bg-blue-500/40">
                    {loading ? "Hệ thống đang suy luận thông minh..." : aiResponse}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;