const { useState, useEffect, useCallback } = React;

// --- COMPONENT LÀM BÀI (TỐI ƯU MOBILE & HIỆN ĐIỂM) ---
const QuizModal = ({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, setIsFocus, formatTime }) => {
    
    useEffect(() => {
        setIsFocus(true);
        return () => setIsFocus(false);
    }, []);

    // 1. MÀN HÌNH HIỂN THỊ KẾT QUẢ SAU KHI NỘP BÀI
    if (quizState.showResult) {
        return (
            <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">HOÀN THÀNH!</h2>
                    <p className="text-slate-400 font-bold mb-6 italic text-sm">Điểm của em đã được gửi tới thầy Hải</p>
                    
                    <div className="bg-blue-50 py-10 rounded-[2.5rem] mb-8 border-2 border-blue-100">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Kết quả bài làm</div>
                        <div className="text-7xl font-black text-blue-600 tracking-tighter">
                            {quizState.finalScore}
                        </div>
                        <div className="mt-4 inline-block bg-white px-4 py-1 rounded-full text-xs font-black text-blue-500 shadow-sm">
                            Đúng {quizState.correctCount} / {activeQuiz.length} câu
                        </div>
                    </div>

                    <button 
                        onClick={() => setActiveQuiz(null)}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        Đóng & Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // 2. GIAO DIỆN LÀM BÀI TRÊN ĐIỆN THOẠI
    const q = activeQuiz[quizState.currentQ];
    if (!q) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            {/* Thanh trạng thái Top */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
                <button onClick={() => confirm("Thoát bài thi sẽ không lưu kết quả?") && setActiveQuiz(null)} className="p-2 text-slate-400 text-xl">✕</button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase font-black tracking-widest text-blue-400">Thời gian</span>
                    <span className={`text-xl font-mono font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>{formatTime(timeLeft)}</span>
                </div>
                <div className="bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black border border-slate-700">
                    {quizState.currentQ + 1}/{activeQuiz.length}
                </div>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-10 bg-slate-50">
                <div className="max-w-2xl mx-auto">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${((quizState.currentQ + 1) / activeQuiz.length) * 100}%`}}></div>
                    </div>

                    <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6">
                        <h2 className="text-lg lg:text-2xl font-bold text-slate-800 leading-relaxed text-left">{q.q}</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-20">
                        {q.o.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`group flex items-center p-5 rounded-3xl border-2 text-left transition-all active:scale-[0.97] 
                                    ${quizState.answers[quizState.currentQ] === idx ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-white bg-white shadow-sm'}`}
                            >
                                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black mr-4 shrink-0 
                                    ${quizState.answers[quizState.currentQ] === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className={`font-bold text-sm lg:text-base ${quizState.answers[quizState.currentQ] === idx ? 'text-blue-700' : 'text-slate-600'}`}>{opt}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Điều hướng dưới */}
            <div className="p-4 bg-white border-t flex gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button 
                    disabled={quizState.currentQ === 0}
                    onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})}
                    className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase bg-slate-100 text-slate-400 disabled:opacity-30"
                >Quay lại</button>
                
                {quizState.currentQ === activeQuiz.length - 1 ? (
                    <button onClick={handleFinish} className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase bg-green-600 text-white shadow-lg animate-bounce">Nộp bài ngay</button>
                ) : (
                    <button onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})} className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase bg-blue-600 text-white shadow-lg">Câu tiếp theo</button>
                )}
            </div>
        </div>
    );
};

