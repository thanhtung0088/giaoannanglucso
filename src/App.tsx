import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsSoTiet = ["1", "2", "3", "4", "5", "6"];
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("3");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài]";
    const commonReq = `\n\nYÊU CẦU CỰC KỲ CHI TIẾT: VIẾT HOÀN TOÀN BẰNG TIẾNG VIỆT. Trình bày rõ ràng, đúng chuẩn sư phạm hiện hành.`;
    if (type === '5512') return `Trong vai chuyên gia giáo dục bậc cao, hãy soạn KẾ HOẠCH BÀI DẠY chi tiết theo Công văn 5512 cho môn ${monHoc} ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng ${doiTuongHS}.\nNội dung phải bao gồm:\n- Mục tiêu (Kiến thức, Năng lực, Phẩm chất)\n- Thiết bị dạy học và học liệu\n- Tiến trình chi tiết cho 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng (Mỗi hoạt động nêu rõ: Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện).${commonReq}`;
    if (type === 'ppt') return `Hãy soạn cấu trúc bài giảng điện tử (PowerPoint) cho bài "${bai}" môn ${monHoc} ${khoiLop}.\n- Gợi ý nội dung từng slide (tối thiểu 15 slide)\n- Các hiệu ứng, hình ảnh minh họa cần có\n- Kịch bản lời giảng chi tiết.${commonReq}`;
    if (type === '7991') return `Hãy soạn đề kiểm tra chuẩn 7991 cho bài "${bai}" môn ${monHoc} ${khoiLop}.\n- Thiết lập ma trận đề chi tiết\n- Đề bài (Trắc nghiệm & Tự luận)\n- Đáp án và hướng dẫn chấm.${commonReq}`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Vui lòng cấu hình API Key!");
    setLoading(true);
    setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model Flash với cấu hình output dài tối đa
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: customPrompt + "\nLƯU Ý: HÃY VIẾT CỰC KỲ CHI TIẾT VÀ DÀI, KHÔNG TÓM TẮT." }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
      });
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 100 });
    } catch (e: any) { setAiResponse("Lỗi thực thi: " + e.message); } finally { setLoading(false); }
  };

  const handleExport = (ext: string) => {
    const blob = new Blob([aiResponse], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `SoanGiang_${tenBai || 'TaiLieu'}.${ext}`);
    setShowExportMenu(false);
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl relative z-50">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-xl">
             <span className="text-[10px] text-white font-black text-center uppercase">THCS<br/>BÌNH HÒA</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic tracking-tighter">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden bg-[#0f172a]">
        {/* SIDEBAR TRÁI */}
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline decoration-emerald-800">⚙️ Thiết lập thông số</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-orange-500" placeholder="Tên bài dạy thực tế..." />
            <div className="grid grid-cols-2 gap-2">
              <select value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
                {dsSoTiet.map(s => <option key={s} value={s}>{s} tiết</option>)}
              </select>
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-orange-500 transition-all">📜 LỆNH PROMPT MẪU {showPromptMenu ? '▲' : '▼'}</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 overflow-hidden z-[100] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">📑 SOẠN KHBD 5512</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700">💻 SOẠN BÀI GIẢNG PPT</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white">✍️ SOẠN ĐỀ KIỂM TRA 7991</button>
                </div>
              )}
            </div>
          </div>

          {/* HỒ SƠ TÀI LIỆU MINH CHỨNG (+) [cite: 2026-01-28] */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-5 py-3 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu (+)</div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all mb-3">
                <span className="text-3xl text-emerald-500 font-light">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between items-center group">
                    <span className="truncate w-36 font-bold text-slate-300 italic">📄 {file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 px-1 font-black">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all italic tracking-widest">
            {loading ? "⌛ ĐANG THỰC THI CHI TIẾT..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <div className="col-span-9 grid grid-cols-12 gap-6 h-full">
           {/* THẺ WORKSPACE */}
           <section className="col-span-4 flex flex-col min-h-0">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-5 py-3 bg-[#0f172a] border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace (Lệnh yêu cầu)</div>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none custom-scrollbar leading-relaxed" placeholder="Lệnh sẽ được tạo tự động hoặc nhập tay..." />
             </div>
           </section>

           {/* BẢNG PREVIEW KẾT QUẢ CÓ THANH CUỘN */}
           <section className="col-span-8 flex flex-col min-h-0 relative">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-8 py-4 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic underline decoration-2">Bảng Preview Kết Quả Soạn Giảng</span>
                  <div className="relative">
                    <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-2">
                       ♻️ XUẤT HỒ SƠ {showExportMenu ? '▲' : '▼'}
                    </button>
                    {showExportMenu && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[110] overflow-hidden">
                        <button onClick={() => handleExport('docx')} className="w-full px-4 py-3 text-left text-[10px] font-black text-white hover:bg-blue-600 border-b border-slate-700 transition-colors flex items-center gap-2">📄 FILE WORD (.DOCX)</button>
                        <button onClick={() => handleExport('pdf')} className="w-full px-4 py-3 text-left text-[10px] font-black text-white hover:bg-red-600 border-b border-slate-700 transition-colors flex items-center gap-2">📕 FILE PDF (.PDF)</button>
                        <button onClick={() => handleExport('pptx')} className="w-full px-4 py-3 text-left text-[10px] font-black text-white hover:bg-orange-600 transition-colors flex items-center gap-2">📽️ FILE PPT (.PPTX)</button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* VÙNG HIỂN THỊ VỚI THANH CUỘN DỌC CHUYÊN NGHIỆP */}
                <div className="flex-1 p-10 overflow-y-auto text-xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar selection:bg-emerald-500/30">
                   {loading ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-6 text-orange-400">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-center font-black animate-pulse">HỆ THỐNG ĐANG SOẠN CHI TIẾT...</div>
                     </div>
                   ) : (
                     aiResponse || <div className="text-slate-600 italic text-center mt-20 uppercase text-xs tracking-widest">Sẵn sàng thực thi. Vui lòng nhấn nút "Kích hoạt"</div>
                   )}
                </div>
             </div>
           </section>
        </div>
      </main>
      
      {/* TRỢ LÝ CHAT RIÊNG BIỆT */}
      <div className="fixed bottom-6 right-6 z-[100] cursor-pointer group" onClick={() => setIsAssistantOpen(true)}>
         <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
            <span className="text-3xl">🤖</span>
         </div>
      </div>
    </div>
  );
};

export default App;