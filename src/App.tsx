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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_tung"));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        localStorage.setItem("permanent_logo_tung", base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // KHÓA CỨNG NGUYÊN KHỐI 4 LỆNH MẪU THEO YÊU CẦU
  const getHardcodedPrompt = (type: string) => {
    const bai = tenBai || "[Tên bài dạy]";
    const thongTinChung = `cho môn ${monHoc}, ${khoiLop}, bài "${bai}" (${soTiet} tiết), đối tượng học sinh ${doiTuongHS}.`;
    
    if (type === '5512') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4 ${thongTinChung}, đảm bảo đầy đủ và đúng chuẩn.
Yêu cầu bắt buộc:
- Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4
- Dạy học theo định hướng phát triển phẩm chất và năng lực
- TÍCH HỢP: Năng lực số; Quyền con người; Lồng ghép Giáo dục Quốc phòng – An ninh; Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.
Cấu trúc KHBD gồm:
1. Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù)
2. Thiết bị dạy học và học liệu
3. Tiến trình dạy học: (HĐ 1: Mở đầu; HĐ 2: Hình thành kiến thức; HĐ 3: Luyện tập; HĐ 4: Vận dụng)
4. Điều chỉnh – bổ sung (nếu có)
Trình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn.`;

    if (type === 'ppt') return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm. Hãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ bài học ${thongTinChung}, đảm bảo:
Yêu cầu:
- Ít nhất 10 slide, nội dung bám sát KHBD.
- Dạy học theo định hướng phát triển năng lực.
- AI tự chọn màu sắc – bố cục đẹp – dễ nhìn.
Mỗi slide gồm: Tiêu đề; Nội dung ngắn gọn (gạch đầu dòng); Gợi ý hình ảnh/sơ đồ.
Cấu trúc: Slide 1: Tiêu đề; Slide 2: Mục tiêu; Slide 3–8: Nội dung trọng tâm; Slide 9: Tương tác; Slide 10: Tổng kết.`;

    if (type === '7991') return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực. Hãy soạn ĐỀ KIỂM TRA theo Công văn 7991/BGDĐT-GDTrH cho ${thongTinChung}.
Yêu cầu:
- Đúng ma trận và đặc tả theo CV 7991.
- Đánh giá mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
Sản phẩm gồm: Ma trận đề; Bảng đặc tả; Đề kiểm tra; Đáp án – thang điểm chi tiết.
Ngôn ngữ chuẩn, dùng được cho kiểm tra định kỳ.`;

    if (type === 'ontap') return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018. Hãy soạn ĐỀ CƯƠNG ÔN TẬP cho ${thongTinChung}.
Yêu cầu:
- Hệ thống kiến thức ngắn gọn – dễ nhớ.
- Phân chia rõ: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài thường gặp.
- Có câu hỏi gợi ý ôn luyện.
Trình bày mạch lạc, dễ in phát cho học sinh.`;
    
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
        systemInstruction: "Bạn là trợ lý giáo dục Việt Nam. BẮT BUỘC: Viết hoàn toàn bằng tiếng Việt. Trình bày theo phong cách văn bản sư phạm: Tiêu đề dùng I, II, III; mục con dùng 1., 2., 3. và a., b., c. TUYỆT ĐỐI KHÔNG dùng dấu sao (*) để trình bày."
      });
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-screen bg-slate-700 text-slate-200 overflow-hidden flex flex-col font-sans relative">
      <header className="h-32 bg-emerald-700 px-8 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-40">
        <div className="flex items-center gap-4">
          <div onClick={() => document.getElementById('avatarInput')?.click()} className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black text-center uppercase">LOGO</span>}
             <input type="file" id="avatarInput" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase italic leading-none">Soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="bg-orange-600 px-8 py-2 rounded-xl text-white font-black text-xl shadow-xl uppercase animate-pulse">Chào mừng quý thầy cô !</div>
            <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="bg-white/10 hover:bg-emerald-500 px-4 py-1 rounded-lg border border-white/20 text-[10px] font-bold flex items-center gap-2">🟢 Google Meet</button>
        </div>
        <div className="flex gap-2">
           <button className="bg-white/10 p-3 rounded-xl border border-white/20 text-xl">📹</button>
           <button className="bg-white/10 p-3 rounded-xl border border-white/20 text-xl">🔍</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic">⚙️ Thiết lập bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsMonHoc.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none">
              {dsKhoi.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Nhập tên bài dạy..." />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-bold text-white outline-none" placeholder="Số tiết..." />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-bold text-white outline-none">
                {dsDoiTuong.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-orange-500">📜 LỆNH PROMPT MẪU ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-xl mt-1 overflow-hidden z-[100] shadow-2xl">
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[9px] font-black uppercase text-white border-b border-slate-700 italic">📑 KHBD CV 5512</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[9px] font-black uppercase text-white border-b border-slate-700 italic">💻 BÀI GIẢNG PPT</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[9px] font-black uppercase text-white border-b border-slate-700 italic">✍️ ĐỀ KT CV 7991</button>
                  <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-[9px] font-black uppercase text-white italic">📚 ĐỀ CƯƠNG ÔN TẬP</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
            <div className="bg-[#0f172a] px-5 py-3 border-b border-slate-700 text-emerald-500 font-black italic text-[10px] uppercase underline underline-offset-4 decoration-2">📁 Hồ sơ tài liệu (+)</div>
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 shrink-0 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all mb-3 bg-slate-800/40">
                <span className="text-3xl text-emerald-500">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-[9px] flex justify-between items-center italic">
                    <span className="truncate w-32 text-emerald-300 font-bold">📄 {f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 px-1 font-black">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl transition-all italic tracking-tighter">
            {loading ? "⌛ ĐANG THỰC THI..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        <section className="col-span-3 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-3 bg-[#0f172a] border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-xs text-slate-100 outline-none resize-none custom-scrollbar font-medium" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col min-h-0 relative">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-8 py-4 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center shrink-0">
               <span className="text-[10px] font-black text-emerald-500 uppercase italic underline underline-offset-4 decoration-2">Bảng Preview Kết Quả AI</span>
               <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-lg">♻️ XUẤT HỒ SƠ</button>
               {showExportMenu && (
                 <div className="absolute top-14 right-8 w-44 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[100] overflow-hidden">
                   <button onClick={() => {saveAs(new Blob([aiResponse]), 'KHBD.docx'); setShowExportMenu(false);}} className="w-full px-5 py-3 text-left text-[9px] font-black text-white hover:bg-blue-600 border-b border-slate-700">📄 FILE WORD</button>
                   <button onClick={() => {saveAs(new Blob([aiResponse]), 'KHBD.pdf'); setShowExportMenu(false);}} className="w-full px-5 py-3 text-left text-[9px] font-black text-white hover:bg-red-600">📕 FILE PDF</button>
                 </div>
               )}
             </div>
             <div className="flex-1 bg-black/20 p-10 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                     <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="font-black text-sm text-orange-400 uppercase animate-pulse">Đang kiến tạo chuẩn sư phạm...</p>
                  </div>
                ) : (
                  <div className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap font-medium">
                    {aiResponse || <div className="text-slate-600 italic text-center mt-20 uppercase text-[11px] tracking-widest font-black">Hệ thống sẵn sàng. Vui lòng chọn lệnh mẫu.</div>}
                  </div>
                )}
             </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-8 right-8 z-[1000] animate-bounce cursor-pointer group">
        <div className="w-14 h-14 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 hover:scale-110 transition-transform">
           <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" className="w-8 h-8" alt="AI Bot" />
        </div>
      </div>
    </div>
  );
};

export default App;