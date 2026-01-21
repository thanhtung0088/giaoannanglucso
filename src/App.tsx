import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // 1. DỮ LIỆU DANH MỤC
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "GD Kinh tế và Pháp luật", "Tin học", "Công nghệ", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Hoạt động trải nghiệm", "Giáo dục địa phương"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  // 2. TRẠNG THÁI
  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [tabHienTai, setTabHienTai] = useState("GIAO_AN"); 
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const tailieuRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  // 3. LOGIC XỬ LÝ FILE
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type } };
  };

  // 4. KÍCH HOẠT GEMINI 2.5 FLASH (SỬA LỖI KEY)
  const handleAiAction = async () => {
    // Lấy Key từ biến môi trường của Vite
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setAiResponse("LỖI CẤU HÌNH: Thầy Tùng ơi, hệ thống chưa tìm thấy Key trong code. Thầy hãy kiểm tra file .env hoặc cài đặt trên Vercel nhé!");
      setIsChatOpen(true);
      return;
    }

    setLoading(true);
    setIsChatOpen(true);
    setAiResponse("Đang kết nối siêu máy chủ Gemini 2.5 Flash...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model 2.5-flash theo đúng cập nhật mới nhất
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const defaultPrompt = `Hãy soạn ${tabHienTai} môn ${monHoc} lớp ${khoiLop} chuẩn Năng lực số 2026.`;
      const finalPrompt = customPrompt || defaultPrompt;
      
      const promptParts: any[] = [finalPrompt];
      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        promptParts.push(filePart);
      }

      const result = await model.generateContent(promptParts);
      setAiResponse(result.response.text());
    } catch (error: any) {
      console.error(error);
      setAiResponse(`LỖI KẾT NỐI: ${error.message || "Vui lòng kiểm tra lại tính hợp lệ của API Key trên Vercel."}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. XUẤT FILE WORD
  const handleExportWord = async () => {
    if (!aiResponse) return;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `KẾT QUẢ SOẠN THẢO - GEMINI 2.5 FLASH`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          ...aiResponse.split("\n").map(line => new Paragraph({ children: [new TextRun(line)], spacing: { before: 100 } })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Soan_Bai_Tung_2026.docx`);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      {/* HEADER */}
      <div className="bg-[#1e40af] text-white py-3 px-8 flex justify-between items-center shadow-lg z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <h1 className="text-sm font-black uppercase">Trợ lý Giáo dục Số v7.0</h1>
        </div>
        <div className="text-[10px] font-bold bg-green-500/20 border border-green-400 px-3 py-1 rounded-full text-green-300">
          Gemini 2.5 Flash Online
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white border-b border-slate-200">
        {["GIAO_AN", "PPT", "DE_KIEM_TRA"].map(id => (
          <button key={id} onClick={() => setTabHienTai(id)} className={`flex-1 py-4 text-[10px] font-black uppercase transition-all ${tabHienTai === id ? 'text-blue-700 border-b-4 border-blue-700 bg-blue-50' : 'text-slate-400'}`}>
            {id.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex-1 flex flex-col">
            <textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Thầy Tùng nhập yêu cầu hoặc dán Lệnh Prompt mẫu vào đây..."
              className="w-full flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-xs font-medium focus:border-blue-500 outline-none transition-all resize-none mb-4 shadow-inner"
            />
            <div className="flex gap-4">
              <div onClick={() => tailieuRef.current?.click()} className="flex-1 h-16 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedFile ? `✓ ${selectedFile.name}` : "＋ Tải tài liệu"}</span>
                <input type="file" ref={tailieuRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <button onClick={handleAiAction} disabled={loading} className="flex-1 bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg hover:bg-blue-800 transition-all">
                {loading ? "Đang xử lý..." : "🚀 Kích hoạt AI"}
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1 bg-[#0f172a] p-6 rounded-[2rem] text-white shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-yellow-400 border-b border-white/10 pb-2">Công cụ xuất bản</h4>
            <button onClick={handleExportWord} className="w-full p-4 bg-blue-600 rounded-2xl text-xs font-black hover:bg-blue-500">📥 Tải file Word</button>
          </div>
          <p className="text-[8px] text-center opacity-40 font-bold uppercase tracking-widest">Nguyễn Thanh Tùng - 2026</p>
        </div>
      </div>

      {/* CHATBOX */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col max-h-[60vh] z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-blue-700 p-4 text-white flex justify-between items-center rounded-t-[2rem]">
            <span className="font-black text-[10px]">KẾT QUẢ SOẠN THẢO</span>
            <button onClick={() => setIsChatOpen(false)} className="text-xs">✕</button>
          </div>
          <div className="p-6 overflow-y-auto text-sm whitespace-pre-wrap text-slate-800 font-medium">
            {aiResponse}
          </div>
        </div>
      )}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white z-50 text-2xl">🤖</button>
    </div>
  );
};

export default App;