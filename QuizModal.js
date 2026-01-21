const QuizModal = ({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, setIsFocus, formatTime }) => {
    
    // Tự động ẩn thanh Menu khi bắt đầu làm bài để rộng chỗ trên điện thoại
    useEffect(() => {
        setIsFocus(true);
        return () => setIsFocus(false);
    }, []);

    const q = activeQuiz[quizState.currentQ];
    if (!q) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            
            {/* 1. THANH TRẠNG THÁI CỐ ĐỊNH (TOP BAR) */}
            <div className="safe-top bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
                <button onClick={() => confirm("Thoát bài thi sẽ không lưu kết quả?") && setActiveQuiz(null)} className="p-2 text-slate-400">
                    ✕
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Thời gian còn lại</span>
                    <span className={`text-xl font-mono font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
                <div className="bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black border border-slate-700">
                    CÂU {quizState.currentQ + 1}/{activeQuiz.length}
                </div>
            </div>

            {/* 2. NỘI DUNG CÂU HỎI (CUỘN ĐƯỢC) */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-10 bg-slate-50">
                <div className="max-w-2xl mx-auto">
                    {/* Tiến độ làm bài (Thanh bar nhỏ) */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${((quizState.currentQ + 1) / activeQuiz.length) * 100}%`}}></div>
                    </div>

                    <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6">
                        <h2 className="text-lg lg:text-2xl font-bold text-slate-800 leading-relaxed">
                            {q.q}
                        </h2>
                    </div>

                    {/* 3. DANH SÁCH ĐÁP ÁN (DẠNG NÚT TO) */}
                    <div className="grid grid-cols-1 gap-4 mb-20">
                        {(q.o || q.a || []).map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`group flex items-center p-5 rounded-3xl border-2 text-left transition-all active:scale-[0.97] 
                                    ${quizState.answers[quizState.currentQ] === idx 
                                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                                        : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                            >
                                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black mr-4 shrink-0 transition-colors
                                    ${quizState.answers[quizState.currentQ] === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className={`font-bold text-sm lg:text-base ${quizState.answers[quizState.currentQ] === idx ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {opt}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. THANH ĐIỀU HƯỚNG DƯỚI CÙNG (BOTTOM NAV) */}
            <div className="p-4 bg-white border-t flex gap-4 safe-bottom">
                <button 
                    disabled={quizState.currentQ === 0}
                    onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})}
                    className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-100 text-slate-400 disabled:opacity-30"
                >
                    Quay lại
                </button>
                
                {quizState.currentQ === activeQuiz.length - 1 ? (
                    <button 
                        onClick={handleFinish}
                        className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase bg-green-600 text-white shadow-lg shadow-green-100 animate-bounce"
                    >
                        Nộp bài ngay
                    </button>
                ) : (
                    <button 
                        onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})}
                        className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase bg-blue-600 text-white shadow-lg shadow-blue-100"
                    >
                        Câu tiếp theo
                    </button>
                )}
            </div>
        </div>
    );
};
