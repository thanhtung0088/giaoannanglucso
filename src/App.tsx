import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");

  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HỆ THỐNG 4 LỆNH PROMPT CHUẨN CỦA THẦY TÙNG ---
  const getHardcodedPrompt = (type: string) => {
    const thongTin = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet || 1} tiết), đối tượng ${doiTuongHS}.`;
    
    if (type === '5512') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) cho ${thongTin} theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4, đảm bảo đầy đủ và đúng chuẩn. 
Yêu cầu bắt buộc: Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4; Dạy học theo định hướng phát triển phẩm chất và năng lực.
TÍCH HỢP: Năng lực số; Quyền con người; Lồng ghép Giáo dục Quốc phòng – An ninh; Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.
Cấu trúc KHBD gồm: I. Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù); II. Thiết bị dạy học và học liệu; III. Tiến trình dạy học (HĐ 1: Mở đầu; HĐ 2: Hình thành kiến thức; HĐ 3: Luyện tập; HĐ 4: Vận dụng); IV. Điều chỉnh – bổ sung.
Trình bày ngôn ngữ hành chính – sư phạm, dùng bảng HTML cho các mục cần thiết.`;

    if (type === 'ppt') return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm. Hãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ cho ${thongTin}, đảm bảo:
Yêu cầu: Ít nhất 10 slide; Nội dung bám sát KHBD; Dạy học theo định hướng phát triển năng lực; AI tự chọn màu sắc – bố cục đẹp – dễ nhìn.
Mỗi slide gồm: Tiêu đề, Nội dung ngắn gọn (gạch đầu dòng), Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa.
Cấu trúc gợi ý: Slide 1: Tiêu đề; Slide 2: Mục tiêu; Slide 3–8: Nội dung trọng tâm; Slide 9: Hoạt động – câu hỏi tương tác; Slide 10: Tổng kết – liên hệ thực tiễn.`;

    if (type === '7991') return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực. Hãy soạn ĐỀ KIỂM TRA cho ${thongTin} theo Công văn 7991/BGDĐT-GDTrH, đảm bảo:
Yêu cầu: Đúng ma trận và đặc tả theo CV 7991; Đánh giá mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao); Câu hỏi gắn với thực tiễn.
Sản phẩm gồm: Ma trận đề, Bảng đặc tả, Đề kiểm tra, Đáp án – thang điểm chi tiết.
Ngôn ngữ chuẩn, dùng được cho kiểm tra định kỳ / giữa kỳ / cuối kỳ.`;

    if (type === 'ontap') return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018. Hãy soạn ĐỀ CƯƠNG ÔN TẬP cho ${thongTin}, đảm bảo:
