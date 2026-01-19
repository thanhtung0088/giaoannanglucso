import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Lấy API Key từ biến môi trường Vite
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) throw new Error("Chưa cấu hình API Key");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(input);
      const response = await result.response;
      const botMessage = { role: 'bot', text: response.text() };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi, tôi gặp lỗi khi kết nối với AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
      <div className="bg-[#0047ab] p-4 text-white font-black text-sm uppercase tracking-widest flex justify-between items-center">
        <span>Hỗ trợ AI</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' ? 'bg-[#0047ab] text-white' : 'bg-white shadow-sm text-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-gray-400 animate-pulse">AI đang suy nghĩ...</div>}
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Nhập câu hỏi..." 
          className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;