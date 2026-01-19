// Trích đoạn hàm xử lý trong App.tsx đã được cập nhật
const handleProcess = async () => {
  if (!info.planFile) {
    alert("Vui lòng tải lên File Giáo án!");
    return;
  }

  setIsProcessing(true);
  try {
    // Lấy API Key an toàn từ biến môi trường VITE_ (Vite) hoặc process.env (CRA)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_API_KEY || "";
    
    if (!apiKey) {
      alert("Lỗi: Không tìm thấy API Key. Vui lòng kiểm tra file .env");
      setIsProcessing(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `Bạn là chuyên gia giáo dục số. Hãy phân tích file giáo án môn ${info.subject}, khối ${info.grade} 
                    và đề xuất các hoạt động tích hợp năng lực số, sử dụng các công cụ AI và CNTT hiện đại.`;

    const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
    const result = await response.response;
    const text = result.text();

    console.log("Kết quả soạn thảo:", text);
    alert("Hệ thống đã phân tích và tích hợp năng lực số thành công!");
    
  } catch (error) {
    console.error("Lỗi AI:", error);
    alert("Có lỗi kết nối với Gemini AI. Hãy kiểm tra lại API Key.");
  } finally {
    setIsProcessing(false);
  }
};