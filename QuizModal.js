function QuizModal({ 
    activeQuiz, 
    quizState, 
    setQuizState, 
    timeLeft, 
    handleSelect, 
    handleFinish, 
    calculateScore, 
    formatTime, 
    setActiveQuiz 
}) {
    // Nếu không có bài thi nào đang kích hoạt thì không hiện gì cả
    if (!activeQuiz) return null;

    const { currentQ, answers, showResult, reviewMode } = quizState;

    return (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[5rem] p-10 lg:p-16 shadow-2xl relative overflow-y-auto max-h-[95vh] border-4 border-white/10 animate-in zoom-in duration-300">
                
                {!showResult || reviewMode ? (
                    <React.Fragment>
                        {/* Header của Modal */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="space-y-3">
                                <span className="px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                                    Câu {currentQ + 1} / {activeQuiz.length}
                                </span>
                                {!reviewMode ? (
                                    <div className={`text-3xl font-black flex items-center gap-3 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>
                                        <span className="text-xl">⏱️</span> {formatTime(timeLeft)}
                                    </div>
                                ) : (
                                    <div className="text-rose-500 font-black uppercase text-[11px] flex items-center gap-2">
                                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span> Đang xem lại bài
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => { 
                                    if(reviewMode || confirm("Hệ thống sẽ không lưu kết quả nếu bạn thoát?")) { 
                                        setActiveQuiz(null); 
                                        setQuizState(prev => ({...prev, currentQ: 0, answers: [], showResult: false, reviewMode: false})); 
                                    } 
                                }} 
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >✕</button>
                        </div>

                        {/* Nội dung câu hỏi */}
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-12">
                            {activeQuiz[currentQ].q}
                        </h3>

                        {/* Danh sách đáp án */}
                        <div className="grid grid-cols-1 gap-4 mb-16">
                            {activeQuiz[currentQ].a.map((ans, i) => {
                                const isSelected = answers[currentQ] === i;
                                const isCorrect = activeQuiz[currentQ].c === i;
                                
                                let btnClass = "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100";
                                if (!reviewMode) { 
                                    if (isSelected) btnClass = "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]"; 
                                } else { 
                                    if (isCorrect) btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"; 
                                    else if (isSelected) btnClass = "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200"; 
                                }

                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => !reviewMode && handleSelect(i)} 
                                        className={`w-full p-8 rounded-[2.5rem] text-left font-bold transition-all border-4 flex items-center gap-6 ${btnClass}`}
                                    >
                                        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-black shadow-sm ${isSelected ? 'bg-white/20' : 'bg-white text-slate-400'}`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span className="text-lg">{ans}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Nút điều hướng */}
                        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                            <button 
                                onClick={() => setQuizState(prev => ({...prev, currentQ: Math.max(0, prev.currentQ - 1)}))} 
                                className="px-8 py-5 bg-slate-100 rounded-[1.8rem] font-black uppercase text-[10px] hover:bg-slate-200 flex-1"
                            >Câu trước</button>
                            <button 
                                onClick={() => setQuizState(prev => ({...prev, currentQ: Math.min(activeQuiz.length - 1, prev.currentQ + 1)}))} 
                                className="px-8 py-5 bg-slate-100 rounded-[1.8rem] font-black uppercase text-[10px] hover:bg-slate-200 flex-1"
                            >Câu sau</button>
                            {!reviewMode && (
                                <button 
                                    onClick={() => confirm("Xác nhận nộp bài kiểm tra?") && handleFinish()} 
                                    className="px-12 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] shadow-2xl flex-[2]"
                                >Nộp bài</button>
                            )}
                        </div>
                    </React.Fragment>
                ) : (
                    /* Màn hình kết quả */
                    <div className="text-center py-10">
                        <div className="text-[120px] mb-8">🎉</div>
                        <h2 className="text-5xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Kết quả bài thi</h2>
                        <div className="inline-flex flex-col items-center bg-blue-50 p-12 rounded-[4rem] border-4 border-white shadow-inner mb-16">
                            <div className="text-[100px] font-black text-blue-600 leading-none">
                                {Math.round((calculateScore() / activeQuiz.length) * 100) / 10}
                            </div>
                            <div className="text-blue-400 font-black uppercase text-xs mt-4 tracking-[0.5em]">Điểm / 10</div>
                        </div>
                        <div className="flex gap-6 max-w-lg mx-auto">
                            <button 
                                onClick={() => setQuizState(prev => ({...prev, reviewMode: true, currentQ: 0}))} 
                                className="flex-1 bg-slate-100 text-slate-700 py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-200"
                            >Xem lại bài</button>
                            <button 
                                onClick={() => setActiveQuiz(null)} 
                                className="flex-1 bg-slate-900 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600"
                            >Đóng</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
