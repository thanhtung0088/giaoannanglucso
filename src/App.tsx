import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // GIỮ NGUYÊN DANH SÁCH ĐÃ ỔN ĐỊNH
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(""); 
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v86"));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_v86", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // GIỮ NGUYÊN 100% NỘI DUNG PROMPT CỦA THẦY - CHỈ THÊM CHỈ THỊ TRÌNH BÀY FILE
  const getHardcodedPrompt = (type: string) => {
    const thongTin = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet} tiết), đối tượng ${doiTuongHS}.`;
    const formatInstruction = "\n\nLƯU Ý TRÌNH BÀY: Hãy trình bày nội dung dưới dạng HTML, sử dụng TABLE (bảng) cho các mục I (Mục tiêu) và III (Tiến trình dạy học) giống file mẫu Word. Ở mỗi hoạt động dạy học, hãy tự động chèn 01 thẻ <img src='https://source.unsplash.com/featured/?school,education,{keyword}' /> với {keyword} là nội dung liên quan đến bài học.";

    if (type === '5512') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4 cho ${thongTin}, đảm bảo đầy đủ và đúng chuẩn.\nYêu cầu bắt buộc:\n- Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4\n- Dạy học theo định hướng phát triển phẩm chất và năng lực\n- TÍCH HỢP: Năng lực số, Quyền con người, Lồng ghép Giáo dục Quốc phòng – An ninh, Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh\n\nCấu trúc KHBD gồm:\n1. Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù)\n2. Thiết bị dạy học và học liệu\n3. Tiến trình dạy học: (Hoạt động 1: Mở đầu; Hoạt động 2: Hình thành kiến thức; Hoạt động 3: Luyện tập; Hoạt động 4: Vận dụng)\n4. Điều chỉnh – bổ sung (nếu có)\n\nTrình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn.${formatInstruction}`;
    
    if (type === 'ppt') return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm. Hãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ bài học ${thongTin}, đảm bảo:\nYêu cầu:\n- Ít nhất 10 slide\n- Nội dung bám sát KHBD\n- Dạy học theo định hướng phát triển năng lực\n- AI tự chọn màu sắc – bố cục đẹp – dễ nhìn\n- Phù hợp học sinh theo chương trình GDPT 2018\n\nMỗi slide gồm: Tiêu đề, Nội dung ngắn gọn (gạch đầu dòng), Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa\nCấu trúc gợi ý:\nSlide 1: Tiêu đề; Slide 2: Mục tiêu; Slide 3–8: Nội dung trọng tâm; Slide 9: Hoạt động – câu hỏi tương tác; Slide 10: Tổng kết – liên hệ thực tiễn.${formatInstruction}`;
    
    if (type === '7991') return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực. Hãy soạn ĐỀ KIỂM TRA theo Công văn 7991/BGDĐT-GDTrH cho ${thongTin}, đảm bảo:\nYêu cầu:\n- Đúng ma trận và đặc tả theo CV 7991\n- Đánh giá mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao\n- Câu hỏi gắn với thực tiễn, năng lực, phẩm chất\n\nSản phẩm gồm:\n1. Ma trận đề\n2. Bảng đặc tả\n3. Đề kiểm tra\n4. Đáp án – thang điểm chi tiết\nNgôn ngữ chuẩn, dùng được cho kiểm tra định kỳ / giữa kỳ / cuối kỳ.${formatInstruction}`;
    
    if (type === 'ontap') return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018. Hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh về ${thongTin}, đảm bảo:\nYêu cầu:\n- Hệ thống kiến thức ngắn gọn – dễ nhớ\n- Phân chia rõ: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài thường gặp\n- Có câu hỏi gợi ý ôn luyện\n- Phù hợp đánh giá theo định hướng năng lực\nTrình bày mạch lạc, dễ in phát cho học sinh.${formatInstruction}`;
    
    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey) return alert("Hệ thống yêu cầu API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi kết nối: " + e.message); } finally { setLoading(false); }
  };

  // KÍCH HOẠT NÚT XUẤT FILE - GIỮ ĐỊNH DẠNG BẢNG CHO WORD
  const handleExportFile = () => {
    if (!aiResponse) return alert("Chưa có nội dung để xuất!");
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table{border-collapse:collapse;width:100%;} td,th{border:1px solid black;padding:5px;}</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + aiResponse.replace(/```html|```/g, "") + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    saveAs(blob, `HS_BaiGiang_${tenBai || 'GiaoAn'}.doc`);
  };

  const handleAssistantChat = async () => {
    if (!chatInput.trim()) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return;
    const newHistory = [...chatHistory, { role: "user", text: chatInput }];
    setChatHistory(newHistory); setChatInput("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const result = await model.generateContent(chatInput);
      setChatHistory([...newHistory, { role: "ai", text: result.response.text() }]);
    } catch (e) { setChatHistory([...newHistory, { role: "ai", text: "Lỗi!" }]); }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black uppercase">LOGO</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-xl font-black uppercase tracking-tight">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="bg-orange-600 px-8 py-2 rounded-xl text-white font-black text-xl shadow-2xl uppercase border-2 border-orange-400 italic">Chào mừng quý thầy cô !</div>
        <div className="flex gap-4">
           <button className="bg-white/10 p-3 rounded-xl border-2 border-white/20 text-xl hover:bg-red-600">📹</button>
           <button className="bg-white/10 p-3 rounded-xl border-2 border-white/20 text-xl hover:bg-blue-600">🔳</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline underline-offset-4">⚙️ Thiết lập bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white uppercase italic">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white uppercase italic">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white outline-none italic" placeholder="Nhập tên bài dạy..." />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic" placeholder="Số tiết" />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white italic">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 italic">📜 LỆNH PROMPT MẪU ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-72 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic overflow-hidden">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 1: KHBD 5512 (TRÌNH BÀY BẢNG)</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 2: GIÁO ÁN PPT (KÈM ẢNH)</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 3: KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white text-[10px] uppercase">🔹 PROMPT 4: ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl shrink-0 min-h-[200px]">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic underline underline-offset-4">📁 HỒ SƠ TÀI LIỆU (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              <div onClick={() => fileInputRef.current?.click()} className="h-10 border-2 border-dashed border-slate-500 rounded-xl flex items-center justify-center cursor-pointer mb-2 bg-slate-900/50 hover:border-emerald-500">
                <span className="text-2xl text-emerald-500 font-bold">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => { 
                  if(e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5));
                }} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between items-center italic">
                    <span className="truncate w-32 text-emerald-300">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ ĐANG THIẾT KẾ..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace (Lệnh Prompt)</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic leading-relaxed" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col min-h-0 relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
               <span className="text-xs font-black text-emerald-500 uppercase underline italic underline-offset-8">Bảng Xem Trước (Trình bày chuẩn File Word)</span>
               <button onClick={handleExportFile} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 hover:bg-emerald-500 transition-colors italic">♻️ XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto custom-scrollbar italic text-slate-900 render-content">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse italic text-orange-400">
                     <div className="w-14 h-14 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="font-black text-sm uppercase">AI đang trình bày giáo án theo mẫu của Thầy...</p>
                  </div>
                ) : (
                  <div 
                    className="prose prose-slate max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} 
                  />
                )}
             </div>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 2px solid black; }
        .render-content th, .render-content td { border: 1px solid black; padding: 10px; text-align: left; vertical-align: top; }
        .render-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; border: 3px solid #10b981; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .render-content h1, .render-content h2, .render-content h3 { color: #065f46; text-transform: uppercase; font-weight: 900; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;