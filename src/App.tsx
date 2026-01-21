import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // 1. DANH MỤC DỮ LIỆU CHUẨN 2026
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // 2. TRẠNG THÁI ỨNG DỤNG
  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [tabHienTai, setTabHienTai] = useState("GIAO_AN"); 
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const tailieuRef = useRef<HTMLInputElement>(null);

  // Hiệu ứng chào mừng
  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#1e40af', '#fbbf24'] });
  }, []);

  // 3. XỬ LÝ FILE ĐA PHƯƠNG THỨC (Multimodal)
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type },
    };
  };

  // 4. XUẤT FILE WORD CHUẨN SƯ PHẠM
  const handleExportWord = async () => {
    if (!aiResponse) return alert("Thầy Tùng hãy soạn bài trước khi xuất file nhé!");
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ 
            text: `HỆ THỐNG TRỢ LÝ GIÁO DỤC SỐ - LUỒNG: ${tabHienTai.replace("_", " ")}`, 
            heading: HeadingLevel.HEADING_1, 
            alignment: AlignmentType.CENTER 
          }),
          new Paragraph({ 
            children: [new TextRun({ text: `Môn: ${monHoc} - Khối: ${khoiLop} | Công nghệ: Gemini 2.5 Flash`, bold: true, color: "1e40af" })] 
          }),
          ...aiResponse.split("\n").map(line => new Paragraph({ 
            children: [new TextRun(line)], 
            spacing: { before: 120 } 
          })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `GiaoAn_2.5Flash_${monHoc}.docx`);
  };

  // 5. KÍCH HOẠT CÔNG NGHỆ GEMINI 2.5 FLASH
  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return alert("Thầy chưa cấu hình VITE_GEMINI_API_KEY trên Vercel!");

    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("Trí tuệ nhân tạo Gemini 2.5 Flash đang phân tích và soạn thảo...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // SỬ DỤNG MODEL 2.5 FLASH MỚI NHẤT
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let promptTask = "";
      if (tabHienTai === "GIAO_AN") {
        promptTask = `Với vai trò chuyên gia, soạn Giáo án Năng lực số 5512 môn ${monHoc}, lớp ${khoiLop}.`;
      } else if (tabHienTai === "PPT") {
        promptTask = `Thiết kế kịch bản PPT chuyên nghiệp (phong cách Canva) cho môn ${monHoc}, lớp ${khoiLop}.`;
      } else {
        promptTask = `Xây dựng Ma trận, Đặc tả và Đề kiểm tra 7991 môn ${monHoc}, lớp ${khoiLop}.`;
      }

      const promptParts: any[] = [promptTask];
      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        promptParts.push(filePart);
      }

      const result = await model.generateContent(promptParts);
      setAiResponse(result.response.text());
    } catch (error) {
      console.error(error);
      setAiResponse("Lỗi kết nối phiên bản 2.5. Thầy vui lòng kiểm tra lại API Key hoặc quyền truy cập Public Preview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER HIỆN ĐẠI */}
      <div className="bg-[#1e40af] text-white py-3 px-8 flex justify-between items-center shadow-2xl z-30">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-2 rounded-xl text-blue-900 font-black animate-pulse">2.5</div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Trợ lý Giáo dục Số - Next Gen</h1>
            <p className="text-[7px] font-bold opacity-70 uppercase tracking-widest">Nguyễn Thanh Tùng • THCS Bình Hòa</p>
          </div>
        </div>
        <div className="hidden md:block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic">
          Powering by Gemini 2.5 Flash
        </div>
      </div>

      {/* CHỌN LUỒNG CÔNG VIỆC */}
      <div className="flex bg-white shadow-md z-20">
        {[
          {id: "GIAO_AN", label: "Giáo án 5512", icon: "📄"},
          {id: "PPT", label: "Bài giảng PPT Canva", icon: "🎨"},
          {id: "DE_KIEM_TRA", label: "Đề kiểm tra 7991", icon: "📊"}
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {setTabHienTai(tab.id); setAiResponse("");}}
            className={`flex-1 py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 ${tabHienTai === tab.id ? 'text-blue-700 border-b-4 border-blue-700 bg-blue-50/50' : 'text-slate-400 hover:text-blue-400'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* VÙNG LÀM VIỆC */}
      <div className="flex-1 p-6 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KHUNG CẤU HÌNH (CHIẾM 3 CỘT) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-8xl font-black">AI</div>
            
            <h3 className="text-blue-900 font-black text-xs uppercase mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-yellow-400 rounded-full"></span> Thông số thiết lập
            </h3>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Chọn Môn học</label>
                <select value={monHoc} onChange={(e)=>setMonHoc(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 focus:ring-4 ring-blue-50 outline-none transition-all">
                  {dsMonHoc.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Chọn Khối lớp</label>
                <select value={khoiLop} onChange={(e)=>setKhoiLop(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 focus:ring-4 ring-blue-50 outline-none transition-all">
                  {dsKhoi.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>

            {/* NÚT + TẢI LÊN TÀI LIỆU */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tài liệu/Hình ảnh bổ trợ (+)</label>
              <div 
                onClick={() => tailieuRef.current?.click()}
                className={`w-full h-40 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer group ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:border-blue-400 hover:bg-blue-50/50'}`}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-xs font-black text-green-700 italic">✓ {selectedFile.name}</p>
                    <p className="text-[8px] uppercase mt-2 text-slate-400">Nhấn để thay đổi file khác</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">＋</div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-4 tracking-tighter">Đưa minh chứng hoặc tài liệu vào luồng xử lý AI</p>
                  </>
                )}
                <input type="file" ref={tailieuRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAiAction}
            disabled={loading}
            className={`w-full py-6 rounded-[2rem] shadow-2xl font-black uppercase tracking-[0.4em] text-xs transition-all transform active:scale-95 ${loading ? 'bg-slate-400' : 'bg-[#1e40af] hover:bg-blue-800 text-white hover:shadow-blue-500/20'}`}
          >
            {loading ? "Đang truy xuất Gemini 2.5 Flash..." : "🚀 Kích hoạt Trợ lý AI"}
          </button>
        </div>

        {/* SIDEBAR CÔNG CỤ (CHIẾM 1 CỘT) */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-8 rounded-[3rem] text-white shadow-2xl h-full flex flex-col justify-between border border-white/5 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
            
            <div className="z-10">
              <h4 className="font-black text-[9px] uppercase text-yellow-400 mb-8 border-b border-white/10 pb-3 tracking-widest">Trung tâm Xuất bản</h4>
              <div className="space-y-6">
                <button 
                  onClick={handleExportWord}
                  className="w-full p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-blue-400 transition-all text-left group"
                >
                  <p className="text-xs font-black group-hover:text-blue-400 transition-colors">📥 Xuất File Word</p>
                  <p className="text-[7px] opacity-40 uppercase mt-1.5 font-bold">Chuẩn hóa văn bản 2026</p>
                </button>
                
                <div className="p-5 bg-white/5 rounded-3xl border border-white/10 opacity-50">
                  <p className="text-xs font-black">🎨 Đồng bộ Canva</p>
                  <p className="text-[7px] opacity-30 uppercase mt-1.5 font-bold">Tự động hóa kịch bản Slide</p>
                </div>
              </div>
            </div>

            <div className="z-10 text-center">
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500">Bình Hòa - Thắng Lợi</p>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG KẾT QUẢ AI */}
      <div className="fixed bottom-8 right-8 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 hover:rotate-12 transition-all">
          <span className="text-3xl">{isChatOpen ? '✕' : '🤖'}</span>
        </button>
        {isChatOpen && (
          <div className="absolute bottom-24 right-0 w-[95vw] md:w-[650px] bg-white rounded-[3rem] shadow-2xl border border-slate-200 flex flex-col max-h-[75vh] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-[#1e40af] p-6 text-white flex justify-between items-center rounded-t-[3rem]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <span className="font-black uppercase text-[10px] tracking-[0.2em]">Cổng thông tin Gemini 2.5 Flash</span>
              </div>
              <button onClick={() => setAiResponse("")} className="text-[8px] font-bold bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all border border-white/20">LÀM MỚI</button>
            </div>
            <div className="p-10 overflow-y-auto text-sm leading-relaxed text-slate-800 bg-slate-50/50 font-medium whitespace-pre-wrap custom-scrollbar">
              {aiResponse || "Hệ thống đã sẵn sàng. Thầy Tùng hãy chọn môn học và nhấn 'Kích hoạt Trợ lý AI'."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;