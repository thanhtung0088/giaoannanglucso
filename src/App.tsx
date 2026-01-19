import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

const App: React.FC = () => {
  // State cho ứng dụng chính
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("Lớp 10");
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [resultText, setResultText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State cho Logo và Chatbox
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string, text: string}[]>([]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cuộn chat xuống cuối
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSchoolLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
      alert("Lỗi xử lý AI. Vui lòng kiểm tra lại API Key.");
    } finally { setIsProcessing(false); }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(chatInput);
      setChatMessages(prev => [...prev, { role: "ai", text: result.response.text() }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "ai", text: "Xin lỗi, tôi gặp sự cố kết nối." }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff6ff] font-sans pb-10">
      {/* HEADER TOP BAR */}
      <div className="bg-[#0047ab] text-white py-2 px-6 flex justify-between items-center text-[10px] font-bold">
        <div className="flex items-center gap-2"><span>🎓</span> SOẠN GIÁO ÁN NĂNG LỰC SỐ</div>
        <div className="bg-yellow-400 text-blue-900 px-3 py-0.5 rounded-full">POWERED BY GEMINI AI 2026</div>
      </div>

      {/* BANNER VỚI HIỆU ỨNG GLASS & LOGO CUSTOM */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 h-64 flex items-center px-12 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Khu vực Logo có thể dán/tải từ máy tính */}
        <div 
          onClick={() => logoInputRef.current?.click()}
          className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden shadow-xl"
        >
          {schoolLogo ? (
            <img src={schoolLogo} className="w-full h-full object-contain p-2" alt="School Logo" />
          ) : (
            <div className="text-white text-center">
              <span className="text-2xl">📸</span>
              <p className="text-[8px] font-black uppercase">Tải Logo</p>
            </div>
          )}
          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
        </div>

        {/* Chữ Chào mừng màu vàng cam lấp lánh */}
        <div className="ml-10 z-10">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-yellow-600 filter drop-shadow-lg tracking-tight animate-pulse">
            Chào mừng quý thầy cô !
          </h1>
          <p className="text-white text-xl font-bold mt-2 tracking-[0.2em] opacity-90">
            THCS BÌNH HÒA - VỮNG BƯỚC TƯƠNG LAI
          </p>
        </div>

        <div className="ml-auto z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white text-right shadow-2xl">
          <p className="text-xs font-bold opacity-70 uppercase">Niên khóa</p>
          <p className="text-3xl font-black text-yellow-400">2025 - 2026</p>
        </div>
      </div>

      {/* MAIN CONTENT GIAO DIỆN CHÍNH */}
      <div className="max-w-7xl mx-auto mt-[-40px] relative z-20 grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-white">
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-blue-800 font-black text-xs uppercase border-l-4 border-blue-600 pl-3">Thông tin kế hoạch</h3>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full border-b-2 border-gray-100 py-3 font-bold outline-none focus:border-blue-500">
                  <option>Toán</option><option>Ngữ Văn</option><option>Tiếng Anh</option><option>Tin học</option>
                </select>
                <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full border-b-2 border-gray-100 py-3 font-bold outline-none focus:border-blue-500">
                  <option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                </select>