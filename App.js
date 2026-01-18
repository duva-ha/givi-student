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

    // 3. LOGIC QUÉT DỮ LIỆU TĨNH (Quét các biến toàn cục từ file JS bài giảng)
    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };
        
        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 25; i++) {
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i, id: `D${g}_B${i}` });
                
                const q = window[`LT${g}_B${i}`];
                if (q && Array.isArray(q)) {
                    resQuizzes[g].push({ 
                        questions: q, 
                        quizIndex: i, 
                        title: `Luyện tập Bài ${i}`,
                        isLive: false 
                    });
                }
            }
        });
        setLocalLessons(resLessons);
        return resQuizzes;
    }, []);

    // 4. LẮNG NGHE ĐỀ THI LIVE TỪ GIÁO VIÊN (KẾT NỐI CLOUD)
    useEffect(() => {
        if (!user) return;
        const staticQuizzes = scanData();

        // Đăng ký nhận đề từ thầy qua ExamService
        const unsubscribe = ExamService.subscribeToQuizzes(grade, (liveQuizzes) => {
            setLocalQuizzes(prev => {
                const newState = { ...staticQuizzes };
                // Trộn đề Live của thầy lên trên cùng, sau đó mới đến đề tĩnh
                newState[grade] = [...liveQuizzes, ...staticQuizzes[grade]];
                return newState;
            });
        });

        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [grade, user, scanData]);

    // Khởi tạo Auth
    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
    }, []);

    // Tự động chọn bài đầu tiên khi thay đổi Khối lớp
    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) {
            setLs(list[0]);
        } else {
            setLs(null);
        }
    }, [grade, localLessons]);

    // 5. ĐỒNG HỒ ĐẾM NGƯỢC
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

    // 6. XỬ LÝ TRẮC NGHIỆM & GỬI ĐIỂM VỀ CHO THẦY
    const handleSelect = (index) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQ] = index;
        setQuizState({ ...quizState, answers: newAnswers });
    };

    const handleFinish = async () => {
        const scoreNum = calculateScore();
        const finalGrade = Math.round((scoreNum / activeQuiz.length) * 100) / 10;
        const currentTitle = activeQuiz[0]?.quizTitle || "Bài kiểm tra";

        // Tự động gửi điểm về cho thầy qua Database.js
        await Database.sendQuizResult(user, grade, currentTitle, finalGrade, `${scoreNum}/${activeQuiz.length}`);

        setQuizState(prev => ({ ...prev, showResult: true }));
        setTimeLeft(null);
    };

    const calculateScore = () => {
        let score = 0;
        if (activeQuiz) {
            activeQuiz.forEach((q, i) => { if (quizState.answers[i] === q.c) score++; });
        }
        return score;
    };

    // GIAO DIỆN ĐĂNG NHẬP
    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-400 text-6xl font-black italic uppercase tracking-tighter drop-shadow-lg animate-pulse">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black shadow-2xl transform hover:scale-105 transition-all">
                Bắt đầu hành trình học tập
            </button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* SIDEBAR */}
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* HEADER */}
                <Header 
                    grade={grade} 
                    setGrade={setGrade} 
                    user={user} 
                    isFocus={isFocus} 
                    setIsFocus={setIsFocus} 
                />

                <div className="flex-1 overflow-hidden flex bg-white">
                    {/* KHÔNG GIAN BÀI GIẢNG */}
                    {tab === 'baigiang' && (
                        <React.Fragment>
                            <div className={`w-85 bg-slate-50 border-r border-slate-100 p-4 overflow-y-auto transition-all ${isFocus ? 'hidden' : 'block'}`}>
                                <div className="mb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục bài học</div>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-5 rounded-3xl cursor-pointer mb-3 border-2 transition-all ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-lg' : 'border-transparent hover:bg-white hover:shadow-sm'}`}>
                                        <div className="text-[9px] font-black text-blue-400 uppercase mb-1">BÀI {l.lessonIndex}</div>
                                        <div className="font-bold text-[13px] text-slate-700 leading-tight">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-50/30">
                                {ls ? (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="text-center mb-10">
                                            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">{ls.title}</h2>
                                        </div>
                                        <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-slate-200/50 text-lg border border-white whitespace-pre-line text-slate-700 leading-relaxed">
                                            {ls.content.split('---').join('\n\n')}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 font-black italic">
                                        <span className="text-8xl mb-4 opacity-20">📖</span>
                                        <p className="uppercase tracking-widest">Đang tải học liệu...</p>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    )}

                    {/* KHÔNG GIAN LUYỆN TẬP */}
                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <div className="max-w-6xl mx-auto">
                                <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📝 Hệ thống Luyện tập & Kiểm tra {grade}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(localQuizzes[grade] || []).map((item, idx) => (
                                        <div key={idx} className={`p-10 rounded-[3.5rem] shadow-xl border-2 transition-all relative group overflow-hidden ${item.isLive ? 'bg-orange-50 border-orange-200' : 'bg-white border-white'}`}>
                                            {item.isLive && (
                                                <div className="absolute top-6 right-6 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
                                                    ĐỀ TỪ THẦY
                                                </div>
                                            )}
                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black mb-8 ${item.isLive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500'}`}>
                                                {item.isLive ? '🚀' : item.quizIndex}
                                            </div>
                                            <h3 className="font-black text-slate-700 mb-8 uppercase text-xs min-h-[32px]">
                                                {item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`}
                                            </h3>
                                            <button onClick={() => {
                                                const quizTitle = item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`;
                                                const questions = item.questions.map(q => ({...q, quizTitle}));
                                                setActiveQuiz(questions);
                                                setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false});
                                                setTimeLeft(item.time || 15 * 60);
                                            }} className={`w-full py-5 rounded-[1.8rem] font-black uppercase text-[10px] shadow-lg transition-all ${item.isLive ? 'bg-orange-600 text-white hover:bg-slate-900' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                                                Bắt đầu ngay
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL TRẮC NGHIỆM */}
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
