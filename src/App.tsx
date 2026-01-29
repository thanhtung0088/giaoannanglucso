import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem("teacher_avatar"));
  
  const [monHoc, setMonHoc] = useState("GD Công dân");
  const [khoiLop, setKhoiLop] = useState("Lớp 6");
  const [tenBai, setTenBai] = useState("");
  const [soTiet, setSoTiet] = useState("");
  const [doiTuongHS, setDoiTuongHS] = useState("Hỗn hợp");
  const [customPrompt, setCustomPrompt] = useState("");

  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Tin học", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Công nghệ", "KHTN"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HỆ THỐNG 5 LỆNH PROMPT CHUẨN (SAO CHÉP NGUYÊN VĂN GẠCH ĐẦU DÒNG) ---
  const getHardcodedPrompt = (type: string) => {
    const context = `Môn học: ${monHoc}, ${khoiLop}, Tên bài dạy: "${tenBai || '[Tên bài]'}" (${soTiet || 1} tiết), Đối tượng: ${doiTuongHS}.`;
    
    switch(type) {
      case 'khbd': return `PROMPT 1: SOẠN KẾ HOẠCH BÀI DẠY (KHBD) THEO CV 5512 – GDPT 2018\n\nBạn là chuyên gia xây dựng Kế hoạch bài dạy theo Chương trình GDPT 2018.\n\nHãy soạn KẾ HOẠCH BÀI DẠY (KHBD) cho ${context} theo Công văn 5512/BGDĐT-GDTrH, Phụ lục 4, đảm bảo đầy đủ và đúng chuẩn.\nYêu cầu bắt buộc:\n- Đúng cấu trúc KHBD theo CV 5512 – Phụ lục 4\n- Dạy học theo định hướng phát triển phẩm chất và năng lực\n- TÍCH HỢP: Năng lực số, Quyền con người, Lồng ghép Giáo dục Quốc phòng – An ninh, Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh\n\nCấu trúc KHBD gồm:\n- Mục tiêu bài học (Phẩm chất, Năng lực chung, Năng lực đặc thù)\n- Thiết bị dạy học và học liệu\n- Tiến trình dạy học: Hoạt động 1: Mở đầu; Hoạt động 2: Hình thành kiến thức; Hoạt động 3: Luyện tập; Hoạt động 4: Vận dụng\n- Điều chỉnh – bổ sung (nếu có)\n\nTrình bày ngôn ngữ hành chính – sư phạm, đúng để in nộp hồ sơ chuyên môn.`;
      
      case 'ppt': return `PROMPT 2: SOẠN BÀI GIẢNG TRÌNH CHIẾU (PPT) – THẨM MỸ, HIỆN ĐẠI\n\nBạn là chuyên gia thiết kế bài giảng số và mỹ thuật sư phạm.\n\nHãy soạn BÀI GIẢNG TRÌNH CHIẾU (PowerPoint) phục vụ cho ${context}, đảm bảo:\nYêu cầu:\n- Ít nhất 10 slide\n- Nội dung bám sát KHBD\n- Dạy học theo định hướng phát triển năng lực\n- AI tự chọn màu sắc – bố cục đẹp – dễ nhìn\n- Phù hợp học sinh theo chương trình GDPT 2018\n\nMỗi slide gồm:\n- Tiêu đề\n- Nội dung ngắn gọn (gạch đầu dòng)\n- Gợi ý hình ảnh / sơ đồ / biểu tượng minh họa\n\nCấu trúc gợi ý:\nSlide 1: Tiêu đề; Slide 2: Mục tiêu; Slide 3–8: Nội dung trọng tâm; Slide 9: Hoạt động tương tác; Slide 10: Tổng kết.`;
      
      case 'test': return `PROMPT 3: SOẠN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991\n\nBạn là chuyên gia ra đề và đánh giá học sinh theo định hướng phát triển năng lực.\n\nHãy soạn ĐỀ KIỂM TRA cho ${context} theo Công văn 7991/BGDĐT-GDTrH, đảm bảo:\nYêu cầu:\n- Đúng ma trận và đặc tả theo CV 7991\n- Đánh giá mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao\n- Câu hỏi gắn với thực tiễn, năng lực, phẩm chất\n\nSản phẩm gồm:\n- Ma trận đề\n- Bảng đặc tả\n- Đề kiểm tra\n- Đáp án – thang điểm chi tiết`;
      
      case 'game': return `FROMPT 4: TRÒ CHƠI TƯƠNG TÁC HỌC TẬP\n\nSoạn TRÒ CHƠI TƯƠNG TÁC cho bài dạy ${context}, gồm nhiều dạng:\n- Trắc nghiệm chọn 1 đáp án đúng\n- Đúng – Sai\n- Ghép thẻ\n- Điền khuyết\n\nVới mỗi trò chơi, trình bày: Tên trò chơi, Mục tiêu, Luật chơi, Nội dung câu hỏi, Đáp án. Phù hợp cho PPT – Quizizz – Kahoot.`;

      case 'outline': return `FROMPT 5: ĐỀ CƯƠNG ÔN TẬP\n\nBạn là giáo viên giàu kinh nghiệm, am hiểu chương trình GDPT 2018.\n\nHãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh dựa trên ${context}, đảm bảo:\nYêu cầu:\n- Hệ thống kiến thức ngắn gọn – dễ nhớ\n- Phân chia rõ: Kiến thức trọng tâm, Kỹ năng cần đạt, Dạng bài thường gặp\n- Có câu hỏi gợi ý ôn tập\n- Trình bày rõ ràng, dễ in, dễ học.`;
      
      default: return "";
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
        localStorage.setItem("teacher_avatar", ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSoanBai = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Hệ thống chưa có API Key!");
    setLoading(true); setAiResponse("");
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(customPrompt + "\n\nLưu ý: Luôn trả về kết quả dưới dạng HTML có định dạng bảng và tiêu đề chuyên nghiệp.");
      setAiResponse(result.response.text());
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    } catch (e: any) { setAiResponse("Lỗi: " + e.message); } finally { setLoading(false); }
  };

  if (!isLoggedIn) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center italic">
        <button onClick={() => setIsLoggedIn(true)} className="p-10 bg-emerald-600 text-white font-black rounded-3xl shadow-2xl uppercase border-b-8 border-emerald-800">VÀO HỆ THỐNG SOẠN GIẢNG</button>
    </div>
  );

  return (
    <div className="h-screen bg-slate-700 flex flex-col font-sans italic overflow-hidden">
      {/* HEADER GỐC XANH LÁ */}
      <header className="h-28 bg-emerald-700 px-10 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-xl z-50">
        <div className="flex items-center gap-6 w-1/3">
          <div onClick={() => document.getElementById('avatar-up')?.click()} className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-emerald-800 flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white font-black uppercase text-center">DÁN<br/>HÌNH</span>}
            <input type="file" id="avatar-up" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black uppercase leading-none">HỆ THỐNG SOẠN GIẢNG</h1>
            <p className="text-[10px] font-bold text-emerald-200 uppercase mt-1">NĂNG LỰC SỐ THẾ HỆ MỚI</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-10 py-3 rounded-2xl border-2 border-yellow-300">
            <h2 className="text-white text-2xl font-black uppercase italic animate-pulse">CHÀO MỪNG QUÝ THẦY CÔ !</h2>
          </div>
        </div>

        <div className="w-1/3 flex justify-end gap-3">
          <button onClick={() => window.open("https://meet.google.com/new")} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-lg border-b-4 border-blue-800">GOOGLE MEET</button>
          <button onClick={() => setShowPackageModal(true)} className="bg-purple-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-lg border-b-4 border-purple-800">CẬP NHẬT NÂNG CAO</button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* CỘT 1: CẤU HÌNH & HÀNH TRANG */}
        <aside className="col-span-3 space-y-6 flex flex-col min-h-0">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-600 shadow-xl space-y-4 shrink-0 relative">
            <h2 className="text-xs font-black text-emerald-400 uppercase italic">⚙️ CẤU HÌNH THIẾT KẾ</h2>
            <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white">{dsMonHoc.map(m => <option key={m}>{m}</option>)}</select>
            <div className="grid grid-cols-2 gap-3">
              <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white">{dsKhoi.map(k => <option key={k}>{k}</option>)}</select>
              <input type="text" value={soTiet} onChange={(e)=>setSoTiet(e.target.value)} placeholder="Số tiết..." className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none" />
            </div>
            <input type="text" value={tenBai} onChange={(e)=>setTenBai(e.target.value)} placeholder="Tên bài dạy..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white outline-none" />
            <select value={doiTuongHS} onChange={(e)=>setDoiTuongHS(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-orange-400">
                <option>Hỗn hợp</option><option>HS Đại trà</option><option>HS Giỏi</option><option>HSHN</option>
            </select>
            
            <div className="relative">
              <button onClick={()=>setShowPromptMenu(!showPromptMenu)} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-xs uppercase shadow-lg border-b-4 border-orange-800">📜 CHỌN LỆNH MẪU (5) ▼</button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border-2 border-orange-500 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  <button onClick={()=>{setCustomPrompt(getHardcodedPrompt('khbd')); setShowPromptMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-[10px] font-bold uppercase border-b border-slate-800 text-white">🔹 SOẠN KHBD 5512</button>
                  <button onClick={()=>{setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-[10px] font-bold uppercase border-b border-slate-800 text-white">🖥️ SOẠN BÀI GIẢNG PPT</button>
                  <button onClick={()=>{setCustomPrompt(getHardcodedPrompt('test')); setShowPromptMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-[10px] font-bold uppercase border-b border-slate-800 text-white">📝 ĐỀ KIỂM TRA 7991</button>
                  <button onClick={()=>{setCustomPrompt(getHardcodedPrompt('game')); setShowPromptMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-[10px] font-bold uppercase border-b border-slate-800 text-white">🎮 TRÒ CHƠI TƯƠNG TÁC</button>
                  <button onClick={()=>{setCustomPrompt(getHardcodedPrompt('outline')); setShowPromptMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-[10px] font-bold uppercase text-white">📚 ĐỀ CƯƠNG ÔN TẬP</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col flex-1 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-700 text-emerald-400 font-black text-[10px] uppercase italic">THÊM DỮ LIỆU, HÌNH ẢNH (+)</div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
              <div onClick={()=>fileInputRef.current?.click()} className="h-16 border-2 border-dashed border-emerald-500 rounded-2xl flex items-center justify-center cursor-pointer bg-slate-900 hover:bg-emerald-900/20 z-[9999] pointer-events-auto transition-all">
                <span className="text-4xl text-emerald-400 font-black">+</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e)=>e.target.files && setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)].slice(0,5))} />
              </div>
              {selectedFiles.map((f, i)=>(
                <div key={i} className="flex justify-between bg-slate-900 p-2 rounded-lg text-[10px] border border-slate-700 italic">
                  <span className="truncate w-40">📄 {f.name}</span>
                  <button onClick={()=>setSelectedFiles(selectedFiles.filter((_,idx)=>idx!==i))} className="text-red-500 font-black px-2">×</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-6 rounded-3xl font-black text-lg uppercase bg-blue-600 hover:bg-blue-500 shadow-2xl border-b-4 border-blue-900 active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        {/* CỘT 2: WORKSPACE EDITOR */}
        <section className="col-span-3">
          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col h-full overflow-hidden">
             <div className="px-5 py-4 bg-slate-900 border-b border-slate-700 text-xs font-black text-orange-400 uppercase italic tracking-widest">Workspace Editor</div>
             <textarea value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} className="w-full flex-1 bg-transparent p-6 text-sm text-slate-100 outline-none resize-none font-bold italic" placeholder="Lệnh AI sẽ xuất hiện tại đây..." />
          </div>
        </section>

        {/* CỘT 3: PREVIEW KẾT QUẢ */}
        <section className="col-span-6">
          <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-xl flex flex-col h-full overflow-hidden">
             <div className="px-8 py-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <span className="text-xs font-black text-emerald-400 uppercase italic">XEM TRƯỚC KẾT QUẢ</span>
               <button onClick={()=>saveAs(new Blob([aiResponse], {type:'text/html'}), `SoanGiang_${tenBai}.html`)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase shadow-lg border-b-4 border-emerald-800">XUẤT FILE</button>
             </div>
             <div className="flex-1 bg-white p-8 overflow-y-auto text-slate-900 render-content custom-scrollbar">
                <div dangerouslySetInnerHTML={{ __html: aiResponse || "<p class='text-center text-slate-400 mt-20 italic font-bold'>Dữ liệu bài giảng sẽ hiển thị tại đây...</p>" }} />
             </div>
          </div>
        </section>
      </main>

      {/* MODAL CẬP NHẬT NÂNG CAO */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[5000] p-6 italic">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-10 max-w-5xl w-full relative">
            <button onClick={()=>setShowPackageModal(false)} className="absolute top-4 right-6 text-white text-3xl font-black">✕</button>
            <h2 className="text-yellow-400 text-3xl font-black text-center uppercase mb-8">THANH TOÁN & NÂNG CẤP PRO</h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center">
                <h3 className="text-white font-black uppercase mb-4">Gói FREE</h3>
                <div className="text-3xl font-black text-emerald-400 mb-4">MIỄN PHÍ</div>
                <ul className="text-xs text-slate-400 text-left space-y-2">
                  <li>- Soạn 10 giáo án/tháng</li>
                  <li>- KHBD 5512, Đề 7991</li>
                </ul>
              </div>
              <div className="bg-slate-900 p-8 rounded-2xl border-2 border-emerald-500 text-center transform scale-105 shadow-2xl">
                <h3 className="text-emerald-400 font-black uppercase mb-4">PREMIUM</h3>
                <div className="text-3xl font-black text-white mb-4">199k/tháng</div>
                <ul className="text-xs text-slate-300 text-left space-y-2">
                  <li>- Soạn 4 loại bài soạn</li>
                  <li>- Không giới hạn số lượng</li>
                </ul>
              </div>
              <div className="bg-slate-900 p-8 rounded-2xl border-2 border-orange-500 text-center">
                <h3 className="text-orange-500 font-black uppercase mb-4">LOẠI PRO</h3>
                <div className="text-3xl font-black text-white mb-4">499k/năm</div>
                <ul className="text-xs text-slate-300 text-left space-y-2">
                  <li>- Soạn được 5 loại bài soạn:</li>
                  <li>- KHBD 5512, PPT, Đề KT 7991</li>
                  <li>- Đề cương, Trò chơi tương tác</li>
                  <li>- Sử dụng Trợ lý AI đặc biệt</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-slate-700 pt-6 flex justify-between items-center text-white">
               <div className="space-y-1">
                  <p className="font-black">Ngân hàng: <span className="text-yellow-400 uppercase">DONGA BANK</span></p>
                  <p className="font-black">Số tài khoản: <span className="text-emerald-400 text-2xl">916033681</span></p>
                  <p className="font-black">Chủ TK: <span className="text-yellow-400 uppercase">NGUYEN THANH TUNG</span></p>
                  <p className="text-orange-400 font-black">Liên hệ Zalo: 0916033681</p>
               </div>
               <div className="w-32 h-32 bg-white p-2 rounded-xl">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://zalo.me/0916033681" className="w-full h-full" alt="QR" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* KÍCH HOẠT TRỢ LÝ AI */}
      <div className="fixed bottom-8 right-8 z-[2000]">
        <div className="bg-emerald-600 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-4 border-white animate-bounce">
          <span className="text-2xl">🌸</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .render-content h2 { color: #065f46; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #10b981; margin-top: 20px; }
        .render-content table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #94a3b8; }
        .render-content td, .render-content th { border: 1px solid #94a3b8; padding: 8px; font-size: 14px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;