// --- APP CHÍNH ---
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

    useEffect(() => {
        if (!user) return;
        const staticData = scanData();
        const unsubscribe = db.collection("live_quizzes").doc(String(grade))
            .onSnapshot(doc => {
                let liveList = [];
                if (doc.exists) {
                    const data = doc.data();
                    const formattedQs = (data.questions || []).map(q => ({ ...q, o: q.a || q.o || [] }));
                    liveList = [{ ...data, questions: formattedQs, isLive: true }];
                }
                setLocalQuizzes(prev => ({ ...staticData, [grade]: [...liveList, ...(staticData[grade] || [])] }));
            });
        return () => unsubscribe();
    }, [grade, user, scanData]);

    useEffect(() => { auth.onAuthStateChanged(u => setUser(u)); }, []);

    useEffect(() => {
        if (localLessons[grade]?.length > 0) setLs(localLessons[grade][0]);
        else setLs(null);
    }, [grade, localLessons]);

    useEffect(() => {
        if (timeLeft === 0) { handleFinish(); return; }
        if (timeLeft === null || quizState.showResult) return;
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
        if (!activeQuiz) return;
        try {
            const score = quizState.answers.filter((ans, i) => ans === activeQuiz[i]?.c).length;
            const total = activeQuiz.length;
            const finalPoint = Math.round((score / total) * 100) / 10;
            const quizTitle = activeQuiz[0]?.quizTitle || "Kiểm tra";

            if (window.Database && window.Database.sendQuizResult) {
                await window.Database.sendQuizResult(user, grade, quizTitle, finalPoint, `${score}/${total}`);
            }
            setQuizState(prev => ({ ...prev, showResult: true, finalScore: finalPoint, correctCount: score }));
            setTimeLeft(null);
        } catch (e) { alert("Lỗi gửi điểm!"); }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-bold p-6 text-center">
            <div className="text-5xl mb-10 animate-pulse tracking-tighter italic font-black text-blue-400">E-TECH HUB</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl shadow-2xl active:scale-95 transition-all font-black uppercase text-sm">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 flex-col lg:flex-row">
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />
                
                <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                    {tab === 'baigiang' ? (
                        <>
                            <div className={`w-full lg:w-72 border-r bg-white p-4 overflow-y-auto transition-all ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, i) => (
                                    <div key={i} onClick={() => setLs(l)} className={`p-4 rounded-2xl cursor-pointer mb-2 border-2 transition-all ${ls?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 text-left">Bài {l.lessonIndex}</div>
                                        <div className="text-xs font-bold text-slate-700 leading-tight text-left">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50/50 text-left">
                                {ls ? (
                                    <div className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-[2rem] lg:rounded-[3rem] shadow-sm whitespace-pre-line leading-relaxed text-slate-700 border border-white">
                                        <h2 className="text-2xl lg:text-3xl font-black mb-8 text-slate-900 leading-tight">{ls.title}</h2>
                                        {ls.content}
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-slate-300 font-black tracking-widest uppercase text-center">📖 Chọn bài học bên trái</div>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-4 lg:p-10 overflow-y-auto bg-slate-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                                {(localQuizzes[grade] || []).map((q, i) => (
                                    <div key={i} className={`p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] shadow-xl border-2 transition-all group relative overflow-hidden ${q.isLive ? 'bg-orange-50 border-orange-200 ring-4 ring-orange-100' : 'bg-white border-transparent'}`}>
                                        {q.isLive && <div className="absolute top-6 right-6 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">ĐỀ TỪ THẦY</div>}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 ${q.isLive ? 'bg-orange-500 text-white shadow-lg' : 'bg-blue-50 text-blue-500'}`}>{q.isLive ? '🚀' : '📝'}</div>
                                        <div className="font-black text-slate-800 mb-8 uppercase text-[11px] leading-tight min-h-[40px] text-left">{q.isLive ? q.title : `Luyện tập Bài ${q.quizIndex}`}</div>
                                        <button 
                                            onClick={() => {
                                                const rawQs = q.questions || [];
                                                if (rawQs.length === 0) return alert("Đề chưa có câu hỏi!");
                                                const readyQs = rawQs.map(item => ({ ...item, q: item.q || "Câu hỏi lỗi", o: item.a || item.o || ["A", "B", "C", "D"], c: item.c !== undefined ? parseInt(item.c) : 0 }));
                                                setActiveQuiz(readyQs);
                                                setQuizState({currentQ:0, answers: new Array(readyQs.length).fill(null), showResult:false, reviewMode:false});
                                                setTimeLeft(q.time || 15 * 60);
                                            }} 
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                                        >Làm bài ngay</button>
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
