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
    const [quizState, setQuizState] = useState({ currentQ: 0, answers: [], showResult: false, reviewMode: false });
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

    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) { if (!ls || ls.grade !== grade) setLs(list[0]); } else setLs(null);
    }, [grade, localLessons]);

    const handleSelect = (index) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQ] = index;
        setQuizState({ ...quizState, answers: newAnswers });
    };

    const handleFinish = () => { setQuizState({ ...quizState, showResult: true }); setTimeLeft(null); };

    const calculateScore = () => {
        let score = 0;
        if (activeQuiz) {
            activeQuiz.forEach((q, i) => { if (quizState.answers[i] === q.c) score++; });
        }
        return score;
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-400 text-5xl font-black italic uppercase tracking-tighter drop-shadow-lg animate-pulse">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black shadow-2xl transform hover:scale-105 transition-all">Đăng nhập với Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* SIDEBAR */}
            <aside className={`flex flex-col p-6 bg-white shadow-2xl transition-all duration-500 border-r border-slate-100 ${isFocus ? 'w-0 p-0 opacity-0 -translate-x-full' : 'w-[280px]'}`}>
                <div className="mb-10 px-4 font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic uppercase">E-Tech Hub</div>
                <nav className="flex-1 space-y-3">
                    {[
                        {id: 'baigiang', icon: '📖', label: 'Bài giảng', color: 'blue'},
                        {id: 'luyentap', icon: '📝', label: 'Luyện tập', color: 'orange'},
                        {id: 'kiemtra', icon: '🎯', label: 'Kiểm tra', color: 'purple'},
                        {id: 'tuliaeu', icon: '📚', label: 'Tư liệu', color: 'emerald'}
                    ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setIsFocus(false); }} 
                            className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t.id ? `bg-${t.color}-600 text-white shadow-lg shadow-${t.color}-200 scale-105` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                            <span className="text-lg">{t.icon}</span> {t.label}
                        </button>
                    ))}
                </nav>
                <button onClick={() => auth.signOut()} className="mt-auto py-4 text-rose-400 text-[10px] font-black uppercase border-t border-slate-50 hover:text-rose-600">Thoát tài khoản</button>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <header className="h-16 px-8 border-b bg-white/50 backdrop-blur-xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <div className="px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <select value={grade} onChange={e=>setGrade(e.target.value)} className="font-black text-blue-600 text-[10px] uppercase outline-none bg-transparent cursor-pointer">
                                <option value="10">Khối 10</option><option value="11">Khối 11</option><option value="12">Khối 12</option>
                            </select>
                        </div>
                        
                        {/* MỚI: HIỂN THỊ LOGO VÀ TÊN NGƯỜI DÙNG */}
                        {!isFocus && (
                            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{user.displayName}</div>
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Học viên</div>
                                </div>
                                <img src={user.photoURL} className="w-9 h-9 rounded-xl border-2 border-white shadow-md" alt="Avatar" />
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsFocus(!isFocus)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shadow-inner">
                        {isFocus ? '✕' : '⛶'}
                    </button>
                </header>

                <div className="flex-1 overflow-hidden flex bg-white">
                    {tab === 'baigiang' && (
                        <React.Fragment>
                            <div className={`w-80 bg-slate-50/50 border-r border-slate-100 p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-5 rounded-2xl cursor-pointer mb-3 border-2 transition-all ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-md translate-x-1' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}>
                                        <div className="text-[9px] font-black text-blue-400 uppercase mb-1">BÀI {l.lessonIndex}</div>
                                        <div className="font-bold text-[12px] text-slate-700 leading-snug">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-slate-50/30">
                                {ls ? (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="text-center mb-12">
                                            <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200">Bài học chi tiết</span>
                                            <h2 className="text-4xl font-black text-slate-800 uppercase mt-6 tracking-tighter leading-tight">{ls.title}</h2>
                                        </div>
                                        <div className="bg-white p-10 lg:p-16 rounded-[4rem] text-left shadow-2xl shadow-slate-200/50 text-lg leading-relaxed border border-white whitespace-pre-line text-slate-700">
                                            {ls.content.split('---').join('\n\n')}
                                        </div>
                                    </div>
                                ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 font-black uppercase tracking-widest"><span className="text-6xl mb-4">📖</span> Chọn bài để học</div>}
                            </div>
                        </React.Fragment>
                    )}

                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📝 Luyện tập Kỹ thuật {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-white hover:border-orange-400 transition-all group">
                                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center text-3xl font-black mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all">{item.quizIndex}</div>
                                        <h3 className="font-black text-slate-700 mb-8 uppercase text-xs tracking-wider">Luyện tập Bài {item.quizIndex}</h3>
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(15 * 60); }} 
                                            className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 shadow-lg transition-all">Bắt đầu ngay</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'kiemtra' && (
                        <div className="flex-1 p-12 bg-slate-900 overflow-y-auto flex flex-col items-center">
                            <div className="mb-16 text-center">
                                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2">🎯 Kỳ thi Định kỳ</h2>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Hệ thống kiểm tra Khối {grade}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
                                {['HK1', 'HK2'].map(hk => {
                                    const examData = window[`KT${grade}_${hk}`];
                                    return (
                                        <div key={hk} className={`p-12 rounded-[4.5rem] border-2 transition-all text-center backdrop-blur-2xl ${examData ? 'bg-white/5 border-white/10 hover:border-purple-500 shadow-2xl' : 'opacity-20 border-white/5'}`}>
                                            <div className="text-6xl mb-8">{hk === 'HK1' ? '📝' : '🚀'}</div>
                                            <h3 className="text-2xl font-black text-white uppercase mb-2">Học Kỳ {hk.slice(-1)}</h3>
                                            {examData ? (
                                                <button onClick={() => { setActiveQuiz(examData); setQuizState({currentQ:0, answers: new Array(examData.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(45 * 60); }} 
                                                    className={`w-full ${hk === 'HK1' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-purple-600 shadow-purple-500/20'} text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 transition-all`}>Bắt đầu thi</button>
                                            ) : <div className="text-white/20 font-black text-[10px] uppercase">Đang soạn đề...</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {tab === 'tuliaeu' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📚 Kho Tư liệu K{grade}</h2>
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                {window.TLIEU_DATA && window.TLIEU_DATA.map((doc, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white flex items-start gap-6 hover:translate-y-[-4px] transition-all">
                                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📄</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm mb-2">{doc.name}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-[10px] font-black text-slate-300 uppercase">{doc.size}</span>
                                                <a href={doc.link} target="_blank" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 transition-all">Tải xuống</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {activeQuiz && (
                    <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-[5rem] p-10 lg:p-16 shadow-2xl relative overflow-y-auto max-h-[95vh] border-4 border-white/10 animate-in zoom-in duration-300">
                            {!quizState.showResult || quizState.reviewMode ? (
                                <React.Fragment>
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="space-y-3">
                                            <span className="px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                                            {!quizState.reviewMode ? (
                                                <div className={`text-3xl font-black flex items-center gap-3 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>
                                                    <span className="text-xl">⏱️</span> {formatTime(timeLeft)}
                                                </div>
                                            ) : (
                                                <div className="text-rose-500 font-black uppercase text-[11px] flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span> Đang xem lại bài
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => { if(quizState.reviewMode || confirm("Hệ thống sẽ không lưu kết quả nếu bạn thoát?")) { setActiveQuiz(null); setQuizState({currentQ:0, answers:[], showResult:false, reviewMode:false}); } }} 
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕</button>
                                    </div>

                                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight mb-12">{activeQuiz[quizState.currentQ].q}</h3>

                                    <div className="grid grid-cols-1 gap-4 mb-16">
                                        {activeQuiz[quizState.currentQ].a.map((ans, i) => {
                                            const isSelected = quizState.answers[quizState.currentQ] === i;
                                            const isCorrect = activeQuiz[quizState.currentQ].c === i;
                                            let btnClass = "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100";
                                            if (!quizState.reviewMode) { if (isSelected) btnClass = "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]"; }
                                            else { 
                                                if (isCorrect) btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"; 
                                                else if (isSelected) btnClass = "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200"; 
                                            }

                                            return (
                                                <button key={i} onClick={() => !quizState.reviewMode && handleSelect(i)} 
                                                    className={`w-full p-8 rounded-[2.5rem] text-left font-bold transition-all border-4 flex items-center gap-6 ${btnClass}`}>
                                                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-black shadow-sm ${isSelected ? 'bg-white/20' : 'bg-white text-slate-400'}`}>{String.fromCharCode(65 + i)}</span>
                                                    <span className="text-lg">{ans}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                                        <button onClick={() => setQuizState({...quizState, currentQ: Math.max(0, quizState.currentQ - 1)})} className="px-8 py-5 bg-slate-100 rounded-[1.8rem] font-black uppercase text-[10px] hover:bg-slate-200 flex-1">Câu trước</button>
                                        <button onClick={() => setQuizState({...quizState, currentQ: Math.min(activeQuiz.length-1, quizState.currentQ + 1)})} className="px-8 py-5 bg-slate-100 rounded-[1.8rem] font-black uppercase text-[10px] hover:bg-slate-200 flex-1">Câu sau</button>
                                        {!quizState.reviewMode && (
                                            <button onClick={() => confirm("Xác nhận nộp bài kiểm tra?") && handleFinish()} className="px-12 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] shadow-2xl flex-[2]">Nộp bài</button>
                                        )}
                                    </div>
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-[120px] mb-8">🎉</div>
                                    <h2 className="text-5xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Kết quả bài thi</h2>
                                    <div className="inline-flex flex-col items-center bg-blue-50 p-12 rounded-[4rem] border-4 border-white shadow-inner mb-16">
                                        <div className="text-[100px] font-black text-blue-600 leading-none">{Math.round((calculateScore()/activeQuiz.length)*100)/10}</div>
                                        <div className="text-blue-400 font-black uppercase text-xs mt-4 tracking-[0.5em]">Điểm / 10</div>
                                    </div>
                                    <div className="flex gap-6 max-w-lg mx-auto">
                                        <button onClick={() => setQuizState({...quizState, reviewMode: true, currentQ: 0})} className="flex-1 bg-slate-100 text-slate-700 py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-200">Xem lại bài</button>
                                        <button onClick={() => setActiveQuiz(null)} className="flex-1 bg-slate-900 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600">Đóng</button>
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
