import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // BỘ SIÊU MẪU LỆNH NĂNG LỰC SỐ
  const promptsMau = [
    { 
      label: "🚀 GIÁO ÁN NĂNG LỰC SỐ 4.0", 
      content: `[VAI TRÒ]: Chuyên gia giáo dục số và giáo viên giỏi 20 năm kinh nghiệm.\n[NHIỆM VỤ]: Soạn giáo án bài [Tên bài] - Lớp [Số lớp] theo hướng phát triển NĂNG LỰC SỐ.\n[CẤU TRÚC]:\n1. Mục tiêu: Kiến thức + 5 thành phần năng lực số (Giao tiếp số, Giải quyết vấn đề số...).\n2. Thiết bị dạy học: Ưu tiên các phần mềm AI, mô phỏng, học liệu số.\n3. Tiến trình (5512): Khởi động (Game/Quiz), Hình thành kiến thức (Khai thác tài nguyên mạng), Luyện tập (Sản phẩm số), Vận dụng.\n4. Đánh giá: Công cụ đánh giá trực tuyến.\nTrình bày cực kỳ chi tiết, hiện đại.` 
    },
    { 
      label: "🧪 KỊCH BẢN DẠY HỌC TƯƠNG TÁC", 
      content: `Hãy thiết kế kịch bản giảng dạy bài [Tên bài] sao cho học sinh là trung tâm, sử dụng phương pháp Trạm (Stations) hoặc Lớp học đảo ngược (Flipped Classroom). Yêu cầu AI gợi ý các câu hỏi kích thích tư duy phản biện và các hoạt động thực hành số hóa.` 
    },
    { 
      label: "📝 ĐỀ KIỂM TRA ĐÁNH GIÁ NĂNG LỰC", 
      content: `Soạn ma trận và đề kiểm tra bài [Tên bài] theo Thông tư 22. Đề bao gồm 70% trắc nghiệm khách quan và 30% tự luận vận dụng thực tiễn. Có đáp án và hướng dẫn chấm chi tiết.` 
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

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra lại API Key trên Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng gemini-2.0-flash để đảm bảo không lỗi 404
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      
      const fileParts = await Promise.all(selectedFiles.map(async file => {
        const base64 = await new Promise((r) => { 
          const reader = new FileReader(); 
          reader.onload = () => r((reader.result as string).split(',')[1]); 
          reader.readAsDataURL(file); 
        });
        return { inlineData: { data: base64 as string, mimeType: file.type } };
      }));

      const result = await model.generateContent([
        `Hệ thống Soạn Giáo Án Năng Lực Số - GV: Nguyễn Thanh Tùng.\n Môn ${monHoc}, ${khoiLop}.\n${customPrompt}`, 
        ...fileParts
      ]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`❌ LỖI KẾT NỐI: ${error.message}\nThầy Tùng hãy kiểm tra lại API Key thế hệ mới.`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      {/* Header */}
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-900/80 rounded-2xl border border-blue-500/30 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg">⚡</div>
            <div>
              <h1 className="text-lg font-black uppercase text-white leading-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center italic">Năng Lực Số v36.0</p>
            </div>
          </div>
          <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black italic text-sm shadow-xl animate-pulse">Gemini 2.5 Flash Active</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">⚙️ Thiết lập bài học</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="relative">
                <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-orange-500 transition-all">
                    📝 CHỌN SIÊU MẪU LỆNH
                </button>
                {showPromptMenu && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-blue-500/50 p-2 rounded-2xl z-50 shadow-2xl">
                        {promptsMau.map((p, i) => (
                            <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="block w-full text-left p-3 hover:bg-blue-600 rounded-lg text-[10px] font-bold text-slate-300 border-b border-slate-800 last:border-0">{p.label}</button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
             <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-widest">📂 Học liệu đính kèm ({selectedFiles.length})</h2>
             <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/10 mb-4">
                <span className="text-2xl mb-1">📎</span>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Tải lên SGK/Tài liệu mẫu</p>
                <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {selectedFiles.map((f, i) => <div key={i} className="text-[9px] p-2 bg-black/40 rounded border border-slate-800 italic truncate uppercase font-bold text-slate-500">{f.name}</div>)}
             </div>
          </div>
          
          <button onClick={handleAiAction} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">
             {loading ? "⚡ ĐANG SOẠN THẢO SỐ..." : "🚀 KÍCH HOẠT GEMINI 2.5"}
          </button>
        </div>

        {/* Workspace */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-[0.2em]">Workspace: Nguyễn Thanh Tùng - Năng Lực Số</span>
            </div>
            <textarea 
                value={customPrompt} 
                onChange={(e)=>setCustomPrompt(e.target.value)} 
                className="w-full flex-1 bg-transparent p-12 text-xl outline-none resize-none text-slate-300 font-medium leading-relaxed custom-scrollbar" 
                placeholder="Ví dụ: Soạn bài 1: Lợi ích của mạng máy tính..." 
            />
            <div className="absolute bottom-10 right-10 flex gap-4">
                <button onClick={() => saveAs(new Blob([aiResponse]), "GiaoAn_Digital_ThayTung.docx")} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all">📥 TẢI GIÁO ÁN WORD</button>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-up hiển thị kết quả */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-12">
            <div className="bg-[#020617] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/40 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <span className="font-black text-blue-400 tracking-widest uppercase text-xs">Kết quả soạn thảo từ Gemini 2.5 Flash</span>
                    <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-slate-800 text-white hover:bg-red-600 transition-all flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="p-20 overflow-y-auto text-2xl leading-[1.8] whitespace-pre-wrap flex-1 custom-scrollbar text-slate-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-blue-500 animate-pulse uppercase">Hệ thống đang thiết kế giáo án số...</p>
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