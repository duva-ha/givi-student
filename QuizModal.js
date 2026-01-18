function QuizModal({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, formatTime }) {
    
    // 1. CHỐT CHẶN 1: Nếu không có dữ liệu mảng câu hỏi, đóng modal ngay lập tức
    if (!activeQuiz || activeQuiz.length === 0) {
        return null; 
    }

    // 2. LẤY CÂU HỎI HIỆN TẠI
    const q = activeQuiz[quizState.currentQ];

    // 3. CHỐT CHẶN 2: Nếu câu hỏi bị lỗi hoặc không có mảng đáp án (q.o)
    if (!q || !q.o || !Array.isArray(q.o)) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl text-center shadow-2xl">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="font-bold text-slate-800 mb-4">Dữ liệu câu hỏi bị lỗi!</p>
                    <button 
                        onClick={() => setActiveQuiz(null)} 
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
                    >Quay lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                
                {/* 1. THANH TIÊU ĐỀ & ĐỒNG HỒ */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/80">
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Đang thực hiện</div>
                        <div className="font-black text-slate-800 uppercase text-sm truncate max-w-[200px]">
                            {q.quizTitle || "Bài kiểm tra trực tuyến"}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-2 rounded-2xl font-black text-lg shadow-inner shadow-black/10 ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button 
                            onClick={() => { if(confirm('Thoát? Kết quả sẽ không được lưu.')) setActiveQuiz(null) }} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-all"
                        >✕</button>
                    </div>
                </div>

                {/* 2. NỘI DUNG CÂU HỎI */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                    <div className="mb-8">
                        <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-blue-200">
                            Câu {quizState.currentQ + 1} / {activeQuiz.length}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800 mt-6 leading-relaxed">
                            {q.q || "Nội dung câu hỏi đang được tải..."}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Dùng q.o?.map để bảo vệ mảng đáp án an toàn 100% */}
                        {q.o.map((option, idx) => {
                            const isSelected = quizState.answers[quizState.currentQ] === idx;
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSelect(idx)}
                                    className={`p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.01]' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-300'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-sm md:text-base">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. ĐIỀU HƯỚNG CÂU HỎI */}
                <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button 
                            disabled={quizState.currentQ === 0}
                            onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                        >←</button>
                        
                        {quizState.currentQ < activeQuiz.length - 1 ? (
                            <button 
                                onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-colors"
                            >Tiếp theo →</button>
                        ) : (
                            <button 
                                onClick={() => { if(confirm('Xác nhận nộp bài?')) handleFinish() }}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                            >Nộp bài</button>
                        )}
                    </div>
                    
                    {/* Danh sách câu hỏi nhanh */}
                    <div className="hidden md:flex gap-1.5 max-w-[250px] lg:max-w-[400px] overflow-x-auto p-2 no-scrollbar">
                        {activeQuiz.map((_, i) => (
                            <div 
                                key={i} 
                                onClick={() => setQuizState({...quizState, currentQ: i})}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${quizState.currentQ === i ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-lg' : quizState.answers[i] !== null ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'}`}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}function QuizModal({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, formatTime }) {
    
    // 1. KIỂM TRA AN TOÀN ĐẦU TIÊN: Nếu chưa có dữ liệu thì không vẽ gì cả
    if (!activeQuiz || activeQuiz.length === 0) {
        return null; 
    }

    // 2. LẤY CÂU HỎI HIỆN TẠI (Dùng dấu ? để tránh sập app)
    const q = activeQuiz[quizState.currentQ];

    // 3. KIỂM TRA NẾU CÂU HỎI BỊ LỖI CẤU TRÚC
    if (!q || !q.o) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <div className="animate-spin mb-4 text-4xl">⚙️</div>
                    <p className="font-bold">Đang tải câu hỏi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                
                {/* 1. THANH TIÊU ĐỀ & ĐỒNG HỒ */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/80">
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Đang thực hiện</div>
                        <div className="font-black text-slate-800 uppercase text-sm truncate max-w-[200px]">
                            {q.quizTitle || "Bài kiểm tra"}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-2 rounded-2xl font-black text-lg shadow-inner ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button onClick={() => { if(confirm('Thoát? Kết quả sẽ không được lưu.')) setActiveQuiz(null) }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-all">✕</button>
                    </div>
                </div>

                {/* 2. NỘI DUNG CÂU HỎI */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                    <div className="mb-8">
                        <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-blue-200">
                            Câu {quizState.currentQ + 1} / {activeQuiz.length}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800 mt-6 leading-relaxed">
                            {q.q}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Dùng q.o? để bảo vệ mảng đáp án */}
                        {q.o?.map((option, idx) => {
                            const isSelected = quizState.answers[quizState.currentQ] === idx;
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSelect(idx)}
                                    className={`p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.01]' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-300'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-sm md:text-base">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. ĐIỀU HƯỚNG CÂU HỎI */}
                <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button 
                            disabled={quizState.currentQ === 0}
                            onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-200 transition-colors"
                        >←</button>
                        
                        {quizState.currentQ < activeQuiz.length - 1 ? (
                            <button 
                                onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-colors"
                            >Tiếp theo →</button>
                        ) : (
                            <button 
                                onClick={() => { if(confirm('Xác nhận nộp bài?')) handleFinish() }}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                            >Nộp bài</button>
                        )}
                    </div>
                    
                    {/* Danh sách câu hỏi nhanh */}
                    <div className="hidden md:flex gap-1.5 max-w-[250px] lg:max-w-[400px] overflow-x-auto p-2 no-scrollbar">
                        {activeQuiz.map((_, i) => (
                            <div 
                                key={i} 
                                onClick={() => setQuizState({...quizState, currentQ: i})}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${quizState.currentQ === i ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-lg' : quizState.answers[i] !== null ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'}`}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
