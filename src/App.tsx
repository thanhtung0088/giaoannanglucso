// ... (phần import và LoginScreen giữ nguyên như code cũ của Thầy)

// Main App - Chỉ thay phần aside để fix dấu +
const MainApp: React.FC<{ userInfo?: any }> = ({ userInfo }) => {
  // ... (các state và hàm khác giữ nguyên)

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-100 overflow-hidden flex flex-col font-sans italic relative">
      {/* Header giữ nguyên */}

      <main className="flex-1 grid grid-cols-12 gap-10 p-10 overflow-hidden">
        <aside className="col-span-3 space-y-10 flex flex-col min-h-0 relative z-10 pointer-events-auto">
          {/* Phần cấu hình thiết kế giữ nguyên */}
          <div className="bg-gradient-to-br from-slate-700/85 to-slate-800/85 backdrop-blur-xl rounded-3xl p-7 border border-white/20 shadow-2xl shadow-cyan-500/30 space-y-5 shrink-0 relative z-20 pointer-events-auto">
            {/* ... nội dung cấu hình giữ nguyên */}
          </div>

          <div className="bg-gradient-to-br from-slate-700/85 to-slate-800/85 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-cyan-500/30 flex flex-col flex-1 overflow-hidden relative z-30 pointer-events-auto">
            <div className="bg-slate-900/60 px-6 py-4 border-b border-cyan-400/30 text-cyan-300 font-black text-base uppercase italic">THÊM DỮ LIỆU, HÌNH ẢNH (+)</div>
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar relative z-40 pointer-events-auto">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log("Dấu + được CLICK - mở file picker ngay đây!");
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    console.error("fileInputRef không tồn tại!");
                  }
                }}
                className="h-20 border-2 border-dashed border-cyan-400/50 rounded-3xl flex items-center justify-center cursor-pointer mb-5 bg-slate-900/50 hover:bg-cyan-900/30 transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto relative z-50"
              >
                <span className="text-5xl text-cyan-300 font-black">+</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={(e) => {
                  console.log("File picker đã thay đổi - file được chọn:", e.target.files);
                  handleFileChange(e);
                }} 
              />
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-base text-cyan-200 italic mb-4 bg-slate-800/60 p-4 rounded-2xl border border-cyan-400/20 shadow-inner">
                  <span>📄 {file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 font-bold text-2xl transition">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Nút kích hoạt giữ nguyên */}
          <button onClick={handleSoanBai} disabled={loading} className="w-full py-8 rounded-3xl font-black text-xl uppercase bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-2xl shadow-cyan-500/60 border-b-4 border-blue-900 italic active:scale-95 transition-all relative z-20">
            {loading ? "⌛ AI ĐANG LÀM VIỆC..." : "🚀 KÍCH HOẠT SOẠN GIẢNG"}
          </button>
        </aside>

        {/* Phần editor và preview giữ nguyên như cũ */}
      </main>

      {/* Modal và trợ lý AI giữ nguyên */}
    </div>
  );
};

// ... (phần App component giữ nguyên)