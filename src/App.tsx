import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // 1. DANH MỤC DỮ LIỆU CHUẨN
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
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  
  const tailieuRef = useRef<HTMLInputElement>(null);

  // CÂU LỆNH MẪU SẮC BÉN CHO TỪNG LUỒNG
  const getPromptMau = () => {
    if (tabHienTai === "GIAO_AN") {
      return `Hãy đóng vai chuyên gia giáo dục số, soạn Giáo án chuẩn Công văn 5512 cho:
- Môn học: [${monHoc}] - Lớp: [${khoiLop}]
- Tên bài dạy: [Nhập tên bài] - Số tiết: [Số tiết]
- Yêu cầu trọng tâm: Tích hợp Năng lực số, tổ chức 4 hoạt động dạy học (Hình thành kiến thức, Luyện tập, Vận dụng, Mở rộng).
- Thiết bị dạy học: [Liệt kê thiết bị nếu có]
Dựa trên tài liệu/hình ảnh tôi đã đính kèm.`;
    } else if (tabHienTai === "PPT") {
      return `Thiết kế kịch bản bài giảng điện tử phong cách Canva hiện đại cho:
- Môn học: [${monHoc}] - Lớp: [${khoiLop}]
- Tên bài dạy: [Nhập tên bài]
- Cấu trúc Slide: 10-12 slide bao gồm nội dung tương tác, câu hỏi đố vui, và sơ đồ tóm tắt.
- Yêu cầu hình ảnh: Mô tả chi tiết để tôi tìm trên Canva.`;
    } else {
      return `Xây dựng Ma trận và Đặc tả đề kiểm tra chuẩn 7991 cho:
- Môn học: [${monHoc}] - Lớp: [${khoiLop}]
- Thời gian làm bài: [45/60/90 phút]
- Cấu trúc: [Trắc nghiệm ...% / Tự luận ...%]
- Mức độ: Biết, Hiểu, Vận dụng và Vận dụng cao.`;
    }
  };

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#1e40af', '#fbbf24'] });
  }, []);

  // 3. XỬ LÝ FILE & XUẤT WORD
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type } };
  };

  const handleExportWord = async () => {
    if (!aiResponse) return;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `KẾT QUẢ SOẠN THẢO - GEMINI 2.5 FLASH`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: `Môn: ${monHoc} - Lớp: ${khoiLop}`, bold: true })] }),
          ...aiResponse.split("\n").map(line => new Paragraph({ children: [new TextRun(line)], spacing: { before: 100 } })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Soan_Bai_Tung_2026.docx`);
  };

  // 4. KÍCH HOẠT GEMINI 2.5 FLASH
  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return;

    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("Quân sư Gemini 2.5 Flash đang thực hiện yêu cầu...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const finalPrompt = customPrompt || getPromptMau();
      const promptParts: any[] = [finalPrompt];
      
      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        promptParts.push(filePart);
      }

      const result = await model.generateContent(promptParts);
      setAiResponse(result.response.text());
    } catch (error) {
      setAiResponse("Lỗi: Kiểm tra API Key hoặc File đính kèm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="bg-[#1e40af] text-white py-3 px-8 flex justify-between items-center shadow-2xl z-40">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-2 rounded-xl text-blue-900 font-black text-xs">V6.5</div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter">Hệ thống Trợ lý Giáo dục Số</h1>
            <p className="text-[7px] font-bold opacity-70 uppercase">GV: Nguyễn Thanh Tùng - Năm thắng lợi 2026</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-1 rounded-full text-[9px] font-black uppercase border border-white/20">
          Gemini 2.5 Flash Powered
        </div>
      </div>

      {/* TABS CÔNG VIỆC */}
      <div className="flex bg-white shadow-md z-30">
        {[
          {id: "GIAO_AN", label: "Soạn Giáo án 5512", icon: "📄"},
          {id: "PPT", label: "Bài giảng PPT Canva", icon: "🎨"},
          {id: "DE_KIEM_TRA", label: "Đề kiểm tra 7991", icon: "📊"}
        ].map(tab => (
          <button key={tab.id} onClick={() => {setTabHienTai(tab.id); setAiResponse(""); setCustomPrompt("");}} className={`flex-1 py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${tabHienTai === tab.id ? 'text-blue-700 border-b-4 border-blue-700 bg-blue-50' : 'text-slate-400'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* VÙNG NHẬP LIỆU */}
      <div className="flex-1 p-6 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex-1 flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-blue-900 font-black text-[10px] uppercase flex items-center gap-2">
                 <span className="w-2 h-5 bg-blue-600 rounded-full"></span> Khu vực soạn thảo chuyên sâu
               </h3>
               <button 
                onClick={() => {setCustomPrompt(getPromptMau()); setShowPromptModal(true);}}
                className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-orange-200 transition-all border border-orange-200"
               >
                 📝 Lệnh Prompt mẫu
               </button>
            </div>

            <textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Thầy dán lệnh mẫu vào đây để AI soạn chính xác hơn..."
              className="w-full flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-xs font-medium focus:border-blue-500 focus:ring-4 ring-blue-50 outline-none transition-all resize-none mb-6 shadow-inner"
            />

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => tailieuRef.current?.click()}
                className={`h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:bg-blue-50'}`}
              >
                {selectedFile ? <p className="text-[10px] font-bold text-green-700">✓ {selectedFile.name}</p> : <p className="text-[9px] font-black text-slate-400 uppercase">＋ Tải tài liệu tham khảo</p>}
                <input type="file" ref={tailieuRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <button onClick={handleAiAction} disabled={loading} className="bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-800 active:scale-95 transition-all">
                {loading ? "Đang xử lý..." : "🚀 Kích hoạt AI"}
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR CÔNG CỤ */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl h-full flex flex-col gap-6">
            <h4 className="font-black text-[9px] uppercase text-yellow-400 border-b border-white/10 pb-3 tracking-widest text-center">Tiện ích</h4>
            <button onClick={handleExportWord} className="w-full p-5 bg-blue-600 rounded-3xl border border-blue-400 hover:bg-blue-500 transition-all text-left group">
              <p className="text-xs font-black">📥 Tải file Word</p>
              <p className="text-[7px] opacity-60 uppercase mt-1 font-bold italic font-sans">Chuẩn hóa 2026</p>
            </button>
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 opacity-50 flex-1">
              <p className="text-xs font-black">🎨 Canva Kịch bản</p>
              <p className="text-[7px] opacity-40 uppercase mt-1 font-bold italic">Sẵn sàng sao chép</p>
            </div>
            <p className="text-[7px] text-center opacity-30 font-black tracking-widest uppercase italic">Thầy Tùng - Bình Hòa</p>
          </div>
        </div>
      </div>

      {/* CHATBOX KẾT QUẢ */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white transition-all">
          <span className="text-2xl">{isChatOpen ? '✕' : '🤖'}</span>
        </button>
        {isChatOpen && (
          <div className="absolute bottom-16 right-0 w-[90vw] md:w-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col max-h-[70vh]">
            <div className="bg-[#1e40af] p-5 text-white flex justify-between items-center rounded-t-[2.5rem]">
              <span className="font-black uppercase text-[10px] tracking-widest">Sản phẩm từ Gemini 2.5 Flash</span>
              <button onClick={() => setAiResponse("")} className="text-[8px] font-bold bg-white/20 px-3 py-1 rounded-full">LÀM MỚI</button>
            </div>
            <div className="p-8 overflow-y-auto text-sm leading-relaxed text-slate-800 bg-slate-50 font-medium whitespace-pre-wrap">
              {aiResponse || "Mời thầy dùng lệnh mẫu hoặc nhập yêu cầu để bắt đầu."}
            </div>
          </div>
        )}
      </div>

      {/* MODAL LỆNH MẪU */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8">
            <h2 className="text-blue-900 font-black text-xs uppercase mb-4">📝 Cấu hình lệnh Prompt mẫu</h2>
            <textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[11px] font-medium outline-none focus:border-orange-400 mb-6"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPromptModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-black uppercase text-[10px]">Đóng</button>
              <button onClick={() => setShowPromptModal(false)} className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-black uppercase text-[10px] shadow-lg shadow-orange-200">Dùng lệnh này</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;