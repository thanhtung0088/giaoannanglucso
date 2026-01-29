import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_fixed_v2"));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_fixed_v2", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getHardcodedPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài dạy]";
    const thongTin = `cho môn ${monHoc}, ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng học sinh ${doiTuongHS}.`;
    
    if (type === '5512') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4 ${thongTin}.
Yêu cầu bắt buộc:
- Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4.
- Dạy học theo định hướng phát triển phẩm chất và năng lực.
- TÍCH HỢP: Năng lực số; Quyền con người; Lồng ghép Giáo dục Quốc phòng – An ninh; Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.
Cấu trúc KHBD gồm:
I. Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù)
II. Thiết bị dạy học và học liệu
III. Tiến trình dạy học: (HĐ 1: Mở đầu; HĐ 2: Hình thành kiến thức; HĐ 3: Luyện tập; HĐ 4: Vận dụng)
IV. Điều chỉnh – bổ sung (nếu có)
Trình bày ngôn ngữ sư phạm chính quy, tuyệt đối không dùng dấu sao (*) ở đầu mục.`;

    if (type === 'ppt') return `Bạn là chuyên gia thiết kế bài giảng số. Soạn nội dung PowerPoint ${thongTin}:
- Ít nhất 10 slide, bám sát KHBD.
- Mỗi slide gồm: Tiêu đề, Nội dung ngắn gọn, Gợi ý hình ảnh minh họa.
- Cấu trúc: Slide 1 (Tiêu đề), Slide 2 (Mục tiêu), Slide 3-8 (Kiến thức), Slide 9 (Tương tác), Slide 10 (Kết luận).`;

    if (type === '7991') return `Soạn ĐỀ KIỂM TRA chuẩn CV 7991 cho ${thongTin}. Sản phẩm gồm: Ma trận đề, Bảng đặc tả, Đề kiểm tra và Đáp án chi tiết.`;

    if (type === 'ontap') return `Soạn ĐỀ CƯƠNG ÔN TẬP cho ${thongTin}. Phân chia: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài bài tập gợi ý.`;

    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Vui lòng nhập API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "BẮT BUỘC: Viết hoàn toàn bằng tiếng Việt. Trình bày kiểu văn bản hành chính sư phạm (I, II, III -> 1, 2, 3 -> a, b, c). KHÔNG dùng dấu sao (*)."
      });
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi AI: " + e.message); } finally { setLoading(false); }
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans">
      <header className="h-32 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-white font-black uppercase">LOGO</span>}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black uppercase italic leading-none tracking-tight">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-xs font-bold text-emerald-200 uppercase mt-2 italic">Giáo viên: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        
        <div className="bg-orange-600 px-10 py-3 rounded-2xl text-white font-black text-2xl shadow-2xl uppercase animate-pulse border-2 border-orange-400">Chào mừng quý thầy cô !</div>

        <div className="flex gap-4">
           <button onClick={() => alert("Hệ thống đang mở trình quay màn hình...")} title="Quay màn hình" className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-2xl hover:bg-red-600 transition-colors">📹</button>
           {/* THAY KÍNH LÚP BẰNG QUÉT MÃ QR */}
           <button onClick={() => alert("Đang khởi động Camera quét mã QR...")} title="Quét mã QR" className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 text-2xl hover:bg-blue-600 transition-colors">🔳</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-6 border border-slate-500 shadow-2xl space-y-4 shrink-0">
            <h2 className="text-xs font-black text-emerald-400 uppercase italic tracking-widest">⚙️ Thiết lập bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none focus:ring-2 ring-emerald-500">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none focus:ring-2 ring-emerald-500">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none focus:ring-2 ring-emerald-500" placeholder="Tên bài dạy..." />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm font-bold text-white outline-none" placeholder="Số tiết..." />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-4 text-xs font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-orange-500 transition-all">📜 LỆNH PROMPT MẪU ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-500 rounded-2xl mt-2 overflow-hidden z-[100] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 italic">📑 SOẠN KHBD CV 5512</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 italic">💻 BÀI GIẢNG PPT</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white border-b border-slate-700 italic">✍️ ĐỀ KIỂM TRA 7991</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-6 py-4 hover:bg-emerald-600 text-[10px] font-black uppercase text-white italic">📚 ĐỀ CƯƠNG ÔN TẬP</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex-1 flex flex-col min-h-0 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 text-emerald-400 font-black italic text-xs uppercase underline underline-offset-8">📁 Hồ sơ tài liệu (+)</div>
            <div className="p-5 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-20 shrink-0 border-2 border-dashed border-slate-500 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all mb-4 bg-slate-800/60">
                <span className="text-4xl text-emerald-500 font-bold">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-[10px] flex justify-between items-center italic">
                    <span className="truncate w-40 text-emerald-300 font-bold">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-black text-sm px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-8 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all italic tracking-tight border-b-4 border-blue-900 active:translate-y-1">
            {loading ? "⌛ ĐANG XỬ LÝ DỮ LIỆU..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-6 py-4 bg-slate-900 border-b border-slate-700 text-[10px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none custom-scrollbar font-bold leading-relaxed" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col min-h-0 relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
               <span className="text-xs font-black text-emerald-500 uppercase italic underline underline-offset-8 decoration-2">Bảng Preview Kết Quả AI</span>
               <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-500 shadow-xl border-b-4 border-emerald-900">♻️ XUẤT HỒ SƠ</button>
               {showExportMenu && (
                 <div className="absolute top-16 right-10 w-48 bg-slate-800 border border-slate-500 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                   <button onClick={() => {saveAs(new Blob([aiResponse]), 'KHBD.docx'); setShowExportMenu(false);}} className="w-full px-6 py-4 text-left text-[11px] font-black text-white hover:bg-blue-600 border-b border-slate-700">📄 FILE WORD</button>
                   <button onClick={() => {saveAs(new Blob([aiResponse]), 'KHBD.pdf'); setShowExportMenu(false);}} className="w-full px-6 py-4 text-left text-[11px] font-black text-white hover:bg-red-600">📕 FILE PDF</button>
                 </div>
               )}
             </div>
             <div className="flex-1 bg-black/10 p-12 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8">
                     <div className="w-16 h-16 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="font-black text-lg text-orange-400 uppercase animate-pulse tracking-widest">Đang kiến tạo giáo án chuẩn...</p>
                  </div>
                ) : (
                  <div className="text-xl leading-loose text-slate-100 whitespace-pre-wrap font-medium">
                    {aiResponse || <div className="text-slate-500 italic text-center mt-20 uppercase text-xs tracking-[0.2em] font-black">Hệ thống sẵn sàng. Vui lòng chọn lệnh mẫu bên trái.</div>}
                  </div>
                )}
             </div>
          </div>
        </section>
      </main>

      {/* KÍCH HOẠT TRỢ LÝ AI GÓC PHẢI */}
      <div onClick={() => alert("Chào Thầy Tùng! Trợ lý AI đang sẵn sàng hỗ trợ Thầy soạn giảng.")} className="fixed bottom-10 right-10 z-[1000] animate-bounce cursor-pointer group">
        <div className="w-20 h-20 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30 hover:scale-125 transition-all">
           <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-12 h-12" alt="AI Bot" />
        </div>
      </div>
    </div>
  );
};

export default App;