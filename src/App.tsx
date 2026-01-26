import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const tailieuRef = useRef<HTMLInputElement>(null);

  // MẪU LỆNH SIÊU CẤP TÍCH HỢP PHÊ DUYỆT
  const promptsMau = [
    { 
      label: "🚀 SOẠN GIÁO ÁN NĂNG LỰC SỐ", 
      content: `[NHIỆM VỤ]: Soạn giáo án bài [Tên bài] - Lớp [Số lớp] theo GDPT 2018.\n[YÊU CẦU]: Tích hợp năng lực số, sử dụng công cụ AI và học liệu số.\n[CẤU TRÚC]: Đầy đủ 4 bước theo Công văn 5512.` 
    },
    { 
      label: "🔍 THẨM ĐỊNH & PHÊ DUYỆT (TỔ TRƯỞNG)", 
      content: `[VAI TRÒ]: Tổ trưởng chuyên môn dày dạn kinh nghiệm.\n[NHIỆM VỤ]: Đọc và thẩm định nội dung giáo án bên dưới.\n[TIÊU CHÍ SOÁT LỖI]:\n1. Mục tiêu có đo lường được bằng động từ cụ thể không?\n2. Các hoạt động có đúng tiến trình 5512 không?\n3. Phương pháp dạy học có tích cực không?\n4. Có lỗi chính tả hay định dạng không?\n[KẾT QUẢ]: Đưa ra bảng nhận xét Ưu điểm - Hạn chế - Hướng khắc phục.` 
    },
    { 
      label: "📝 CÂU HỎI PHÂN HÓA HỌC SINH", 
      content: `Dựa trên bài học này, hãy thiết kế hệ thống câu hỏi gồm 4 mức độ: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao (đặc biệt là bài tập liên hệ thực tiễn số).` 
    }
  ];

  const handleAiAction = async (actionType: 'GENERATE' | 'REVIEW') => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy Tùng hãy dán API Key vào Vercel!");
    
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
      
      const fileParts = await Promise.all(selectedFiles.map(async file => {
        const base64 = await new Promise((r) => { 
          const reader = new FileReader(); 
          reader.onload = () => r((reader.result as string).split(',')[1]); 
          reader.readAsDataURL(file); 
        });
        return { inlineData: { data: base64 as string, mimeType: file.type } };
      }));

      const instruction = actionType === 'REVIEW' 
        ? "Hãy đóng vai Tổ trưởng chuyên môn để THẨM ĐỊNH giáo án sau đây:" 
        : "Hãy SOẠN THẢO giáo án chuyên sâu sau đây:";

      const result = await model.generateContent([
        `${instruction}\nThông tin: Môn ${monHoc}, ${khoiLop}.\nNội dung: ${customPrompt}`, 
        ...fileParts
      ]);
      
      setAiResponse(result.response.text());
      if(actionType === 'GENERATE') confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`❌ LỖI: ${error.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-900/80 rounded-2xl border border-blue-500/30 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg">⚡</div>
          <div>
            <h1 className="text-lg font-black uppercase text-white">Nguyễn Thanh Tùng</h1>
            <p className="text-[10px] font-bold text-blue-400 tracking-widest uppercase italic">Hệ thống thẩm định giáo án số</p>
          </div>
          <div className="bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Gemini 2.5 Flash Engine</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar điều khiển */}
        <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">⚙️ Cấu hình</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k}>{k}</option>)}
            </select>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-slate-800 text-blue-400 rounded-xl font-black text-[10px] uppercase border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all">
               📚 KHO MẪU LỆNH CHUẨN
            </button>
            {showPromptMenu && (
              <div className="absolute w-64 bg-slate-900 border border-slate-700 p-2 rounded-xl z-50 shadow-2xl">
                {promptsMau.map((p, i) => (
                  <button key={i} onClick={() => {setCustomPrompt(p.content); setShowPromptMenu(false);}} className="block w-full text-left p-3 hover:bg-blue-600 text-[10px] rounded-lg font-bold text-slate-400 hover:text-white mb-1">{p.label}</button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl flex-1 flex flex-col min-h-0">
             <h2 className="text-[10px] font-black uppercase text-blue-500 mb-4">📂 File Giáo Án / SGK</h2>
             <div onClick={() => tailieuRef.current?.click()} className="py-6 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/10 mb-4 transition-all">
                <span className="text-2xl mb-1">📎</span>
                <p className="text-[9px] text-slate-500 font-black uppercase">Tải file cần thẩm định</p>
                <input type="file" ref={tailieuRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
             </div>
             <div className="flex-1 overflow-y-auto space-y-2">
                {selectedFiles.map((f, i) => <div key={i} className="text-[9px] p-2 bg-black/40 rounded border border-slate-800 italic truncate font-bold text-slate-500">{f.name}</div>)}
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleAiAction('GENERATE')} disabled={loading} className="py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-500 transition-all">
               🚀 SOẠN MỚI
            </button>
            <button onClick={() => handleAiAction('REVIEW')} disabled={loading} className="py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 transition-all">
               🔍 PHÊ DUYỆT
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-[10px] font-black uppercase text-blue-500/50 italic tracking-[0.2em]">Hội đồng bộ môn số: Nguyễn Thanh Tùng</span>
              <button onClick={() => setCustomPrompt("")} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase">Xóa hết</button>
            </div>
            <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-12 text-xl outline-none resize-none text-slate-300 font-medium leading-relaxed custom-scrollbar" placeholder="Dán nội dung giáo án cần thẩm định hoặc nhập yêu cầu soạn bài..." />
            <div className="absolute bottom-10 right-10 flex gap-4">
                <button onClick={() => saveAs(new Blob([aiResponse]), "KetQua_ThamDinh_ThayTung.docx")} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:bg-emerald-500 transition-all shadow-emerald-500/20">📥 Xuất kết quả Word</button>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-up hiển thị */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[500] flex items-center justify-center p-12">
            <div className="bg-[#020617] w-full max-w-6xl h-[85vh] rounded-[4rem] border border-blue-500/30 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <span className="font-black text-blue-400 tracking-widest uppercase text-xs">Phản hồi từ Gemini 2.5 Flash</span>
                    <button onClick={() => setIsChatOpen(false)} className="w-12 h-12 rounded-full bg-slate-800 text-white hover:bg-red-600 flex items-center justify-center font-bold transition-all">✕</button>
                </div>
                <div className="p-20 overflow-y-auto text-2xl leading-[1.8] whitespace-pre-wrap flex-1 custom-scrollbar text-slate-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-blue-500 animate-pulse uppercase">AI đang thẩm định chuyên môn...</p>
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