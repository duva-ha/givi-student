const { useState, useEffect, useCallback } = React;

function App() {
    // 1. CÁC STATE QUẢN LÝ
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

    // 2. QUÉT DỮ LIỆU TĨNH (Từ các file D10_B1.js, LT10_B1.js...)
    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        const resQuizzes = { "10": [], "11": [], "12": [] };
        
        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 25; i++) {
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i, id: `D${g}_B${i}` });
                
                const q = window[`LT${g}_B${i}`];
                if (q) resQuizzes[g].push({ questions: q, quizIndex: i, isLive: false });
            }
        });
        setLocalLessons(resLessons);
        return resQuizzes;
    }, []);

    // 3. LẮNG NGHE ĐỀ THI TỪ THẦY (FIREBASE)
    useEffect(() => {
        if (!user) return;
        const staticData = scanData();

        const unsubscribe = ExamService.subscribeToQuizzes(grade, (liveQuizzes) => {
            setLocalQuizzes(prev => ({
                ...staticData,
                [grade]: [...liveQuizzes, ...staticData[grade]] // Đề của thầy hiện lên đầu
            }));
        });
        return () => unsubscribe && unsubscribe();
    }, [grade, user, scanData]);

    useEffect(() => { auth.onAuthStateChanged(u => setUser(u)); }, []);

    // Tự chọn bài học đầu tiên khi đổi khối lớp
    useEffect(() => {
        if (localLessons[grade]?.length > 0) setLs(localLessons[grade][0]);
    }, [grade, localLessons]);

    // 4. XỬ LÝ ĐỒNG HỒ & TRẮC NGHIỆM
    useEffect(() => {
        if (timeLeft === 0) handleFinish();
        if (!timeLeft || quizState.showResult) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, quizState.showResult]);

    const handleSelect = (idx) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAns = [...quizState.answers];
        newAns[quizState.currentQ] = idx;
        setQuizState({ ...quizState, answers: newAns });
    };

    const handleFinish = async () => {
        const score = quizState.answers.filter((a, i) => a === activeQuiz[i].c).length;
        const finalPoint = Math.round((score / activeQuiz.length) * 100) / 10;
        
        // Gửi điểm về App Giáo viên
        await Database.sendQuizResult(user, grade, activeQuiz[0].quizTitle, finalPoint, `${score}/${activeQuiz.length}`);
        
        setQuizState(prev => ({ ...prev, showResult: true }));
        setTimeLeft(null);
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-bold">
            <div className="text-4xl mb-8 animate-pulse">E-TECH HUB</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />
                
                <div className="flex-1 flex overflow-hidden">
                    {tab === 'baigiang' ? (
                        <>
                            <div className={`w-72 border-r bg-white p-4 overflow-y-auto ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, i) => (
                                    <div key={i} onClick={() => setLs(l)} className={`p-4 rounded-xl cursor-pointer mb-2 border-2 ${ls?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                                        <div className="text-[10px] font-bold text-blue-500 uppercase">Bài {l.lessonIndex}</div>
                                        <div className="text-sm font-bold text-slate-700">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto">
                                {ls && <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm whitespace-pre-line leading-relaxed">{ls.content}</div>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-10 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {localQuizzes[grade].map((q, i) => (
                                    <div key={i} className={`p-8 rounded-3xl shadow-sm border-2 ${q.isLive ? 'bg-orange-50 border-orange-200' : 'bg-white border-transparent'}`}>
                                        <div className="text-2xl mb-4">{q.isLive ? '🚀' : '📝'}</div>
                                        <div className="font-bold mb-6">{q.isLive ? q.title : `Luyện tập Bài ${q.quizIndex}`}</div>
                                        <button onClick={() => {
                                            setActiveQuiz(q.questions.map(item => ({...item, quizTitle: q.isLive ? q.title : `Bài ${q.quizIndex}`})));
                                            setQuizState({currentQ:0, answers: new Array(q.questions.length).fill(null), showResult:false, reviewMode:false});
                                            setTimeLeft(15 * 60);
                                        }} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase">Làm bài</button>
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
                        setActiveQuiz={setActiveQuiz} formatTime={(s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`}
                    />
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
