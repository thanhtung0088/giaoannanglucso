
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#2563eb] text-white py-4 px-6 shadow-md border-b border-blue-400/20">
      <div className="max-w-[96%] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Soạn Giáo Án Năng Lực Số</h1>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80 font-bold">By Nguyễn Thanh Tùng</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
            <span className="text-xs font-black uppercase tracking-wider">Powered by Gemini AI</span>
          </div>
          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
