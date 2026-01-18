const { useState, useEffect, useCallback } = React;

function App() {
    // 1. CÁC STATE QUẢN LÝ HỆ THỐNG
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false); // Trạng thái tập trung (ẩn sidebar)
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [localQuizzes, setLocalQuizzes] = useState({ "10": [], "11": [], "12": [] });
    
    // 2. STATE QUẢN LÝ BÀI TẬP/KIỂM TRA
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizState, setQuizState] = useState({ currentQ: 0, answers: [], showResult: false, reviewMode: false });
    const [timeLeft, setTimeLeft] = useState(null);

    // 3. LOGIC QUÉT DỮ LIỆU TĨNH (Từ file JS cục bộ)
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

    // 4. LẮNG NGHE ĐỀ THI LIVE TỪ GIÁO VIÊN
    useEffect(() => {
        if (!user) return;
        const staticQuizzes = scanData();

        // Đăng ký nhận đề từ thầy qua ExamService
        const unsubscribe = ExamService.subscribeToQuizzes(grade, (liveQuizzes) => {
            setLocalQuizzes(prev => {
                const newState = { ...staticQuizzes };
                // Trộn đề Live của thầy lên trên cùng
                newState[grade] = [...liveQuizzes, ...staticQuizzes[grade]];
                return newState;
            });
        });

        // Hủy lắng nghe khi đổi grade hoặc thoát
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [grade, user, scanData]);

    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
    }, []);

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

    // 6. XỬ LÝ NỘP BÀI VÀ GỬI ĐIỂM
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

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-400 text-5xl font-black italic uppercase animate-pulse">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black shadow-2xl">Đăng nhập với Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* SIDEBAR */}
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* HEADER - SỬA LỖI TRUYỀN setIsFocus TẠI ĐÂY */}
                <Header 
                    grade={grade} 
                    setGrade={setGrade} 
                    user={user} 
                    isFocus={isFocus} 
                    setIsFocus={setIsFocus} 
                />

                <div className="flex-1 overflow-hidden flex bg-white">
                    {tab === 'baigiang' && (
                        <React.Fragment>
                            <div className={`w-80 bg-slate-50 border-r p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, idx) => (
                                    <div key={idx} onClick={()=>setLs(l)} className={`p-5 rounded-2xl cursor-pointer mb-3 border-2 transition-all ${ls?.id === l.id ? 'bg-white border-blue-500 shadow-md' : 'border-transparent hover:bg-white'}`}>
                                        <div className="text-[9px] font-black text-blue-400 uppercase">BÀI {l.lessonIndex}</div>
                                        <div className="font-bold text-[12px] text-slate-700">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                {ls ? (
                                    <div className="max-w-4xl mx-auto">
                                        <h2 className="text-4xl font-black text-center mb-8 uppercase">{ls.title}</h2>
                                        <div className="bg-white p-10 rounded-[3rem] shadow-xl whitespace-pre-line text-slate-700 text-lg">
                                            {ls.content.split('---').join('\n\n')}
                                        </div>
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-slate-300 font-black">📖 CHỌN BÀI ĐỂ HỌC</div>}
                            </div>
                        </React.Fragment>
                    )}

                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-center mb-12 uppercase">📝 Luyện tập & Kiểm tra {grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className={`p-10 rounded-[3.5rem] shadow-xl border-2 transition-all relative ${item.isLive ? 'bg-orange-50 border-orange-200' : 'bg-white border-white'}`}>
                                        {item.isLive && <div className="absolute top-6 right-6 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full animate-bounce">ĐỀ TỪ THẦY</div>}
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black mb-8 ${item.isLive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500'}`}>{item.isLive ? '🚀' : item.quizIndex}</div>
                                        <h3 className="font-black text-slate-700 mb-8 uppercase text-xs">{item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`}</h3>
                                        <button onClick={() => {
                                            const questions = item.questions.map(q => ({...q, quizTitle: item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`}));
                                            setActiveQuiz(questions);
                                            setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false});
                                            setTimeLeft(item.time || 15 * 60);
                                        }} className={`w-full py-5 rounded-[1.8rem] font-black uppercase text-[10px] ${item.isLive ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white'}`}>Bắt đầu ngay</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {activeQuiz && (
                    <QuizModal 
                        activeQuiz={activeQuiz} quizState={quizState} setQuizState={setQuizState} 
                        timeLeft={timeLeft} handleSelect={handleSelect} handleFinish={handleFinish} 
                        calculateScore={calculateScore} formatTime={formatTime} setActiveQuiz={setActiveQuiz}
                    />
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
