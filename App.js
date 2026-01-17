const { useState, useEffect, useCallback } = React;

function App() {
    // 1. CÁC STATE QUẢN LÝ HỆ THỐNG
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    
    // 2. STATE QUẢN LÝ BÀI TẬP/KIỂM TRA
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState({ currentQ: 0, answers: [], showResult: false, reviewMode: false });
    const [timeLeft, setTimeLeft] = useState(null);

    // 3. LOGIC QUÉT DỮ LIỆU TỪ CÁC FILE JS ĐÃ NẠP
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

    // 4. LOGIC ĐỒNG HỒ ĐẾM NGƯỢC
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

    // 5. CÁC HÀM XỬ LÝ TRẮC NGHIỆM
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

    // MÀN HÌNH ĐĂNG NHẬP
    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-400 text-5xl font-black italic uppercase tracking-tighter drop-shadow-lg animate-pulse">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black shadow-2xl transform hover:scale-105 transition-all">Đăng nhập với Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* GỌI SIDEBAR COMPONENT */}
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* GỌI HEADER COMPONENT */}
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />

                <div className="flex-1 overflow-hidden flex bg-white">
                    {/* NỘI DUNG CHÍNH (THẦY CÓ THỂ TÁCH TIẾP NẾU MUỐN) */}
                    {tab === 'baigiang' && (
                        <React.Fragment>
                            <div className={`w-80 bg-slate-50/50 border-r border-slate-100 p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-5 rounded-2xl cursor-pointer mb-3 border-2 transition-all ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-md' : 'bg-transparent border-transparent hover:bg-white'}`}>
                                        <div className="text-[9px] font-black text-blue-400 uppercase mb-1">BÀI {l.lessonIndex}</div>
                                        <div className="font-bold text-[12px] text-slate-700">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-50/30">
                                {ls ? (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="text-center mb-8">
                                            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{ls.title}</h2>
                                        </div>
                                        <div className="bg-white p-10 lg:p-16 rounded-[4rem] text-left shadow-2xl shadow-slate-200/50 text-lg border border-white whitespace-pre-line text-slate-700">
                                            {ls.content.split('---').join('\n\n')}
                                        </div>
                                    </div>
                                ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 font-black uppercase"><span className="text-6xl mb-4">📖</span> Chọn bài để học</div>}
                            </div>
                        </React.Fragment>
                    )}

                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📝 Luyện tập Kỹ thuật {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-white hover:border-orange-400 transition-all group">
                                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center text-3xl font-black mb-8">{item.quizIndex}</div>
                                        <h3 className="font-black text-slate-700 mb-8 uppercase text-xs">Luyện tập Bài {item.quizIndex}</h3>
                                        <button onClick={() => { setActiveQuiz(item.questions); setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(15 * 60); }} 
                                            className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase text-[10px] hover:bg-orange-500 transition-all">Bắt đầu ngay</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'kiemtra' && (
                        <div className="flex-1 p-12 bg-slate-900 overflow-y-auto flex flex-col items-center">
                            <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-16">🎯 Kỳ thi Định kỳ</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
                                {['HK1', 'HK2'].map(hk => {
                                    const examData = window[`KT${grade}_${hk}`];
                                    return (
                                        <div key={hk} className={`p-12 rounded-[4.5rem] border-2 transition-all text-center ${examData ? 'bg-white/5 border-white/10' : 'opacity-20 border-white/5'}`}>
                                            <div className="text-6xl mb-8">{hk === 'HK1' ? '📝' : '🚀'}</div>
                                            <h3 className="text-2xl font-black text-white uppercase mb-8">Học Kỳ {hk.slice(-1)}</h3>
                                            {examData ? (
                                                <button onClick={() => { setActiveQuiz(examData); setQuizState({currentQ:0, answers: new Array(examData.length).fill(null), showResult:false, reviewMode:false}); setTimeLeft(45 * 60); }} 
                                                    className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] shadow-2xl">Bắt đầu thi</button>
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
                                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex items-start gap-6 transition-all hover:scale-[1.02]">
                                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm mb-2">{doc.name}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-[10px] font-black text-slate-300 uppercase">{doc.size}</span>
                                                <a href={doc.link} target="_blank" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">Tải xuống</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* GỌI QUIZMODAL COMPONENT */}
                {activeQuiz && (
                    <QuizModal 
                        activeQuiz={activeQuiz} 
                        quizState={quizState} 
                        setQuizState={setQuizState} 
                        timeLeft={timeLeft}
                        handleSelect={handleSelect}
                        handleFinish={handleFinish}
                        calculateScore={calculateScore}
                        formatTime={formatTime}
                        setActiveQuiz={setActiveQuiz}
                    />
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
