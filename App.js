const { useState, useEffect, useCallback } = React;

function App() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [mediaIndex, setMediaIndex] = useState(1);
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState({ currentQ: 0, score: 0, showResult: false, selectedAnswer: null, isCorrect: null });

    // HÀM QUÉT DỮ LIỆU CẢI TIẾN - CỰC NHẠY
    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };

        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 20; i++) {
                // Quét Bài giảng D10_B1...
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i, id: `D${g}_B${i}` });

                // Quét Luyện tập LT10_B1...
                const q = window[`LT${g}_B${i}`];
                if (q && Array.isArray(q)) {
                    resQuizzes[g].push({ questions: q, quizIndex: i });
                }
            }
        });

        // Chỉ cập nhật nếu có sự thay đổi để tránh lag máy
        setLocalLessons(prev => JSON.stringify(prev) !== JSON.stringify(resLessons) ? resLessons : prev);
        setLocalQuizzes(prev => JSON.stringify(prev) !== JSON.stringify(resQuizzes) ? resQuizzes : prev);
    }, []);

    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
        // Quét dữ liệu mỗi 1 giây để đảm bảo không bỏ sót file nạp chậm
        const timer = setInterval(scanData, 1000);
        return () => clearInterval(timer);
    }, [scanData]);

    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) {
            if (!ls || ls.grade !== grade) setLs(list[0]);
        } else setLs(null);
    }, [grade, localLessons]);

    const pages = ls && ls.content ? ls.content.split('---').map(p => p.trim()) : [];
    
    const handleAnswer = (index) => {
        if (quizState.selectedAnswer !== null) return;
        const correct = activeQuiz[quizState.currentQ].c;
        setQuizState({ ...quizState, selectedAnswer: index, isCorrect: index === correct, score: index === correct ? quizState.score + 1 : quizState.score });
    };

    const nextQuestion = () => {
        if (quizState.currentQ < activeQuiz.length - 1) {
            setQuizState({ ...quizState, currentQ: quizState.currentQ + 1, selectedAnswer: null, isCorrect: null });
        } else { setQuizState({ ...quizState, showResult: true }); }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
            <div className="mb-8 text-blue-500 text-4xl font-black italic uppercase">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold shadow-2xl">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#fdfdfb]">
            <aside className={`flex flex-col p-6 shadow-2xl transition-all duration-500 ${isFocus ? 'w-0 p-0 opacity-0' : 'w-[260px]'}`}>
                <div className="mb-10 px-4 font-black text-2xl text-blue-500 italic uppercase">E-Tech Hub</div>
                <nav className="flex-1 space-y-1">
                    {['baigiang', 'luyentap', 'kiemtra'].map(t => (
                        <button key={t} onClick={() => { setTab(t); setIsFocus(false); }} className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {t === 'baigiang' ? '📖 Bài giảng' : t === 'luyentap' ? '📝 Luyện tập' : '🎯 Kiểm tra'}
                        </button>
                    ))}
                </nav>
                <button onClick={() => auth.signOut()} className="mt-auto py-4 text-slate-400 text-[10px] font-black uppercase border-t">Thoát</button>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden border-l">
                <header className="h-14 px-8 border-b flex items-center justify-between bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <select value={grade} onChange={e=>setGrade(e.target.value)} className="font-black text-blue-600 text-[10px] uppercase outline-none bg-transparent">
                            <option value="10">Khối 10</option><option value="11">Khối 11</option><option value="12">Khối 12</option>
                        </select>
                        {!isFocus && user && (
                            <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
                                <img src={user.photoURL} className="w-8 h-8 rounded-full border shadow-sm" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase">{user.displayName}</span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsFocus(!isFocus)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        {isFocus ? '✕' : '⛶'}
                    </button>
                </header>

                <div className="flex-1 overflow-hidden flex">
                    {tab === 'baigiang' && ls && (
                        <React.Fragment>
                            <div className={`w-80 bg-slate-50/50 border-r p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-4 rounded-2xl cursor-pointer mb-2 border transition-all ${ls.id === l.id ? 'bg-white border-blue-500 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                        <div className="text-[8px] font-black text-slate-300 uppercase mb-1">Bài {l.lessonIndex}</div>
                                        <div className="font-bold text-[11px] text-slate-700 leading-tight">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-12 overflow-y-auto">
                                <div className="max-w-4xl mx-auto text-center">
                                    <h2 className="text-3xl font-black text-slate-800 uppercase mb-12 tracking-tighter">{ls.title}</h2>
                                    <div className="bg-slate-50 p-12 rounded-[3rem] text-left shadow-inner text-lg leading-relaxed border border-slate-100">
                                        {isFocus ? pages[slideIndex] : ls.content.split('---').join('\n\n')}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )}

                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">Hệ thống Luyện tập K{grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].length > 0 ? localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:border-blue-500 transition-all group">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">{item.quizIndex}</div>
                                        <h3 className="font-black text-slate-700 mb-6 uppercase text-xs tracking-widest">Luyện tập Bài {item.quizIndex}</h3>
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, score:0, showResult:false, selectedAnswer:null, isCorrect:null}); }} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 shadow-lg transition-all">Bắt đầu bài tập</button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                                        <div className="text-5xl mb-4">📂</div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest">Chưa tìm thấy file LT{grade}_B1.js</p>
                                        <p className="text-slate-300 text-xs mt-2">Vui lòng kiểm tra lại file dữ liệu hoặc nhấn Ctrl + F5</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {activeQuiz && (
                    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
                            {!quizState.showResult ? (
                                <React.Fragment>
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                                        <button onClick={() => setActiveQuiz(null)} className="text-slate-300 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all">✕ Thoát</button>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-tight">{activeQuiz[quizState.currentQ].q}</h3>
                                    <div className="space-y-4">
                                        {activeQuiz[quizState.currentQ].a.map((ans, i) => (
                                            <button key={i} onClick={() => handleAnswer(i)} className={`w-full p-6 rounded-[2rem] text-left font-bold transition-all border-2 flex items-center gap-4 ${quizState.selectedAnswer === i ? (quizState.isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}>
                                                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm">{String.fromCharCode(65 + i)}</span>
                                                {ans}
                                            </button>
                                        ))}
                                    </div>
                                    {quizState.selectedAnswer !== null && (
                                        <button onClick={nextQuestion} className="w-full mt-10 bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200">
                                            {quizState.currentQ === activeQuiz.length - 1 ? 'Xem kết quả rực rỡ' : 'Câu tiếp theo'}
                                        </button>
                                    )}
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-8xl mb-8 animate-bounce">🏆</div>
                                    <h2 className="text-4xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Hoàn thành!</h2>
                                    <p className="text-slate-500 font-bold mb-10">Bạn đã trả lời đúng {quizState.score} / {activeQuiz.length} câu hỏi.</p>
                                    <div className="text-7xl font-black text-blue-600 mb-12">{Math.round((quizState.score/activeQuiz.length)*10)}/10</div>
                                    <button onClick={() => setActiveQuiz(null)} className="bg-slate-900 text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl">Đóng cửa sổ</button>
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
