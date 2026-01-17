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
    
    const [quizState, setQuizState] = useState({ 
        currentQ: 0, 
        answers: [], 
        showResult: false, 
        reviewMode: false 
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

    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) {
            if (!ls || ls.grade !== grade) setLs(list[0]);
        } else setLs(null);
    }, [grade, localLessons]);

    const handleSelect = (index) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQ] = index;
        setQuizState({ ...quizState, answers: newAnswers });
    };

    const handleFinish = () => {
        setQuizState({ ...quizState, showResult: true });
        setTimeLeft(null);
    };

    const calculateScore = () => {
        let score = 0;
        activeQuiz.forEach((q, i) => {
            if (quizState.answers[i] === q.c) score++;
        });
        return score;
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-500 text-4xl italic uppercase">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl shadow-2xl">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#fdfdfb]">
            {/* SIDEBAR CHÍNH */}
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
                    <select value={grade} onChange={e=>setGrade(e.target.value)} className="font-black text-blue-600 text-[10px] uppercase outline-none bg-transparent cursor-pointer">
                        <option value="10">Khối 10</option><option value="11">Khối 11</option><option value="12">Khối 12</option>
                    </select>
                    <button onClick={() => setIsFocus(!isFocus)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200">
                        {isFocus ? '✕' : '⛶'}
                    </button>
                </header>

                <div className="flex-1 overflow-hidden flex">
                    {/* TAB BÀI GIẢNG - ĐÃ KHÔI PHỤC DANH SÁCH BÊN TRÁI */}
                    {tab === 'baigiang' && (
                        <React.Fragment>
                            <div className={`w-80 bg-slate-50/50 border-r p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-4 rounded-2xl cursor-pointer mb-2 border transition-all ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                        <div className="text-[8px] font-black text-slate-300 uppercase mb-1">Bài {l.lessonIndex}</div>
                                        <div className="font-bold text-[11px] text-slate-700 leading-tight">{l.title}</div>
                                    </div>
                                ))}
                                {localLessons[grade].length === 0 && <p className="text-center text-slate-400 text-[10px] mt-10 uppercase font-bold">Chưa nạp bài giảng lớp {grade}</p>}
                            </div>
                            <div className="flex-1 p-12 overflow-y-auto">
                                {ls ? (
                                    <div className="max-w-4xl mx-auto">
                                        <h2 className="text-3xl font-black text-slate-800 uppercase mb-12 text-center tracking-tighter">{ls.title}</h2>
                                        <div className="bg-slate-50 p-12 rounded-[3rem] text-left shadow-inner text-lg leading-relaxed border border-slate-100 whitespace-pre-line">
                                            {ls.content.split('---').join('\n\n')}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">Chọn bài học để bắt đầu</div>
                                )}
                            </div>
                        </React.Fragment>
                    )}

                    {/* TAB LUYỆN TẬP */}
                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto text-center">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 tracking-widest">Luyện tập Khối {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:border-blue-500 transition-all">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-6">{item.quizIndex}</div>
                                        <h3 className="font-black text-slate-700 mb-6 uppercase text-xs">Luyện tập Bài {item.quizIndex}</h3>
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(15 * 60); }} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] shadow-lg">Bắt đầu</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB KIỂM TRA ĐỊNH KỲ */}
                    {tab === 'kiemtra' && (
                        <div className="flex-1 p-12 bg-slate-900 overflow-y-auto flex flex-col items-center">
                            <h2 className="text-3xl font-black text-white uppercase mb-12 tracking-widest">Kiểm tra Khối {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
                                {['HK1', 'HK2'].map(hk => {
                                    const examData = window[`KT${grade}_${hk}`];
                                    return (
                                        <div key={hk} className={`p-10 rounded-[4rem] border transition-all text-center ${examData ? 'bg-white/5 border-white/10' : 'opacity-30 border-white/5'}`}>
                                            <h3 className="text-xl font-black text-white uppercase mb-8">Kiểm tra {hk}</h3>
                                            {examData ? (
                                                <button onClick={() => { setActiveQuiz(examData); setQuizState({currentQ:0, answers: new Array(examData.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(45 * 60); }} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-xl">Bắt đầu làm bài</button>
                                            ) : <p className="text-slate-500 font-bold uppercase text-[9px]">Đang cập nhật đề...</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB TƯ LIỆU */}
                    {tab === 'tuliaeu' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">Kho Tư liệu Khối {grade}</h2>
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                {window.TLIEU_DATA && window.TLIEU_DATA.map((doc, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">📄</div>
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

                {/* MODAL LÀM BÀI / XEM LẠI */}
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
                                        <button onClick={() => { if(quizState.reviewMode || confirm("Thoát?")) { setActiveQuiz(null); setQuizState({currentQ:0, answers:[], showResult:false, reviewMode:false}); } }} className="text-slate-300 hover:text-rose-500 font-black text-xs uppercase">✕</button>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-tight">{activeQuiz[quizState.currentQ].q}</h3>
                                    <div className="space-y-4">
                                        {activeQuiz[quizState.currentQ].a.map((ans, i) => {
                                            const isSelected = quizState.answers[quizState.currentQ] === i;
                                            const isCorrect = activeQuiz[quizState.currentQ].c === i;
                                            let btnClass = "bg-slate-50 border-transparent text-slate-600";
                                            if (!quizState.reviewMode) { if (isSelected) btnClass = "bg-blue-50 border-blue-500 text-blue-700"; }
                                            else { if (isCorrect) btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700"; else if (isSelected) btnClass = "bg-rose-50 border-rose-500 text-rose-700"; }

                                            return (
                                                <button key={i} onClick={() => !quizState.reviewMode && handleSelect(i)} className={`w-full p-6 rounded-[2rem] text-left font-bold transition-all border-2 flex items-center gap-4 ${btnClass}`}>
                                                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm">{String.fromCharCode(65 + i)}</span>
                                                    {ans}
                                                    {quizState.reviewMode && isCorrect && <span className="ml-auto text-emerald-500 font-black">ĐÚNG</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <button onClick={() => setQuizState({...quizState, currentQ: Math.max(0, quizState.currentQ - 1)})} className="flex-1 py-5 bg-slate-100 rounded-[1.5rem] font-black uppercase text-[10px]">Câu trước</button>
                                        <button onClick={() => setQuizState({...quizState, currentQ: Math.min(activeQuiz.length-1, quizState.currentQ + 1)})} className="flex-1 py-5 bg-slate-100 rounded-[1.5rem] font-black uppercase text-[10px]">Câu sau</button>
                                        {!quizState.reviewMode && <button onClick={() => confirm("Nộp bài?") && handleFinish()} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-lg">Nộp bài</button>}
                                    </div>
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-8xl mb-8">🏆</div>
                                    <h2 className="text-4xl font-black text-slate-800 uppercase mb-4 tracking-tighter">Kết quả</h2>
                                    <p className="text-slate-500 font-bold mb-10 text-xl">Đúng {calculateScore()} / {activeQuiz.length} câu.</p>
                                    <div className="text-8xl font-black text-blue-600 mb-12">{Math.round((calculateScore()/activeQuiz.length)*100)/10}/10</div>
                                    <div className="flex gap-4 max-w-md mx-auto">
                                        <button onClick={() => setQuizState({...quizState, reviewMode: true, currentQ: 0})} className="flex-1 bg-slate-100 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px]">Xem lại bài</button>
                                        <button onClick={() => setActiveQuiz(null)} className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl">Đóng</button>
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
