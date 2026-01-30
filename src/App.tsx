import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAs } from "file-saver";
import confetti from 'canvas-confetti';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Login Screen (giữ nguyên)
const LoginScreen: React.FC<{ onLogin: (userInfo: any) => void }> = ({ onLogin }) => {
  // ... (code LoginScreen giữ nguyên như cũ, em không paste lại để ngắn gọn)
};

// Main App
const MainApp: React.FC<{ userInfo?: any }> = ({ userInfo }) => {
  // ... (các state và hàm khác giữ nguyên như cũ)

  const getHardcodedPrompt = (type: string) => {
    // ... (hàm getHardcodedPrompt giữ nguyên)
  };

  // ... (các hàm handleAvatarChange, handleFileChange, handleSoanBai, exportFile, sendChatMessage, openGoogleMeet, handleLogout giữ nguyên)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-100 flex flex-col font-sans italic">
      {/* Header giữ nguyên */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-8 py-6 flex justify-between items-center shrink-0 border-b-4 border-emerald-900 shadow-2xl z-50">
        {/* ... logo, chữ chào mừng, 3 nút bên phải giữ nguyên */}
      </header>

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-auto">
        <aside className="col-span-3 min-w-[320px] space-y-10 flex flex-col min-h-0 relative overflow-visible z-[50]">
          {/* Phần cấu hình thiết kế giữ nguyên */}
          <div className="bg-slate-800 p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-5 shrink-0 relative z-[60]">
            <h2 className="text-xl font-black text-cyan-300 uppercase italic tracking-wide">⚙️ CẤU HÌNH THIẾT KẾ</h2>
            {/* ... các select, input giữ nguyên */}
            <div className="relative w-full">
              <button 
                onClick={() => setShowPromptMenu(!showPromptMenu)} 
                className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black text-base uppercase shadow-xl hover:shadow-orange-500/60 transition-all"
              >
                📜 CHỌN LỆNH MẪU (5) ▼
              </button>
              {showPromptMenu && (
                <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-cyan-500 rounded-2xl shadow-2xl font-black italic overflow-hidden z-[9999]">
                  {/* ĐÃ THÊM LẠI ĐẦY ĐỦ 5 LỆNH */}
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('khbd')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    🔹 SOẠN KẾ HOẠCH BÀI DẠY (KHBD) THEO CV 5512 – GDPT 2018
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('ppt')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    🖥️ SOẠN BÀI GIẢNG TRÌNH CHIẾU (PPT) – THẨM MỸ, HIỆN ĐẠI
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('kiemtra')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    📝 SOẠN ĐỀ KIỂM TRA THEO CÔNG VĂN 7991
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('ontap')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 border-b border-cyan-600 text-sm leading-tight transition">
                    📚 SOẠN ĐỀ CƯƠNG ÔN TẬP
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCustomPrompt(getHardcodedPrompt('trochoi')); setShowPromptMenu(false); }} className="w-full text-left px-5 py-4 hover:bg-cyan-800 text-sm leading-tight transition">
                    🎮 SOẠN TRÒ CHƠI TƯƠNG TÁC
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phần thêm file giữ nguyên */}
          {/* ... */}

          <button onClick={handleSoanBai} disabled={loading} className="w-full py-8 rounded-3xl font-black text-xl uppercase bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-2xl shadow-cyan-500/60 border-b-4 border-blue-900 italic active:scale-95 transition-all">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        {/* Phần Workspace Editor và Preview giữ nguyên */}
        {/* ... */}
      </main>

      {/* Modal và Trợ lý AI giữ nguyên */}
      {/* ... */}
    </div>
  );
};

// App component giữ nguyên
const App: React.FC = () => {
  // ... code App giữ nguyên
};

export default App;