import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { saveAs } from "file-saver";

const App: React.FC = () => {
  // --- STATE HỆ THỐNG ---
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("Lớp 10");
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [resultText, setResultText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- STATE LOGO & CHATBOX ---
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string, text: string}[]>([]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Xử lý tải Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSchoolLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Xử lý Soạn giáo án
  const handleStartAI = async () => {
    if (!planFile) return alert("Vui lòng chọn file giáo án!");
    setIsProcessing(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const arrayBuffer = await planFile.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      
      const prompt = `Bạn là chuyên gia giáo dục số. Hãy soạn lại giáo án môn ${subject} ${grade} tích hợp năng lực số dựa trên nội dung này: ${value}`;
      const result = await model.generateContent(prompt);
      setResultText(result.response.text());
    } catch (error) {
      alert("Lỗi kết nối AI. Kiểm tra API Key!");
    } finally { setIsProcessing(false); }
  };

  // Xử lý Chatbox
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(currentInput);
      setChatMessages(prev => [...prev, { role: "ai", text: result.response.text() }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "ai", text: "Trợ lý đang bận, thử lại sau nhé!" }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans pb-20">
      {/* 1. TOP BAR */}
      <div className="bg-[#1e40af] text-white py-2 px-6 flex justify-between items-center text-[11px] font-bold shadow-sm">
        <div className="flex items-center gap-2 uppercase tracking-wider">
          <span className="text-lg">🎓</span> SOẠN GIÁO ÁN NĂNG LỰC SỐ - BY NGUYỄN THANH TÙNG
        </div>
        <div className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full animate-pulse">
          POWERED BY GEMINI AI
        </div>
      </div>

      {/* 2. BANNER VỚI LOGO CÓ THỂ THAY THẾ */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e40af] h-72 flex items-center px-12 relative shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
        
        {/* Hình tròn Logo - Nhấn vào để chọn ảnh */}
        <div 
          onClick={() => logoInputRef.current?.click()}
          className="relative z-10 w-40 h-40 bg-white rounded-full flex items-center justify-center cursor-pointer border-4 border-white/30 shadow-2xl hover:scale-105 transition-all overflow-hidden"
          title="Bấm để thay đổi Logo trường"
        >
          {schoolLogo ? (
            <img src={schoolLogo} className="w-full h-full object-cover" alt="Logo" />
          ) : (
            <div className="text-blue-900 text-center p-4">
              <span className="text-3xl">📷</span>
              <p className="text-[10px] font-black uppercase mt-1">Chọn Logo</p>
            </div>
          )}
          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
        </div>

        {/* Chữ chào mừng lấp lánh */}
        <div className="ml-12 z-10">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-200 drop-shadow-2xl">
            Chào mừng quý thầy cô !
          </h1>
          <p className="text-white text-2xl font-bold mt-3 tracking-widest opacity-90 uppercase">
            THCS BÌNH HÒA - VỮNG BƯỚC TƯƠNG LAI
          </p>
        </div>

        <div className="ml-auto z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-xs font-black opacity-60 uppercase text-center">Năm học</p>
          <p className="text-4xl font-black text-yellow-400">2025 - 2026</p>
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH (Dựa trên ảnh image_b6729d.jpg) */}
      <div className="max-w-7xl mx-auto -mt-10 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-20">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-blue-800 font-black text-xs uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Thông tin kế hoạch bài dạy
                </h3>
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Môn học đào tạo</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-b-2 border-gray-100 py-2 font-bold focus:border-blue-600 outline-none">
                        <option>Toán</option><option>Ngữ Văn</option><option>Tin học</option>
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Khối lớp thực hiện</label>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full border-b-2 border-gray-100 py-2 font-bold focus:border-blue-600 outline-none">
                        <option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                    </select>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-blue-800 font-black text-xs uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Tài liệu đầu vào
                </h3>
                <label className="block w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center cursor-pointer hover:bg-blue-50 transition-all">
                  <input type="file" className="hidden" onChange={e => setPlanFile(e.target.files?.[0] || null)} />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                    {planFile ? planFile.name : "Kéo thả hoặc chọn file giáo án (.docx)"}
                  </span>
                </label>
              </div>
            </div>

            <button 
              onClick={handleStartAI}
              disabled={isProcessing}
              className="w-full mt-12 bg-blue-700 hover:bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 uppercase tracking-[0.3em] transition-all transform active:scale-95"
            >
              {isProcessing ? "🚀 HỆ THỐNG ĐANG XỬ LÝ..." : "▲ BẮT ĐẦU SOẠN GIÁO ÁN"}
            </button>
          </div>

          {resultText && (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border-t-8 border-blue-700 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-blue-900 uppercase">Kết quả giáo án AI</h2>
                <button onClick={() => saveAs(new Blob([resultText]), "GiaoAn.txt")} className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold text-xs hover:bg-green-700">TẢI FILE WORD</button>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{resultText}</div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
            <div className="bg-[#1e3a8a] p-8 rounded-[2rem] text-white shadow-xl">
                <h4 className="font-black uppercase text-xs mb-6 text-yellow-400 tracking-widest underline underline-offset-8">Hướng dẫn nhanh</h4>
                <ul className="space-y-5 text-xs font-bold opacity-90">
                    <li className="flex gap-3 items-start"><span className="bg-white text-blue-900 w-5 h-5 flex items-center justify-center rounded-full shrink-0">1</span> Click vào vòng tròn trắng để dán Logo trường.</li>
                    <li className="flex gap-3 items-start"><span className="bg-white text-blue-900 w-5 h-5 flex items-center justify-center rounded-full shrink-0">2</span> Chọn môn và tải file giáo án mẫu.</li>
                    <li className="flex gap-3 items-start"><span className="bg-white text-blue-900 w-5 h-5 flex items-center justify-center rounded-full shrink-0">3</span> Nhấn nút xanh để AI bắt đầu tích hợp năng lực số.</li>
                </ul>
            </div>
        </div>
      </div>

      {/* 4. CHATBOX AI HỖ TRỢ GIÁO VIÊN */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isChatOpen && (
          <div className="bg-white w-[350px] h-[500px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-slideUp">
            <div className="bg-blue-700 p-5 text-white font-black flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
                <span>TRỢ LÝ GIÁO VIÊN AI</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-2xl opacity-70 hover:opacity-100">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                  <p className="text-3xl mb-2">👋</p>
                  <p className="text-[10px] font-bold uppercase">Chào thầy cô, tôi có thể giúp gì ạ?</p>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed font-bold shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-2 ring-blue-500/20 font-bold" 
                placeholder="Nhập câu hỏi của thầy cô..." 
              />
              <button onClick={sendChatMessage} className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-blue-800 transition-colors shadow-lg">➤</button>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-20 h-20 bg-blue-700 rounded-full shadow-[0_10px_40px_rgba(30,64,175,0.4)] flex flex-col items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 border-4 border-white"
        >
          <span className="text-3xl">🤖</span>
          <span className="text-[8px] font-black uppercase mt-0.5">Hỏi AI</span>
        </button>
      </div>
    </div>
  );
};

export default App;