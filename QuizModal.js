function QuizModal({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, formatTime }) {
    
    // 1. Nếu không có dữ liệu, hãy đóng hẳn Modal để trả lại giao diện chính
    if (!activeQuiz || activeQuiz.length === 0) {
        setTimeout(() => setActiveQuiz(null), 0);
        return null; 
    }

    const q = activeQuiz[quizState.currentQ];

    // 2. Chặn lỗi nếu câu hỏi hiện tại bị mất dữ liệu đáp án
    if (!q || !q.o || !Array.isArray(q.o)) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl text-center shadow-2xl">
                    <p className="font-bold text-slate-800 mb-4">Dữ liệu câu hỏi không hợp lệ!</p>
                    <button onClick={() => setActiveQuiz(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl">Quay lại</button>
                </div>
            </div>
        );
    }

    // ... Toàn bộ phần return bên dưới của thầy giữ nguyên vì đã rất đẹp và chuẩn ...
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
             {/* Nội dung modal */}
        </div>
    );
}