Yêu cầu: Hệ thống kiến thức ngắn gọn – dễ nhớ; Phân chia rõ: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài thường gặp; Có câu hỏi gợi ý ôn luyện.
Phù hợp đánh giá theo định hướng năng lực. Trình bày mạch lạc, dễ in phát cho học sinh.`;

    return "";
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa có API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Sử dụng bản Pro để xử lý tích hợp sâu
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 italic font-sans">
        <div className="bg-slate-800 p-12 rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-md space-y-8 text-center">
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter text-emerald-400">HỆ THỐNG SOẠN GIẢNG V93</h1>
          <div className="space-y-4">
            <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all">
               <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" /> Đăng nhập Google
            </button>
            <div className="relative py-2"><hr className="border-slate-700"/><span className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 px-2 text-slate-500 text-[10px] uppercase font-bold">Hoặc dùng mã Admin</span></div>
            <input type="password" value={adminPass} onChange={(e)=>setAdminPass(e.target.value)} placeholder="Mật mã Admin..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-white outline-none focus:border-emerald-500" />
            <button onClick={() => adminPass === "ADMIN2026" ? setIsLoggedIn(true) : alert("Mật mã sai!")} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase hover:bg-orange-500">Kích hoạt Admin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6 w-1/4">
          <div className="text-white">
            <h1 className="text-xl font-black uppercase leading-tight text-yellow-300">HỆ THỐNG SOẠN GIẢNG</h1>
            <h2 className="text-[12px] font-bold text-emerald-100 uppercase italic">NĂNG LỰC SỐ THẾ HỆ MỚI</h2>
            <p className="text-[9px] font-bold text-emerald-200 mt-1 uppercase italic border-t border-emerald-500 pt-1">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-12 py-3 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.6)] border-2 border-yellow-300">
             <h2 className="text-white text-3xl font-black uppercase italic animate-pulse drop-shadow-lg">Chào mừng quý thầy cô !</h2>
          </div>
        </div>

        <div className="flex gap-4 w-1/4 justify-end">
           <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase shadow-xl border-b-4 border-yellow-700 active:scale-95">🚀 Nâng cấp PRO</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* SIDEBAR TRÁI */}
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline underline-offset-4">⚙️ Cấu hình thiết kế</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            
            <div className="grid grid-cols-2 gap-2">
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsKhoi.map(k => <option key={k}>{k}</option>)}</select>
                {/* NÚT NHẬP SỐ TIẾT CÓ CHỮ GỢI Ý */}
                <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic" placeholder="Số tiết..." />
            </div>
            
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white outline-none italic" placeholder="Tên bài dạy/chương..." />
            
            <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsDoiTuong.map(d => <option key={d}>{d}</option>)}</select>

            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 italic transition-all">📜 CHỌN LỆNH PROMPT (4 MẪU) ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-80 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic overflow-hidden">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 1: SOẠN KHBD 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 2: SOẠN BÀI GIẢNG PPT</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase">🔹 PROMPT 3: SOẠN ĐỀ KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-4 hover:bg-emerald-600 text-white text-[10px] uppercase">🔹 PROMPT 4: SOẠN ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl min-h-[150px]">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic">📁 HÀNH TRANG (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              <div onClick={() => fileInputRef.current?.click()} className="h-16 border-2 border-dashed border-emerald-500/50 rounded-2xl flex items-center justify-center cursor-pointer mb-2 bg-slate-900 hover:bg-emerald-900/20 transition-all">
                <span className="text-3xl text-emerald-500 font-black">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded-lg text-[9px] flex justify-between italic text-emerald-300 border border-slate-700">📄 {f.name}</div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG XỬ LÝ..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        {/* WORKSPACE */}
        <section className="col-span-3">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Trung tâm xử lý Prompt</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        {/* PREVIEW */}
        <section className="col-span-6 flex flex-col relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-500 uppercase underline italic tracking-widest">Xem trước kết quả</span>
               <button onClick={() => saveAs(new Blob([aiResponse], {type:'text/plain'}), `SoanGiang_${tenBai}.doc`)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT FILE WORD</button>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto italic text-slate-900 render-content custom-scrollbar">
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL NÂNG CẤP - DONGA BANK */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[3000] p-4 italic">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-10 max-w-4xl w-full relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-yellow-400 text-3xl font-black text-center uppercase mb-10 tracking-tighter">THANH TOÁN & NÂNG CẤP TÀI KHOẢN</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-10">
               <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center">
                 <h3 className="text-white font-black uppercase italic mb-2">Gói FREE</h3>
                 <div className="text-3xl font-black text-emerald-400 mb-2">0đ</div>
                 <p className="text-[9px] text-slate-500 italic uppercase">10 giáo án/tháng</p>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 text-center transform scale-110 shadow-emerald-500/20 shadow-2xl">
                 <h3 className="text-emerald-400 font-black uppercase italic mb-2">PREMIUM</h3>
                 <div className="text-3xl font-black text-white mb-2">199k<span className="text-xs">/tháng</span></div>
                 <p className="text-[9px] text-slate-400 italic uppercase">Không giới hạn bài giảng</p>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-orange-500 text-center">
                 <h3 className="text-orange-500 font-black uppercase italic mb-2">Gói PRO AI</h3>
                 <div className="text-3xl font-black text-white mb-2">499k<span className="text-xs">/năm</span></div>
                 <p className="text-[9px] text-slate-400 italic uppercase">Tích hợp chuyên sâu 2018</p>
               </div>
            </div>

            <div className="border-t border-slate-700 pt-8 grid grid-cols-2 gap-10">
               <div className="space-y-4">
                 <p className="text-sm text-emerald-400 font-black uppercase italic">💳 Thông tin chuyển khoản:</p>
                 <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-600">
                    <p className="text-white text-sm font-bold mb-2 uppercase">NGÂN HÀNG: <span className="text-yellow-400">DONGA BANK</span></p>
                    <p className="text-white text-sm font-bold mb-2 uppercase">CHỦ TK: <span className="text-yellow-400">NGUYEN THANH TUNG</span></p>
                    <p className="text-emerald-400 text-3xl font-black tracking-widest mt-2">916033681</p>
                 </div>
                 <p className="text-[10px] text-orange-400 font-black italic uppercase">Hotline Zalo hỗ trợ: 0916033681</p>
               </div>
               <div className="flex flex-col items-center justify-center gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-lg shadow-white/10">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://zalo.me/0916033681`} className="w-full h-full" alt="QR Zalo" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-black uppercase italic">Quét mã Zalo liên hệ (Thanh Tùng)</p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; margin: 20px 0; }
        .render-content td, .render-content th { border: 1px solid black; padding: 12px; font-size: 14px; line-height: 1.6; }
        .render-content th { background-color: #f8fafc; font-weight: 900; }
        .render-content h1, .render-content h2 { font-weight: 900; text-transform: uppercase; margin: 15px 0; border-bottom: 2px solid #e2e8f0; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;