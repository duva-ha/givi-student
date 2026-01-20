const { useState, useEffect, useCallback } = React;

function App() {
    // 1. QUẢN LÝ TRẠNG THÁI (STATES)
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

    // 2. QUÉT DỮ LIỆU TĨNH
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

    // 3. KẾT NỐI REALTIME (Bắt sóng đề thi trực tiếp từ Thầy Hải)
    useEffect(() => {
        if (!user) return;
        const staticData = scanData();

        const unsubscribe = db.collection("live_quizzes").doc(String(grade))
            .onSnapshot(doc => {
                let liveList = [];
                if (doc.exists) {
                    const data = doc.data();
                    // Chuẩn hóa câu hỏi ngay từ lúc nhận về
                    const formattedQs = (data.questions || []).map(q => ({
                        ...q,
                        o: q.a || q.o || [] // Ưu tiên 'a' từ Word, rồi đến 'o'
                    }));

                    liveList = [{ 
                        ...data, 
                        questions: formattedQs,
                        isLive: true 
                    }];
                    console.log("🚀 Đã nhận đề từ thầy:", data.title);
                }

                setLocalQuizzes(prev => ({
                    ...staticData,
                    [grade]: [...liveList, ...(staticData[grade] || [])]
                }));
            }, (err) => console.error("Lỗi kết nối:", err));

        return () => unsubscribe();
    }, [grade, user, scanData]);

    useEffect(() => { auth.onAuthStateChanged(u => setUser(u)); }, []);

    // Tự động chọn bài đầu tiên khi đổi khối
    useEffect(() => {
        if (localLessons[grade]?.length > 0) setLs(localLessons[grade][0]);
        else setLs(null);
    }, [grade, localLessons]);

    // 4. LOGIC ĐỒNG HỒ
    useEffect(() => {
        if (timeLeft === 0) { handleFinish(); return; }
        if (timeLeft === null || quizState.showResult) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, quizState.showResult]);

    // 5. CHỌN ĐÁP ÁN
    const handleSelect = (idx) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAns = [...quizState.answers];
        newAns[quizState.currentQ] = idx;
        setQuizState({ ...quizState, answers: newAns });
    };

    // 6. NỘP BÀI
    const handleFinish = async () => {
        if (!activeQuiz) return;
        try {
            const score = quizState.answers.filter((ans, i) => ans === activeQuiz[i]?.c).length;
            const total = activeQuiz.length;
            const finalPoint = Math.round((score / total) * 100) / 10;
            const quizTitle = activeQuiz[0]?.quizTitle || "Kiểm tra";

            if (window.Database && window.Database.sendQuizResult) {
                await window.Database.sendQuizResult(user, grade, quizTitle, finalPoint, `${score}/${total}`);
            }
            setQuizState(prev => ({ ...prev, showResult: true }));
            setTimeLeft(null);
        } catch (e) { alert("Lỗi gửi điểm!"); }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-bold">
            <div className="text-5xl mb-10 animate-pulse tracking-tighter italic font-black text-blue-400">E-TECH HUB</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl shadow-2xl active:scale-95 transition-all font-black uppercase text-sm">Đăng nhập Google</button>
        </div>
    );

    // 8. GIAO DIỆN CHÍNH
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />
                
                <div className="flex-1 flex overflow-hidden">
                    {tab === 'baigiang' ? (
                        <>
                            <div className={`w-72 border-r bg-white p-4 overflow-y-auto transition-all ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, i) => (
                                    <div key={i} onClick={() => setLs(l)} className={`p-4 rounded-2xl cursor-pointer mb-2 border-2 transition-all ${ls?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 text-left">Bài {l.lessonIndex}</div>
                                        <div className="text-xs font-bold text-slate-700 leading-tight text-left">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 text-left">
                                {ls ? (
                                    <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm whitespace-pre-line leading-relaxed text-slate-700 border border-white">
                                        <h2 className="text-3xl font-black mb-8 text-slate-900 leading-tight">{ls.title}</h2>
                                        {ls.content}
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-slate-300 font-black tracking-widest uppercase">📖 Chọn bài học bên trái</div>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-10 overflow-y-auto bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {(localQuizzes[grade] || []).map((q, i) => (
                                    <div key={i} className={`p-10 rounded-[3rem] shadow-xl border-2 transition-all group relative overflow-hidden ${q.isLive ? 'bg-orange-50 border-orange-200 ring-4 ring-orange-100' : 'bg-white border-transparent'}`}>
                                        {q.isLive && <div className="absolute top-6 right-6 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full animate-bounce">ĐỀ TỪ THẦY</div>}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 ${q.isLive ? 'bg-orange-500 text-white' : 'bg-blue-50 text-blue-500'}`}>{q.isLive ? '🚀' : '📝'}</div>
                                        <div className="font-black text-slate-800 mb-8 uppercase text-[11px] leading-tight min-h-[40px] text-left">{q.isLive ? q.title : `Luyện tập Bài ${q.quizIndex}`}</div>
                                        <button 
                                            onClick={() => {
                                                const rawQs = q.questions || [];
                                                if (rawQs.length === 0) return alert("Đề chưa có câu hỏi!");
                                                
                                                // CHUẨN HÓA DỮ LIỆU LẦN CUỐI TRƯỚC KHI MỞ MODAL
                                                const readyQs = rawQs.map(item => ({
                                                    ...item,
                                                    q: item.q || "Câu hỏi lỗi",
                                                    o: item.a || item.o || ["A", "B", "C", "D"],
                                                    c: item.c !== undefined ? parseInt(item.c) : 0
                                                }));

                                                setActiveQuiz(readyQs);
                                                setQuizState({currentQ:0, answers: new Array(readyQs.length).fill(null), showResult:false, reviewMode:false});
                                                setTimeLeft(q.time || 15 * 60);
                                            }} 
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                                        >
                                            Làm bài ngay
                                        </button>
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
                        setActiveQuiz={setActiveQuiz} setIsFocus={setIsFocus}
                        formatTime={(s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`}
                    />
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
