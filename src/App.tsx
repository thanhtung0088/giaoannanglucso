import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const dsMonHoc = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GD Công dân", "Tin học", "Công nghệ", "Khoa học tự nhiên"];
  const dsKhoi = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const promptsMau = [
    { label: "📝 SOẠN BÀI GIẢNG 5512", content: `Trong vai một chuyên gia giáo dục và một giáo viên [môn học] có trên 20 năm kinh nghiệm, hãy soạn BÀI GIẢNG theo định hướng chương trình GDPT 2018.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Số tiết: [Số tiết]\n• Đối tượng học sinh: [Trung bình / Khá / Yếu / Hỗn hợp]\n\nYêu cầu bài giảng gồm:\n1. Mục tiêu bài học (Kiến thức – Năng lực – Phẩm chất)\n2. Chuẩn bị của giáo viên và học sinh\n3. Tiến trình dạy học chi tiết theo từng hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng\n4. Câu hỏi gợi mở cho học sinh\n5. Ví dụ minh họa, bài tập mẫu\n6. Dự kiến khó khăn của học sinh và cách hỗ trợ\n7. Ghi chú sư phạm cho giáo viên\nTrình bày rõ ràng, đúng chuẩn hồ sơ chuyên môn.` },
    { label: "🏫 SOẠN GIÁO ÁN (Dự giờ)", content: `Trong vai một giáo viên giỏi cấp tỉnh, hãy soạn GIÁO ÁN CHI TIẾT.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Bài: [Tên bài]\n• Thời lượng: [Số tiết]\n• Hình thức dạy học: [Trực tiếp / Trực tuyến / Kết hợp]\n\nYêu cầu:\n- Giáo án theo đúng mẫu hành chính\n- Mỗi hoạt động ghi rõ: Mục tiêu, Nội dung, Phương pháp – Kỹ thuật dạy học, Hoạt động của GV, Hoạt động của HS\n- Có tích hợp: Giáo dục đạo đức, Kỹ năng sống, Chuyản đổi số (nếu phù hợp)\nVăn phong chuẩn giáo án, dễ in, dễ nộp.` },
    { label: "📖 SOẠN ĐỀ CƯƠNG ÔN TẬP", content: `Trong vai một giáo viên chủ nhiệm giàu kinh nghiệm, hãy soạn ĐỀ CƯƠNG ÔN TẬP cho học sinh.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Phạm vi: [Giữa kỳ / Cuối kỳ / Cả chương]\n\nYêu cầu:\n1. Hệ thống kiến thức trọng tâm (ngắn gọn, dễ nhớ)\n2. Công thức / quy tắc / nội dung cần thuộc\n3. Các dạng bài thường gặp\n4. Ví dụ minh họa cho từng dạng\n5. Lưu ý khi làm bài để tránh mất điểm\nTrình bày dạng gạch đầu dòng, phù hợp phát cho học sinh.` },
    { label: "📊 ĐỀ KIỂM TRA 7791", content: `Trong vai một tổ trưởng chuyên môn, hãy soạn ĐỀ KIỂM TRA theo Thông tư 22 và định hướng 7791.\n\n• Môn: [Tên môn]\n• Lớp: [Số lớp]\n• Thời gian làm bài: [Số phút]\n• Hình thức: [Trắc nghiệm / Tự luận / Kết hợp]\n\nYêu cầu:\n1. Ma trận đề (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao)\n2. Đề kiểm tra hoàn chỉnh\n3. Đáp án chi tiết\n4. Thang điểm rõ ràng\n5. Nhận xét mức độ phân hóa học sinh\nĐề phù hợp năng lực học sinh, đúng chuẩn kiểm tra hiện hành.` }
  ];

  const [monHoc, setMonHoc] = useState(dsMonHoc[0]);
  const [khoiLop, setKhoiLop] = useState(dsKhoi[0]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const tailieuRef = useRef<HTMLInputElement>(null);

  const handleAiAction = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) return alert("Thầy Tùng vui lòng kiểm tra lại API Key trong phần Environment Variables!");
    setLoading(true);
    setIsChatOpen(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Cấu hình Model Gemini 3 Flash (Dựa trên thông tin thầy cung cấp)
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
      const fileParts = await Promise.all(selectedFiles.map(file => fileToPart(file)));
      const finalPrompt = `Áp dụng chuyên môn cho: ${monHoc}, ${khoiLop}.\nYêu cầu:\n${customPrompt}`;
      const result = await model.generateContent([finalPrompt, ...fileParts]);
      setAiResponse(result.response.text());
      confetti({ particleCount: 150, spread: 70 });
    } catch (error: any) {
      setAiResponse(`⚠️ Thông báo: ${error.message}\n\nGợi ý: Nếu báo 'model not found', thầy hãy thử đổi sang 'gemini-1.5-pro' vì model 3.0 có thể đang giới hạn vùng địa lý.`);
    } finally { setLoading(false); }
  };

  const fileToPart = async (file: File) => {
    const base64 = await new Promise((r) => { const reader = new FileReader(); reader.onload = () => r((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
    return { inlineData: { data: base64 as string, mimeType: file.type } };
  };

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden flex flex-col p-4">
      {/* HEADER PHONG CÁCH HIỆN ĐẠI */}
      <header className="h-20 mb-4 px-10 flex justify-between items-center bg-slate-800/60 rounded-2xl border border-slate-700 shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.4)]">⚡</div>
            <div>
              <h1 className="text-lg font-black uppercase text-white leading-tight tracking-tight">Nguyễn Thanh Tùng</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Trường THCS Bình Hòa</p>
            </div>
          </div>
          <div className="bg-orange-600 text-white px-8 py-2 rounded-full font-black italic text-sm shadow-lg">Chào mừng quý thầy cô !</div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-md border border-blue