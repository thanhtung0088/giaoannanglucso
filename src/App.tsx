import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [tabHienTai, setTabHienTai] = useState("GIAO_AN"); 
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Cập nhật state để chứa nhiều file
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const tailieuRef = useRef<HTMLInputElement>(null);

  const getPromptMau = () => `Đóng vai chuyên gia, soạn [${tabHienTai}] bài [Tên bài dạy], [Số tiết] tiết, môn ${monHoc} khối ${khoiLop}. Yêu cầu: Chuẩn 5512/7991, tích hợp năng lực số 2026.`;

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy cần cấu hình API Key!");

    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("🤖 Đang kết nối Gemini 2.5 Flash... Hệ thống đang phân tích các tệp đính kèm.");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Xử lý tất cả các file đã chọn
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      
      const result = await model.generateContent([
        customPrompt || getPromptMau(),
        ...fileParts
      ]);
      
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 } });
    } catch (error: any) {
      if (error.message.includes("429")) {
        setAiResponse("⚠️ HẾT HẠN MỨC: Thầy vui lòng đợi 60 giây rồi nhấn lại nhé!");
      } else {
        setAiResponse(`❌ LỖI: ${error.message}`);
      }
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4); // Giới hạn tối đa 4 file
      setSelectedFiles(filesArray);
    }
  };

  return (
    <div className="h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-blue-500 selection:text-white overflow-hidden flex flex-col">
      
      {/* HEADER GỌN NHẸ */}
      <header className="py-3 px-8 flex justify-between items-center bg-white border-b border-slate-200 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-md font-black uppercase italic text-blue-900 tracking-tight">Quân Sư 2.5 Flash</h1>
            <p className="text-[7px] font-bold opacity-50 uppercase tracking-[0.3em]">Nguyễn Thanh Tùng • v10.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-black uppercase text-blue-600 tracking-tighter">Hệ thống tối ưu Desktop</span>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* PANEL TRÁI: ĐIỀU KHIỂN (GỌN LẠI) */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Thiết lập nhanh
            </h2>
            
            <div className="space-y-3">
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20">
                  {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20">
                  {dsKhoi.map(k => <option key={k}>{k}</option>)}
                </select>
            </div>

            <button 
              onClick={() => setCustomPrompt(getPromptMau())} 
              className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl font-black text-[9px] uppercase shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              📝 Lệnh Prompt mẫu
            </button>
          </div>

          {/* KHU VỰC ĐÍNH KÈM 4 FILE */}
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex-1 flex flex-col">
            <h2 className="text-[9px] font-black uppercase text-blue-600 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Tài liệu ({selectedFiles.length}/4)
            </h2>
            <div 
              onClick={() => tailieuRef.current?.click()} 
              className="py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all mb-3"
            >
              <span className="text-xl mb-1">➕</span>
              <p className="text-[8px] font-black uppercase opacity-40">Tải tối đa 4 file</p>
              <input type="file" ref={tailieuRef} className="hidden" multiple onChange={handleFileChange} />
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[150px] pr-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-left-2">
                  <span className="text-[10px]">📄</span>
                  <p className="text-[8px] font-bold truncate flex-1">{file.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)) }} className="text-red-400 hover:text-red-600 text-[10px]">✕</button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAiAction} 
            disabled={loading} 
            className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-300 text-slate-500' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
          >
            {loading ? "Đang xử lý..." : "🚀 Kích hoạt AI"}
          </button>
        </div>

        {/* PANEL PHẢI: SOẠN THẢO (RỘNG HƠN) */}
        <div className="col-span-9 flex flex-col gap-4 overflow-hidden">
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
              <button 
                key={id} 
                onClick={() => setTabHienTai(id)} 
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${tabHienTai === id ? 'bg-blue-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {id.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 flex flex-col flex-1 shadow-sm overflow-hidden relative">
            <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
               <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Không gian làm việc chuyên gia</span>
               <div className="flex gap-2">
                <button onClick={() => setCustomPrompt("")} className="text-[8px] font-black text-slate-400 hover:text-red-500 uppercase px-3 py-1">Làm mới</button>
               </div>
            </div>
            <textarea 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Nội dung yêu cầu từ Lệnh Prompt mẫu sẽ hiện ở đây..."
                className="w-full flex-1 bg-transparent p-8 text-[13px] leading-relaxed outline-none resize-none font-medium text-slate-700"
            />
            
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button 
                onClick={() => { navigator.clipboard.writeText(customPrompt); alert("Đã copy lệnh!"); }}
                className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-[10px]" title="Copy lệnh"
              >
                📋
              </button>
              <button 
                onClick={handleAiAction}
                className="px-6 py-3 bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase shadow-lg hover:bg-blue-800 transition-all"
              >
                Chạy ngay
              </button>
            </div>
          </div>

          <div className="flex justify-end">
              <button 
                onClick={() => saveAs(new Blob([aiResponse]), "Soan_Bai_2026.docx")} 
                className="px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
              >
                📥 Xuất File Word chuẩn hóa
              </button>
          </div>
        </div>
      </main>

      {/* KẾT QUẢ AI (FLOAT) */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${isChatOpen ? 'w-[90vw] md:w-[600px] opacity-100 translate-y-0 scale-100' : 'w-0 opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
          <div className="bg-white rounded-[2.5rem] border border-blue-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col h-[70vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-700 rounded-t-[2.5rem] text-white">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">🤖</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Sản phẩm giáo dục số</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 transition-all">✕</button>
            </div>
            <div className="p-8 overflow-y-auto text-[13px] leading-relaxed whitespace-pre-wrap font-medium text-slate-700 bg-blue-50/30">
                {aiResponse || "Mời thầy sử dụng 'Lệnh Prompt mẫu' để bắt đầu."}
            </div>
          </div>
      </div>

      {!isChatOpen && (
          <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-90 transition-all z-[101]">🤖</button>
      )}
    </div>
  );
};

export default App;