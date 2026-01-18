function QuizModal({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, formatTime }) {
    
    // 1. Chặn lỗi nếu chưa có dữ liệu mảng câu hỏi
    if (!activeQuiz || activeQuiz.length === 0) return null;

    // =========================================================
    // CODE THÊM MỚI: MÀN HÌNH HIỂN THỊ KẾT QUẢ KHI NỘP BÀI XONG
    // =========================================================
    if (quizState.showResult) {
        // Tính toán nhanh số câu đúng để hiện cho học sinh xem
        const score = quizState.answers.filter((ans, i) => ans === activeQuiz[i]?.c).length;
        const point = Math.round((score / activeQuiz.length) * 100) / 10;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in zoom-in duration-300">
                <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Hoàn thành!</h2>
                    <p className="text-slate-500 font-medium mb-8">Kết quả của em đã được gửi đến thầy Hải</p>
                    
                    <div className="bg-slate-50 rounded-3xl p-6 mb-8 border-2 border-dashed border-slate-200">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm số của em</div>
                        <div className="text-5xl font-black text-blue-600">{point}</div>
                        <div className="text-sm font-bold text-slate-500 mt-2">Đúng {score} / {activeQuiz.length} câu</div>
                    </div>

                    <button 
                        onClick={() => setActiveQuiz(null)} 
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                    >
                        Đóng màn hình
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================
    // PHẦN DƯỚI ĐÂY GIỮ NGUYÊN CODE GIAO DIỆN LÀM BÀI CỦA THẦY
    // =========================================================
    const q = activeQuiz[quizState.currentQ];
    const options = q.a || q.o || [];

    if (!q || options.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 text-white p-10 text-center">
                <div>
                    <p className="text-xl mb-6">⚠️ Câu hỏi số {quizState.currentQ + 1} bị lỗi dữ liệu!</p>
                    <button onClick={() => setActiveQuiz(null)} className="px-8 py-2 bg-white text-slate-900 rounded-xl font-black">QUAY LẠI</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                
                {/* THANH TIÊU ĐỀ */}
                <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Hệ thống thi trực tuyến</div>
                        <div className="font-black text-slate-800 uppercase text-sm truncate max-w-[250px]">
                            {q.quizTitle || "Bài kiểm tra"}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-2 rounded-2xl font-black text-lg shadow-inner ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button onClick={() => { if(confirm('Thoát? Kết quả sẽ không được lưu.')) setActiveQuiz(null) }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-all font-bold">✕</button>
                    </div>
                </div>

                {/* NỘI DUNG CÂU HỎI */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-14">
                    <div className="mb-10">
                        <span className="px-5 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-blue-200">
                            CÂU {quizState.currentQ + 1} / {activeQuiz.length}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-800 mt-8 leading-relaxed">
                            {q.q}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {options.map((option, idx) => {
                            const isSelected = quizState.answers[quizState.currentQ] === idx;
                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSelect(idx)}
                                    className={`p-6 rounded-3xl border-2 text-left font-bold transition-all flex items-center gap-5 group ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-300'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-base md:text-lg">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ĐIỀU HƯỚNG */}
                <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
                    <button 
                        disabled={quizState.currentQ === 0}
                        onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})}
                        className="px-6 py-4 rounded-2xl font-bold text-slate-400 disabled:opacity-20 hover:bg-slate-200"
                    >← QUAY LẠI</button>
                    
                    {quizState.currentQ < activeQuiz.length - 1 ? (
                        <button 
                            onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})}
                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
                        >CÂU TIẾP THEO →</button>
                    ) : (
                        <button 
                            onClick={() => { if(confirm('Xác nhận nộp bài?')) handleFinish() }}
                            className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all"
                        >NỘP BÀI NGAY</button>
                    )}
                </div>
            </div>
        </div>
    );
}
