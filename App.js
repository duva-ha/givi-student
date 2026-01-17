const { useState, useEffect, useCallback } = React;

function App() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState({ currentQ: 0, score: 0, showResult: false, selectedAnswer: null, isCorrect: null });
    const [timeLeft, setTimeLeft] = useState(null);

    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };
        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 20; i++) {
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i, id: `D${g}_B${i}` });
                const q = window[`LT${g}_B${i}`];
                if (q && Array.isArray(q)) { resQuizzes[g].push({ questions: q, quizIndex: i }); }
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
        if (timeLeft === 0) { setQuizState(prev => ({ ...prev, showResult: true })); return; }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, activeQuiz, quizState.showResult]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) {
            if (!ls || ls.grade !== grade) setLs(list[0]);
        } else setLs(null);
    }, [grade, localLessons]);

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
                    {['baigiang', 'luyentap', 'kiemtra', 'tuliaeu'].map(t => (
                        <button key={t} onClick={() => { setTab(t); setIsFocus(false); }} className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                            {t === 'baigiang' ? '📖 Bài giảng' : t === 'luyentap' ? '📝 Luyện tập' : t === 'kiemtra' ? '🎯 Kiểm tra' : '📚 Tư liệu'}
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
                                <h2 className="text-3xl font-black text-slate-800 uppercase mb-12 text-center tracking-tighter">{ls.title}</h2>
                                <div className="bg-slate-50 p-12 rounded-[3rem] text-left shadow-inner text-lg leading-relaxed border max-w-4xl mx-auto">
                                    {ls.content.split('---').join('\n\n')}
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
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, score:0, showResult:false, selectedAnswer:null, isCorrect:null}); const mins = item.quizIndex === 1 ? 15 : (item.quizIndex === 2 ? 20 : 15); setTimeLeft(mins * 60); }} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 shadow-lg transition-all">Bắt đầu bài tập</button>
                                    </div>
                                )) : <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100"><p className="text-slate-400 font-black uppercase">Chưa có dữ liệu bài tập</p></div>}
                            </div>
                        </div>
                    )}

                    {/* MỚI: TAB KIỂM TRA ĐỊNH KỲ */}
                    {tab === 'kiemtra' && (
                        <div className="flex-1 p-12 bg-slate-900 overflow-y-auto flex flex-col items-center">
                            <h2 className="text-3xl font-black text-white uppercase mb-12 tracking-widest">Kế hoạch Kiểm tra {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
                                {['HK1', 'HK2'].map(hk => (
                                    <div key={hk} className="bg-white/5 backdrop-blur-xl p-10 rounded-[4rem] border border-white/10 text-center hover:bg-white/10 transition-all">
                                        <div className="text-5xl mb-6">{hk === 'HK1' ? '📝' : '🚀'}</div>
                                        <h3 className="text-xl font-black text-white uppercase mb-2">Kiểm tra {hk}</h3>
                                        <p className="text-slate-400 mb-8 text-xs font-bold uppercase tracking-widest">Thời gian: 45 Phút</p>
                                        <button 
                                            onClick={() => {
                                                const data = window[`KT${grade}_${hk}`];
                                                if(data) {
                                                    setActiveQuiz(data);
                                                    setQuizState({currentQ:0, score:0, showResult:false, selectedAnswer:null, isCorrect:null});
                                                    setTimeLeft(45 * 60);
                                                } else alert(`Chưa nạp file KT${grade}_${hk}.js`);
                                            }}
                                            className={`w-full ${hk === 'HK1' ? 'bg-blue-600' : 'bg-emerald-600'} text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:opacity-80 shadow-xl`}
                                        >Bắt đầu làm bài</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'tuliaeu' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">Kho Tư liệu K{grade}</h2>
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                {window.TLIEU_DATA && window.TLIEU_DATA.map((doc, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">{doc.type === 'PDF' ? '📄' : '📁'}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm mb-1">{doc.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-400 uppercase">{doc.size}</span>
                                                <a href={doc.link} target="_blank" className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all">Tải tài liệu</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                        <div className="flex flex-col gap-2">
                                            <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                                            <div className={`font-black text-xl flex items-center gap-2 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>⏱️ {formatTime(timeLeft)}</div>
                                        </div>
                                        <button onClick={() => { if(confirm("Nộp bài sớm?")) { setQuizState({...quizState, showResult:true}); setTimeLeft(null); } }} className="text-slate-300 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all">✕ Nộp bài</button>
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
                                        <button onClick={nextQuestion} className="w-full mt-10 bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">
                                            {quizState.currentQ === activeQuiz.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                                        </button>
                                    )}
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-8xl mb-8">🏆</div>
                                    <h2 className="text-4xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Hoàn thành!</h2>
                                    <p className="text-slate-500 font-bold mb-10">Đúng {quizState.score} / {activeQuiz.length} câu.</p>
                                    <div className="text-7xl font-black text-blue-600 mb-12">{Math.round((quizState.score/activeQuiz.length)*10)}/10</div>
                                    <button onClick={() => { setActiveQuiz(null); setTimeLeft(null); }} className="bg-slate-900 text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl">Đóng</button>
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
