import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsSoTiet = ["1", "2", "3", "4"];
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Khá");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // LOGIC QUẢN LÝ FILE CHỐT HẠ
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Cộng dồn file mới vào danh sách cũ để không bị mất file
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài]";
    const langSuffix = "\n\nYÊU CẦU: VIẾT HOÀN TOÀN BẰNG TIẾNG VIỆT.";
    if (type === '5512') return `Trong vai một chuyên gia giáo dục và một giáo viên môn ${monHoc} có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018 cho ${khoiLop}, bài "${bai}" (${soTiet} tiết) dành cho đối tượng ${doiTuongHS}.\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng)\n4. Câu hỏi gợi mở, bài tập mẫu và ghi chú sư phạm.${langSuffix}`;
    if (type === 'ppt') return `Dựa trên bài dạy "${bai}" môn ${monHoc} ${khoiLop}, hãy soạn cấu trúc Slide trình chiếu sinh động.\n- Phân chia nội dung theo từng Slide (Tiêu đề, gợi ý hình ảnh, nội dung cốt lõi)\n- Thiết kế các hoạt động tương tác, trò chơi giáo dục giữa giờ.\n- Gợi ý phong cách trình bày chuyên nghiệp.${langSuffix}`;
    if (type === '7991') return `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA cho môn ${monHoc} lớp ${khoiLop} bài "${bai}" theo định hướng 7991.\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án và thang điểm chi tiết.${langSuffix}`;
    if (type === 'ontap') return `Trong vai một giáo viên giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho môn ${monHoc} lớp ${khoiLop} bài "${bai}".\n1. Hệ thống kiến thức trọng tâm\n2. Các dạng bài thường gặp\n3. Ví dụ minh họa và lưu ý khi làm bài.${langSuffix}`;
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy hãy kiểm tra API Key!");
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(customPrompt + "\n(Trả lời bằng Tiếng Việt)");
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans">
      <header className="h-40 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black text-center uppercase">THCS<br/>BÌNH HÒA</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setAvatarUrl(URL.createObjectURL(e.target.files[0]))} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic">Soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-500 px-16 py-5 rounded-2xl text-white font-black text-3xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600 transition-colors">📹</button>
           <button className="bg-white/10 p-4 rounded-xl border border-white/20 text-2xl hover:bg-emerald-600 transition-colors">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          {/* PHẦN THÔNG SỐ GIỮ NGUYÊN */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase italic">⚙️ Thiết lập</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Tên bài dạy..." />
            <div className="grid grid-cols-2 gap-3">
              <select value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
                {dsSoTiet.map(s => <option key={s} value={s}>{s} tiết</option>)}
              </select>
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg">LỆNH PROMPT MẪU {showPromptMenu ? '▲' : '▼'}</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-2 overflow-hidden z-[60] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">📑 Soạn KHBD 5512</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">💻 Soạn Slide</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 transition-colors">✍️ Soạn Đề 7991</button>
                  <button onClick={() => {setCustomPrompt(getPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white transition-colors">📚 Soạn Đề cương</button>
                </div>
              )}
            </div>
          </div>

          {/* KHU VỰC DẤU + : HIỂN THỊ FILE DỨT ĐIỂM */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase">📁 Hồ sơ tài liệu minh chứng</div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="h-20 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all mb-4 group"
              >
                <span className="text-3xl text-emerald-500 group-hover:scale-125 transition-transform">+</span>
                <p className="text-[8px] text-slate-500 font-black uppercase">Dán file từ máy tính</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {selectedFiles.length > 0 ? selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center animate-in slide-in-from-left">
                    <div className="flex items-center gap-2 truncate">
                       <span className="text-emerald-500">📄</span>
                       <span className="truncate font-bold text-slate-300 italic uppercase underline decoration-emerald-900">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-red-500 font-black hover:scale-125 transition-transform px-1">✕</button>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-slate-600 italic">Chưa có tệp minh chứng...</div>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all italic tracking-widest">
            {loading ? "⌛ ĐANG THỰC THI..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <div className="col-span-9 grid grid-cols-12 gap-8 h-full">
           <section className="col-span-4 flex flex-col min-h-0">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-700 text-[10px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none custom-scrollbar leading-relaxed" placeholder="Lệnh sẽ hiện tại đây..." />
             </div>
           </section>

           <section className="col-span-8 flex flex-col min-h-0">
             <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl relative overflow-hidden">
                <div className="px-10 py-5 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic underline decoration-2">Bảng Preview Kết Quả AI</span>
                  <button onClick={() => saveAs(new Blob([aiResponse]), `SoanBai_${tenBai}.docx`)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-colors">♻️ XUẤT HỒ SƠ</button>
                </div>
                <div className="flex-1 p-12 overflow-y-auto text-xl leading-[1.8] text-slate-300 whitespace-pre-wrap font-medium custom-scrollbar selection:bg-emerald-500/30">
                   {loading ? "Hệ thống đang thực thi soạn bài..." : aiResponse || "Sẵn sàng thực thi."}
                </div>
             </div>
           </section>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-[100] cursor-pointer group" onClick={() => setIsAssistantOpen(true)}>
         <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
            <span className="text-4xl">🤖</span>
         </div>
      </div>

      {isAssistantOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
           <div className="bg-[#020817] w-full max-w-2xl h-[75vh] rounded-[2rem] border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-6 bg-emerald-800 flex justify-between items-center text-white">
                 <span className="font-black text-xs">🤖 TRỢ LÝ CHAT RIÊNG</span>
                 <button onClick={() => setIsAssistantOpen(false)} className="px-4 py-2 bg-white/10 rounded-full text-white font-black text-[9px] uppercase hover:bg-white/20">✕ ĐÓNG</button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-900/50">
                 {chatHistory.map((m, i) => (
                   <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <div className={`inline-block p-4 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-6 border-t border-slate-800 flex gap-2 bg-[#020817]">
                 <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 text-xs text-white outline-none" placeholder="Hỏi bất cứ điều gì..." />
                 <button onClick={handleChat} className="bg-emerald-600 px-6 py-3 rounded-xl font-black text-[10px] text-white">GỬI</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;