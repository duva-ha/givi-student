const { useState, useEffect, useCallback } = React;

function App() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    const [activeQuiz, setActiveQuiz] = useState(null);
    
    // Nâng cấp quizState để lưu mảng đáp án học sinh chọn
    const [quizState, setQuizState] = useState({ 
        currentQ: 0, 
        answers: [], // Lưu chỉ số đáp án học sinh chọn cho từng câu
        showResult: false, 
        reviewMode: false // Chế độ xem lại bài
    });
    const [timeLeft, setTimeLeft] = useState(null);

    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };
        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 20; i++) {
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i, id: `D${g}_B${i}` });
                const q = window[`LT${g}_B${i}`];
                if (q && Array.isArray(q)) resQuizzes[g].push({ questions: q, quizIndex: i });
            }
        });
        setLocalLessons(prev => JSON.stringify(prev) !== JSON.stringify(resLessons) ? resLessons : prev);
        setLocalQuizzes(prev => JSON.stringify(prev) !== JSON.stringify(resQuizzes) ? resQuizzes : prev);
    }, []);

    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
        const timer = setInterval(scanData, 1000);
        return () => clearInterval(timer);
    }, [scanData]);

    useEffect(() => {
        if (timeLeft === null || !activeQuiz || quizState.showResult) return;
        if (timeLeft === 0) { handleFinish(); return; }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, activeQuiz, quizState.showResult]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Hàm chọn đáp án (Không chấm điểm ngay, cho phép đổi)
    const handleSelect = (index) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQ] = index;
        setQuizState({ ...quizState, answers: newAnswers });
    };

    // Hàm tính điểm cuối cùng
    const handleFinish = () => {
        setQuizState({ ...quizState, showResult: true });
        setTimeLeft(null);
    };

    // Hàm tính tổng số câu đúng
    const calculateScore = () => {
        let score = 0;
        activeQuiz.forEach((q, i) => {
            if (quizState.answers[i] === q.c) score++;
        });
        return score;
    };

    const nextQuestion = () => {
        if (quizState.currentQ < activeQuiz.length - 1) {
            setQuizState({ ...quizState, currentQ: quizState.currentQ + 1 });
        }
    };

    const prevQuestion = () => {
        if (quizState.currentQ > 0) {
            setQuizState({ ...quizState, currentQ: quizState.currentQ - 1 });
        }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
            <div className="mb-8 text-blue-500 text-4xl font-black italic uppercase">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#fdfdfb]">
            <aside className={`flex flex-col p-6 shadow-2xl transition-all duration-500 ${isFocus ? 'w-0 p-0 opacity-0' : 'w-[260px]'}`}>
                <div className="mb-10 px-4 font-black text-2xl text-blue-500 italic uppercase">E-Tech Hub</div>
                <nav className="flex-1 space-y-1">
                    {['baigiang', 'luyentap', 'kiemtra', 'tuliaeu'].map(t => (
                        <button key={t} onClick={() => { setTab(t); setIsFocus(false); }} className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {t === 'baigiang' ? '📖 Bài giảng' : t === 'luyentap' ? '📝 Luyện tập' : t === 'kiemtra' ? '🎯 Kiểm tra' : '📚 Tư liệu'}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden border-l">
                <header className="h-14 px-8 border-b flex items-center justify-between bg-white/80 backdrop-blur-md">
                    <select value={grade} onChange={e=>setGrade(e.target.value)} className="font-black text-blue-600 text-[10px] uppercase outline-none bg-transparent">
                        <option value="10">Khối 10</option><option value="11">Khối 11</option><option value="12">Khối 12</option>
                    </select>
                </header>

                <div className="flex-1 overflow-hidden flex">
                    {/* UI HIỂN THỊ CÁC TAB (GIỮ NGUYÊN NHƯ BẢN TRƯỚC) */}
                    {tab === 'baigiang' && ls && (
                         <div className="flex-1 p-12 overflow-y-auto">
                            <h2 className="text-3xl font-black text-slate-800 uppercase mb-12 text-center">{ls.title}</h2>
                            <div className="bg-slate-50 p-12 rounded-[3rem] text-left shadow-inner text-lg border max-w-4xl mx-auto">{ls.content.split('---').join('\n\n')}</div>
                         </div>
                    )}

                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center">Luyện tập K{grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:border-blue-500 transition-all group">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6"> {item.quizIndex} </div>
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(15 * 60); }} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 shadow-lg">Bắt đầu</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'kiemtra' && (
                        <div className="flex-1 p-12 bg-slate-900 overflow-y-auto flex flex-col items-center">
                            <h2 className="text-3xl font-black text-white uppercase mb-12">Kiểm tra {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
                                {['HK1', 'HK2'].map(hk => {
                                    const examData = window[`KT${grade}_${hk}`];
                                    return (
                                        <div key={hk} className={`p-10 rounded-[4rem] border transition-all text-center ${examData ? 'bg-white/5 border-white/10' : 'opacity-30'}`}>
                                            <h3 className="text-xl font-black text-white uppercase mb-8">Kiểm tra {hk}</h3>
                                            {examData && <button onClick={() => { setActiveQuiz(examData); setQuizState({currentQ:0, answers: new Array(examData.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(45 * 60); }} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px]">Bắt đầu làm bài</button>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL LÀM BÀI VÀ XEM LẠI */}
                {activeQuiz && (
                    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-3xl rounded-[4rem] p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                            {!quizState.showResult || quizState.reviewMode ? (
                                <React.Fragment>
                                    <div className="flex justify-between items-center mb-10">
                                        <div>
                                            <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                                            {!quizState.reviewMode && <div className="mt-2 font-black text-xl text-slate-700">⏱️ {formatTime(timeLeft)}</div>}
                                            {quizState.reviewMode && <div className="mt-2 font-black text-rose-500 uppercase text-[10px]">Đang xem lại bài làm</div>}
                                        </div>
                                        <button onClick={() => { if(quizState.reviewMode || confirm("Thoát?")) { setActiveQuiz(null); setQuizState({currentQ:0, answers:[], showResult:false, reviewMode:false}); } }} className="text-slate-300 hover:text-rose-500 font-black text-xs uppercase transition-all">✕ {quizState.reviewMode ? 'Đóng' : 'Thoát'}</button>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-tight">{activeQuiz[quizState.currentQ].q}</h3>
                                    <div className="space-y-4">
                                        {activeQuiz[quizState.currentQ].a.map((ans, i) => {
                                            const isSelected = quizState.answers[quizState.currentQ] === i;
                                            const isCorrect = activeQuiz[quizState.currentQ].c === i;
                                            
                                            // Màu sắc khác nhau giữa lúc làm bài và lúc xem lại
                                            let btnClass = "bg-slate-50 border-transparent text-slate-600";
                                            if (!quizState.reviewMode) {
                                                if (isSelected) btnClass = "bg-blue-50 border-blue-500 text-blue-700";
                                            } else {
                                                if (isCorrect) btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700";
                                                else if (isSelected) btnClass = "bg-rose-50 border-rose-500 text-rose-700";
                                            }

                                            return (
                                                <button key={i} onClick={() => !quizState.reviewMode && handleSelect(i)} className={`w-full p-6 rounded-[2rem] text-left font-bold transition-all border-2 flex items-center gap-4 ${btnClass}`}>
                                                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm">{String.fromCharCode(65 + i)}</span>
                                                    {ans}
                                                    {quizState.reviewMode && isCorrect && <span className="ml-auto">✔️</span>}
                                                    {quizState.reviewMode && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <button onClick={prevQuestion} className="flex-1 py-5 bg-slate-100 rounded-[1.5rem] font-black uppercase text-[10px] hover:bg-slate-200">Câu trước</button>
                                        <button onClick={nextQuestion} className="flex-1 py-5 bg-slate-100 rounded-[1.5rem] font-black uppercase text-[10px] hover:bg-slate-200">Câu sau</button>
                                        {!quizState.reviewMode && (
                                            <button onClick={() => confirm("Xác nhận nộp bài?") && handleFinish()} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-lg">Nộp bài</button>
                                        )}
                                    </div>
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-8xl mb-8 animate-bounce">🏆</div>
                                    <h2 className="text-4xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Kết quả</h2>
                                    <p className="text-slate-500 font-bold mb-10 text-xl">Đúng {calculateScore()} / {activeQuiz.length} câu.</p>
                                    <div className="text-8xl font-black text-blue-600 mb-12">{Math.round((calculateScore()/activeQuiz.length)*100)/10}/10</div>
                                    <div className="flex gap-4 max-w-md mx-auto">
                                        <button onClick={() => setQuizState({...quizState, reviewMode: true, currentQ: 0})} className="flex-1 bg-slate-100 text-slate-700 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Xem lại bài</button>
                                        <button onClick={() => setActiveQuiz(null)} className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl">Đóng</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
