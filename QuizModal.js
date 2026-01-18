function QuizModal({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, formatTime }) {
    const q = activeQuiz[quizState.currentQ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                
                {/* 1. THANH TIÊU ĐỀ & ĐỒNG HỒ */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Đang thực hiện</div>
                        <div className="font-black text-slate-800 uppercase text-sm">{q.quizTitle}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-2 rounded-2xl font-black text-lg ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button onClick={() => { if(confirm('Thoát? Kết quả sẽ không được lưu.')) setActiveQuiz(null) }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-all">✕</button>
                    </div>
                </div>

                {/* 2. NỘI DUNG CÂU HỎI */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="mb-8">
                        <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                        <h2 className="text-2xl font-bold text-slate-800 mt-6 leading-relaxed">
                            {q.q}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {q.o.map((option, idx) => {
                            const isSelected = quizState.answers[quizState.currentQ] === idx;
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSelect(idx)}
                                    className={`p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-300'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {option}
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
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-30"
                        >← Quay lại</button>
                        
                        {quizState.currentQ < activeQuiz.length - 1 ? (
                            <button 
                                onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg"
                            >Câu tiếp theo →</button>
                        ) : (
                            <button 
                                onClick={() => { if(confirm('Xác nhận nộp bài?')) handleFinish() }}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-200"
                            >Nộp bài ngay</button>
                        )}
                    </div>
                    
                    {/* Danh sách câu hỏi nhanh */}
                    <div className="hidden lg:flex gap-2 max-w-[300px] overflow-x-auto p-2">
                        {activeQuiz.map((_, i) => (
                            <div 
                                key={i} 
                                onClick={() => setQuizState({...quizState, currentQ: i})}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${quizState.currentQ === i ? 'ring-2 ring-blue-600 bg-blue-600 text-white' : quizState.answers[i] !== null ? 'bg-slate-800 text-white' : 'bg-white border text-slate-400'}`}
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
