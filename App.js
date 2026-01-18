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

    // 3. LOGIC QUÉT DỮ LIỆU TĨNH (Từ các file .js nạp trong index.html)
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

    // 4. LẮNG NGHE ĐỀ THI TỪ GIÁO VIÊN (REAL-TIME)
    useEffect(() => {
        if (!user) return;
        
        // Lấy dữ liệu tĩnh trước
        const staticQuizzes = scanData();

        // Đăng ký nhận đề thi Live từ Firebase qua ExamService
        // Chú ý: subscribeToQuizzes sẽ trả về một hàm để hủy lắng nghe khi đổi grade
        const unsubscribe = ExamService.subscribeToQuizzes(grade, (liveQuizzes) => {
            setLocalQuizzes(prev => {
                const newState = { ...staticQuizzes };
                // Ưu tiên đề của thầy (isLive) lên hàng đầu, sau đó đến đề tĩnh
                newState[grade] = [...liveQuizzes, ...staticQuizzes[grade]];
                return newState;
            });
        });

        // Cleanup: Hủy lắng nghe khi Component bị gỡ hoặc đổi khối lớp
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [grade, user, scanData]);

    // Khởi tạo Auth
    useEffect(() => {
        auth.onAuthStateChanged(u => setUser(u));
    }, []);

    // Tự động chọn bài học đầu tiên khi đổi khối lớp
    useEffect(() => {
        const list = localLessons[grade];
        if (list && list.length > 0) setLs(list[0]);
        else setLs(null);
    }, [grade, localLessons]);

    // 5. LOGIC ĐỒNG HỒ ĐẾM NGƯỢC
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

    // 6. XỬ LÝ TRẮC NGHIỆM & GỬI ĐIỂM
    const handleSelect = (index) => {
        if (quizState.showResult && !quizState.reviewMode) return;
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQ] = index;
        setQuizState({ ...quizState, answers: newAnswers });
    };

    const handleFinish = async () => {
        const scoreNum = calculateScore();
        // Tính thang điểm 10
        const finalGrade = Math.round((scoreNum / activeQuiz.length) * 100) / 10;
        const currentTitle = activeQuiz[0]?.quizTitle || "Bài luyện tập";

        // Gửi điểm về Firebase cho Giáo viên xem
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

    // MÀN HÌNH ĐĂNG NHẬP
    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-400 text-5xl font-black italic uppercase tracking-tighter drop-shadow-lg animate-pulse">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black shadow-2xl transform hover:scale-105 transition-all">Đăng nhập với Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
            {/* SIDEBAR */}
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* HEADER */}
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />

                <div className="flex-1 overflow-hidden flex bg-white">
                    {/* NỘI DUNG BÀI GIẢNG */}
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

                    {/* NỘI DUNG LUYỆN TẬP & ĐỀ THI LIVE */}
                    {tab === 'luyentap' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📝 Luyện tập & Kiểm tra K{grade}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {localQuizzes[grade].map((item, idx) => (
                                    <div key={idx} className={`p-10 rounded-[3.5rem] shadow-xl border-2 transition-all group relative overflow-hidden ${item.isLive ? 'bg-orange-50 border-orange-200 shadow-orange-100' : 'bg-white border-white'}`}>
                                        
                                        {item.isLive && (
                                            <div className="absolute top-6 right-6 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full animate-pulse shadow-lg">MỚI TỪ THẦY</div>
                                        )}
                                        
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black mb-8 ${item.isLive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500'}`}>
                                            {item.isLive ? '🚀' : item.quizIndex}
                                        </div>
                                        
                                        <h3 className="font-black text-slate-700 mb-8 uppercase text-xs leading-tight min-h-[32px]">
                                            {item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`}
                                        </h3>
                                        
                                        <button onClick={() => { 
                                            const quizTitle = item.isLive ? item.title : `Luyện tập Bài ${item.quizIndex}`;
                                            const qsWithTitle = item.questions.map(q => ({...q, quizTitle}));
                                            setActiveQuiz(qsWithTitle); 
                                            setQuizState({currentQ:0, answers: new Array(item.questions.length).fill(null), showResult:false, reviewMode:false}); 
                                            setTimeLeft(item.time || 15 * 60); 
                                        }}  
                                            className={`w-full py-5 rounded-[1.8rem] font-black uppercase text-[10px] transition-all shadow-md ${item.isLive ? 'bg-orange-600 text-white hover:bg-slate-900' : 'bg-slate-900 text-white hover:bg-orange-500'}`}>
                                            Bắt đầu ngay
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NỘI DUNG TƯ LIỆU (Kết nối TLIEU_DATA) */}
                    {tab === 'tuliaeu' && (
                        <div className="flex-1 p-12 bg-slate-50 overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 uppercase mb-12 text-center tracking-widest">📚 Kho Tư liệu K{grade}</h2>
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(window.TLIEU_DATA || []).map((doc, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex items-start gap-6 transition-all hover:scale-[1.02]">
                                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm mb-2">{doc.name}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-[10px] font-black text-slate-300 uppercase">{doc.size || 'N/A'}</span>
                                                <a href={doc.link} target="_blank" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">Tải xuống</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL LÀM BÀI TRẮC NGHIỆM */}
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
