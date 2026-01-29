import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-competti';

const App: React.FC = () => {
  // --- TRẠNG THÁI HỆ THỐNG ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("permanent_logo_v88"));

  // --- DỮ LIỆU ĐÃ ỔN ĐỊNH ---
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const dsDoiTuong = ["Giỏi", "Khá", "Trung bình", "Yếu", "HSHH", "Hỗn hợp"];

  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("1");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");

  // --- NGUYÊN BẢN CÁC LỆNH PROMPT CỦA THẦY TÙNG ---
  const getHardcodedPrompt = (type: string) => {
    const thongTin = `môn ${monHoc}, ${khoiLop}, bài "${tenBai || '[Tên bài]'}" (${soTiet} tiết), đối tượng ${doiTuongHS}.`;
    const presentation = "\nYÊU CẦU TRÌNH BÀY: Sử dụng HTML TABLE cho các mục I và III. Tự động chèn 03 ảnh minh họa bằng thẻ <img src='https://source.unsplash.com/featured/?school,education,{keyword}' />.";

    if (type === '5512') return `Bạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018. Hãy soạn KẾ HOẠCH BÀI DẠY (KHBD) theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4 cho ${thongTin}, đảm bảo đầy đủ và đúng chuẩn.\nYêu cầu bắt buộc:\n- Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4\n- Dạy học theo định hướng phát triển phẩm chất và năng lực\n- TÍCH HỢP: Năng lực số, Quyền con người, Lồng ghép Giáo dục Quốc phòng – An ninh, Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh\n\nCấu trúc KHBD gồm:\n1. Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù)\n2. Thiết bị dạy học và học liệu\n3. Tiến trình dạy học: (Hoạt động 1: Mở đầu; Hoạt động 2: Hình thành kiến thức; Hoạt động 3: Luyện tập; Hoạt động 4: Vận dụng)\n4. Điều chỉnh – bổ sung (nếu có)\n\nTrình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn.${presentation}`;
    
    if (type === 'ppt') return `Bạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm. Hãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ bài học ${thongTin}, đảm bảo:\nYêu cầu:\n- Ít nhất 10 slide\n- Nội dung bám sát KHBD\n- Dạy học theo định hướng phát triển năng lực\n- AI tự chọn màu sắc – bố cục đẹp – dễ nhìn\n- Phù hợp học sinh theo chương trình GDPT 2018\n\nMỗi slide gồm: Tiêu đề, Nội dung ngắn gọn (gạch đầu dòng), Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa\nCấu trúc gợi ý:\nSlide 1: Tiêu đề; Slide 2: Mục tiêu; Slide 3–8: Nội dung trọng tâm; Slide 9: Hoạt động – câu hỏi tương tác; Slide 10: Tổng kết – liên hệ thực tiễn.${presentation}`;
    
    if (type === '7991') return `Bạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực. Hãy soạn ĐỀ KIỂM TRA theo Công văn 7991/BGDĐT-GDTrH cho ${thongTin}, đảm bảo:\nYêu cầu:\n- Đúng ma trận và đặc tả theo CV 7991\n- Đánh giá mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao\n- Câu hỏi gắn với thực tiễn, năng lực, phẩm chất\n\nSản phẩm gồm:\n1. Ma trận đề\n2. Bảng đặc tả\n3. Đề kiểm tra\n4. Đáp án – thang điểm chi tiết\nNgôn ngữ chuẩn, dùng được cho kiểm tra định kỳ / giữa kỳ / cuối kỳ.${presentation}`;
    
    if (type === 'ontap') return `Bạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018. Hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh về ${thongTin}, đảm bảo:\nYêu cầu:\n- Hệ thống kiến thức ngắn gọn – dễ nhớ\n- Phân chia rõ: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài thường gặp\n- Có câu hỏi gợi ý ôn luyện\n- Phù hợp đánh giá theo định hướng năng lực\nTrình bày mạch lạc, dễ in phát cho học sinh.${presentation}`;
    
    return "";
  };

  // --- XỬ LÝ SOẠN BÀI ---
  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa cấu hình API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
      const result = await model.generateContent(customPrompt);
      setAiResponse(result.response.text());
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  const handleExportFile = () => {
    if (!aiResponse) return alert("Chưa có nội dung!");
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table{border-collapse:collapse;width:100%;} td,th{border:1px solid black;padding:5px;}</style></head><body>";
    const sourceHTML = header + aiResponse.replace(/```html|```/g, "") + "</body></html>";
    saveAs(new Blob(['\ufeff', sourceHTML], { type: 'application/msword' }), `HS_BaiGiang_${tenBai}.doc`);
  };

  // --- TRANG ĐĂNG NHẬP ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-6 italic font-sans">
        <div className="bg-slate-800 p-12 rounded-3xl border-2 border-emerald-500 shadow-2xl w-full max-w-md space-y-8 text-center">
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter">HỆ THỐNG SOẠN GIẢNG V88</h1>
          <div className="space-y-4">
            <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200"><img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-6 h-6" />Đăng nhập bằng Google</button>
            <div className="relative py-2"><hr className="border-slate-700"/><span className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 px-2 text-slate-500 text-[10px] uppercase">Quyền quản trị</span></div>
            <input type="password" value={adminPass} onChange={(e)=>setAdminPass(e.target.value)} placeholder="Nhập mã Admin..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-white outline-none" />
            <button onClick={() => adminPass === "ADMIN2026" ? setIsLoggedIn(true) : alert("Sai mã!")} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase">Đăng nhập Admin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-xl">
             {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black uppercase">LOGO</span>}
          </div>
          <div>
            <h1 className="text-white text-xl font-black uppercase tracking-tight">Hệ thống soạn giảng năng lực số</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1 italic">GV: NGUYỄN THANH TÙNG</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowUpgradeModal(true)} className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase animate-pulse border-b-4 border-yellow-700 shadow-xl">🚀 Cập nhật nâng cao</button>
           <div className="bg-orange-600 px-8 py-2 rounded-xl text-white font-black text-xl shadow-2xl border-2 border-orange-400 italic uppercase">Chào quý thầy cô !</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* SIDEBAR TRÁI: CẤU HÌNH (GIỮ NGUYÊN) */}
        <aside className="col-span-3 space-y-4 flex flex-col min-h-0">
          <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-500 shadow-2xl space-y-3 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase italic underline underline-offset-4">⚙️ Thiết lập bài dạy</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic">{dsKhoi.map(k => <option key={k}>{k}</option>)}</select>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white outline-none italic" placeholder="Tên bài dạy..." />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-bold text-white italic" placeholder="Số tiết" />
              <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-xs font-bold text-white italic">{dsDoiTuong.map(d => <option key={d}>{d}</option>)}</select>
            </div>
            <button onClick={() => setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 italic">📜 LỆNH PROMPT MẪU ▼</button>
            {showPromptMenu && (
              <div className="absolute left-10 w-72 bg-slate-800 border-2 border-slate-500 rounded-2xl z-[100] shadow-2xl font-black italic overflow-hidden">
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('5512')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">🔹 PROMPT 1: KHBD 5512</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">🔹 PROMPT 2: GIÁO ÁN PPT</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('7991')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white border-b border-slate-700 text-[10px] uppercase italic">🔹 PROMPT 3: KIỂM TRA 7991</button>
                <button onClick={() => {setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false);}} className="w-full text-left px-5 py-3 hover:bg-emerald-600 text-white text-[10px] uppercase italic">🔹 PROMPT 4: ĐỀ CƯƠNG ÔN TẬP</button>
              </div>
            )}
          </div>
          
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col flex-1 overflow-hidden shadow-2xl min-h-[180px]">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 text-emerald-400 font-black text-xs uppercase italic">📁 HÀNH TRANG (+)</div>
            <div className="p-4 flex flex-col h-full bg-slate-800/40">
              <div className="h-10 border-2 border-dashed border-slate-500 rounded-xl flex items-center justify-center cursor-pointer mb-2 bg-slate-900/50"><span className="text-xl text-emerald-500">+</span></div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="bg-slate-900 p-2 rounded text-[9px] flex justify-between italic"><span className="truncate w-32">📄 {f.name}</span><button className="text-red-500">✕</button></div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-7 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 italic">
            {loading ? "⌛ ĐANG THIẾT KẾ..." : "🚀 KÍCH HOẠT HỆ THỐNG"}
          </button>
        </aside>

        {/* WORKSPACE GIỮA */}
        <section className="col-span-3">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-[9px] font-black text-orange-500 uppercase italic">Thẻ Workspace</div>
             <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-5 text-sm text-slate-100 outline-none resize-none font-bold italic" />
          </div>
        </section>

        {/* PREVIEW PHẢI */}
        <section className="col-span-6 flex flex-col relative">
          <div className="bg-[#1e293b] rounded-3xl border border-slate-500 flex flex-col h-full shadow-2xl overflow-hidden">
             <div className="px-10 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-500 uppercase underline italic">Preview Kết Quả Soạn Bài</span>
               <button onClick={handleExportFile} className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-xl border-b-4 border-emerald-900 italic">♻️ XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-10 overflow-y-auto custom-scrollbar italic text-slate-900 render-content">
                <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/```html|```/g, "") }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL NÂNG CẤP - THÔNG TIN THẬT CỦA THẦY TÙNG */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[3000] p-4 italic">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-10 max-w-4xl w-full relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-yellow-400 text-3xl font-black text-center uppercase mb-10 tracking-widest">BẢNG TÙY CHỌN GÓI SỬ DỤNG</h2>
            <div className="grid grid-cols-3 gap-6 mb-10">
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700 text-center space-y-4">
                 <h3 className="text-white font-black text-lg uppercase">Gói FREE</h3>
                 <p className="text-[10px] text-slate-400 italic">10 giáo án/tháng<br/>(KHBD 5512, Đề 7991)</p>
                 <div className="text-3xl font-black text-white">0đ</div>
                 <button className="w-full py-3 bg-slate-700 rounded-xl text-[10px] font-black uppercase">Đang sử dụng</button>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 text-center space-y-4 transform scale-105 shadow-2xl">
                 <h3 className="text-emerald-400 font-black text-lg uppercase">Gói PREMIUM</h3>
                 <p className="text-[10px] text-slate-400 italic">Soạn full 4 loại bài dạy<br/>Ưu tiên tốc độ cao nhất</p>
                 <div className="text-3xl font-black text-white">199k<span className="text-xs">/tháng</span></div>
                 <button className="w-full py-3 bg-emerald-600 rounded-xl text-[10px] font-black uppercase">Nâng cấp ngay</button>
               </div>
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-orange-500 text-center space-y-4">
                 <h3 className="text-orange-500 font-black text-lg uppercase">Gói PRO AI</h3>
                 <p className="text-[10px] text-slate-400 italic">Soạn giáo án tích hợp<br/>Dùng riêng trợ lý AI</p>
                 <div className="text-3xl font-black text-white">499k<span className="text-xs">/năm</span></div>
                 <button className="w-full py-3 bg-orange-600 rounded-xl text-[10px] font-black uppercase">Gói tiết kiệm nhất</button>
               </div>
            </div>
            <div className="border-t border-slate-700 pt-8 grid grid-cols-2 gap-10 items-center">
               <div className="space-y-3">
                 <p className="text-sm text-emerald-400 font-black uppercase italic">💳 Thông tin tài khoản chính chủ:</p>
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-600">
                    <p className="text-lg text-white font-black italic">MB BANK (Ngân hàng Quân Đội)</p>
                    <p className="text-xl text-yellow-400 font-black tracking-widest mt-1">1122334455667</p>
                    <p className="text-sm text-slate-300 font-bold uppercase mt-1">Chủ TK: NGUYEN THANH TUNG</p>
                 </div>
                 <p className="text-[10px] text-orange-400 font-bold italic">* Cú pháp: [Họ tên] - [Gói đăng ký]</p>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-2xl">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://zalo.me/0987654321" className="w-full h-full" alt="QR Zalo" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase italic">Quét QR Zalo để hỗ trợ kích hoạt</p>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content table { width: 100%; border-collapse: collapse; border: 2px solid black; margin: 20px 0; }
        .render-content td, .render-content th { border: 1px solid black; padding: 12px; font-size: 14px; }
        .render-content img { max-width: 300px; display: block; margin: 20px auto; border: 4px solid #10b981; border-radius: 15px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;