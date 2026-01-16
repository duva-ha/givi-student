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
    const [hasMedia, setHasMedia] = useState(false);

    // State cho phần Luyện tập
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState({
        currentQ: 0,
        score: 0,
        showResult: false,
        selectedAnswer: null,
        isCorrect: null
    });

    // Hàm quét dữ liệu từ các file .js đã nạp trong index.html
    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };

        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 20; i++) {
                // Quét Bài giảng: D10_B1, D10_B2...
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i });

                // Quét Luyện tập: LT10_B1, LT10_B2...
                const q = window[`LT${g}_B${i}`];
                if (q) resQuizzes[g].push({ questions: q, quizIndex: i });
            }
        });
        setLocalLessons(resLessons);
        setLocalQuizzes(resQuizzes);
    }, []);

    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
        const timer = setInterval(scanData, 1000);
        return () => clearInterval(timer);
    }, [scanData]);

    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) {
            if (!ls || ls.grade !== grade) setLs(list[0]);
        } else setLs(null);
    }, [grade, localLessons]);

    const pages = ls ? ls.content.split('---').map(p => p.trim()) : [];
    
    useEffect(() => { 
        setSlideIndex(0); 
        setMediaIndex(1); 
        setHasMedia(false); 
    }, [ls, isFocus]);

    // Điều khiển phím bấm
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFocus || activeQuiz) return;
            if (e.key === "ArrowRight" || e.key === " ") {
                setSlideIndex(prev => Math.min(pages.length - 1, prev + 1));
                setMediaIndex(1);
            }
            if (e.key === "ArrowLeft") {
                setSlideIndex(prev => Math.max(0, prev - 1));
                setMediaIndex(1);
            }
            if (e.key === "ArrowDown") setMediaIndex(prev => prev + 1);
            if (e.key === "ArrowUp") setMediaIndex(prev => Math.max(1, prev - 1));
            if (e.key === "Escape") setIsFocus(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFocus, pages, activeQuiz]);

    // Logic Trắc nghiệm
    const handleAnswer = (index) => {
        if (quizState.selectedAnswer !== null) return;
        const correct = activeQuiz[quizState.currentQ].c;
        setQuizState({
            ...quizState,
            selectedAnswer: index,
            isCorrect: index === correct,
            score: index === correct ? quizState.score + 1 : quizState.score
        });
    };

    const nextQuestion = () => {
        if (quizState.currentQ < activeQuiz.length - 1) {
            setQuizState({
                ...quizState,
                currentQ: quizState.currentQ + 1,
                selectedAnswer: null,
                isCorrect: null
            });
        } else {
            setQuizState({ ...quizState, showResult: true });
        }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-500 text-4xl italic uppercase tracking-tighter">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold w-full max-w-xs shadow-2xl">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden relative bg-[#fdfdfb]">
            {/* SIDEBAR */}
            <aside className={`flex flex-col p-6 shadow-2xl transition-all duration-500 overflow-hidden ${isFocus ? 'w-0 p-0 opacity-0 -translate-x-full' : 'w-[260px] relative'}`}>
                <div className="mb-10 px-4 font-black text-2xl text-blue-500 italic uppercase whitespace-nowrap">E-Tech Hub</div>
                <nav className="flex-1 space-y-1 overflow-hidden">
                    {['baigiang', 'luyentap', 'kiemtra', 'tuliaeu'].map(t => (
                        <button key={t} onClick={() => { setTab(t); setIsFocus(false); }} className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'nav-active shadow-md text-white' : 'text-slate-500 hover:text-white'}`}>
                            {t === 'baigiang' ? '📖 Bài giảng' : t === 'luyentap' ? '📝 Luyện tập' : t === 'kiemtra' ? '🎯 Kiểm tra' : '📚 Tư liệu'}
                        </button>
                    ))}
                </nav>
                <button onClick={() => auth.signOut()} className="mt-auto py-4 text-slate-500 text-[10px] font-black uppercase border-t border-slate-700">Thoát</button>
            </aside>

            <main className="flex-1 bg-white relative main-container shadow-2xl overflow-hidden flex flex-col border-l border-slate-100">
                {/* HEADER CÓ AVATAR */}
                <header className="h-14 px-4 lg:px-8 border-b flex items-center justify-between bg-white/80 backdrop-blur-md z-40">
                    <div className="flex items-center gap-2 lg:gap-6">
                        <select value={grade} onChange={e=>setGrade(e.target.value)} className="bg-transparent font-black text-blue-600 text-[10px] uppercase outline-none cursor-pointer">
                            <option value="12">K12</option><option value="11">K11</option><option value="10">K10</option>
                        </select>
                        
                        {!isFocus && (
                            <div className="flex items-center gap-3 border-l pl-4 border-slate-100 animate-in fade-in duration-500">
                                <img 
                                    src={user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName} 
                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" 
                                    alt="User Avatar" 
                                />
                                <span className="hidden lg:block text-[10px] font-bold text-slate-700">{user.displayName}</span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsFocus(!isFocus)} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isFocus ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {isFocus ? '✕' : '⛶'}
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* NỘI DUNG BÀI GIẢNG */}
                    {tab === 'baigiang' && ls && (
                        <React.Fragment>
                            <div className={`w-full lg:w-80 bg-slate-50/50 border-r p-4 overflow-y-auto custom-scroll space-y-2 ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>{setLs(l); if(window.innerWidth < 768) setIsFocus(true);}} className={`p-3 rounded-xl cursor-pointer transition-all border ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                        <div className="text-[8px] font-black text-slate-300 uppercase mb-1">Bài {l.lessonIndex}</div>
                                        <div className="font-bold text-[11px] text-slate-700 leading-tight">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scroll flex flex-col items-center p-6 lg:p-12">
                                <div className={`w-full transition-all duration-500 ${isFocus ? 'max-w-full' : 'max-w-5xl'}`}>
                                    <h2 className={`font-black tracking-tighter text-slate-800 text-center uppercase mb-10 transition-all ${isFocus ? 'text-4xl' : 'text-2xl'}`}>{ls.title}</h2>
                                    <div className={`flex flex-col ${isFocus ? 'lg:flex-row' : 'flex-col'} gap-10 items-start justify-center`}>
                                        <div className="bg-slate-50 p-10 rounded-[3rem] slide-content border border-slate-100 shadow-inner flex-1 w-full" style={{ fontSize: isFocus ? '30px' : '16px' }}>
                                            <div key={`${slideIndex}-${isFocus}`} className={isFocus ? 'ppt-slide' : ''}>
                                                {isFocus ? pages[slideIndex] : ls.content.split('---').join('\n\n')}
                                            </div>
                                        </div>
                                        {isFocus && (
                                            <div className="lg:w-1/2 w-full flex justify-center animate-in zoom-in duration-500">
                                                <img 
                                                    src={`images/${ls.id}-S${slideIndex+1}-M${mediaIndex}.jpg`} 
                                                    className="media-box" 
                                                    onLoad={() => setHasMedia(true)}
                                                    onError={(e) => { e.target.style.display = 'none'; setHasMedia(false); }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )}

                    {/* NỘI DUNG LUYỆN TẬP */}
                    {tab === 'luyentap' && (
                        <div className="flex-1 p-10 bg-slate-50 overflow-y-auto custom-scroll">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-10 text-center">Hệ thống Luyện tập K{grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {localQuizzes[grade].length > 0 ? localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-blue-500 transition-all group">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-black mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">{item.quizIndex}</div>
                                        <h3 className="font-bold text-slate-700 mb-4">Luyện tập Bài {item.quizIndex}</h3>
                                        <button 
                                            onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, score:0, showResult:false, selectedAnswer:null, isCorrect:null}); }}
                                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                                        >Bắt đầu làm bài</button>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase">Chưa nạp file LT{grade}_B...js</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL TRẮC NGHIỆM */}
                {activeQuiz && (
                    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative">
                            {!quizState.showResult ? (
                                <React.Fragment>
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Câu {quizState.currentQ + 1} / {activeQuiz.length}</span>
                                        <button onClick={() => setActiveQuiz(null)} className="text-slate-300 hover:text-rose-500 font-black">✕ THOÁT</button>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">{activeQuiz[quizState.currentQ].q}</h3>
                                    <div className="space-y-3">
                                        {activeQuiz[quizState.currentQ].a.map((ans, i) => (
                                            <button 
                                                key={i} onClick={() => handleAnswer(i)}
                                                className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 ${quizState.selectedAnswer === i ? (quizState.isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}
                                            >
                                                <span className="inline-block w-8">{String.fromCharCode(65 + i)}.</span> {ans}
                                            </button>
                                        ))}
                                    </div>
                                    {quizState.selectedAnswer !== null && (
                                        <button onClick={nextQuestion} className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                                            {quizState.currentQ === activeQuiz.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                                        </button>
                                    )}
                                </React.Fragment>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-7xl mb-6">🏆</div>
                                    <h2 className="text-3xl font-black text-slate-800 uppercase mb-2">Hoàn thành!</h2>
                                    <p className="text-slate-500 font-medium mb-8">Bạn đúng {quizState.score} / {activeQuiz.length} câu.</p>
                                    <div className="text-6xl font-black text-blue-600 mb-10">{Math.round((quizState.score/activeQuiz.length)*10)} / 10</div>
                                    <button onClick={() => setActiveQuiz(null)} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest">Đóng</button>
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
