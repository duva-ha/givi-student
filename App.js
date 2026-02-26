const { useState, useEffect, useCallback } = React;

// --- HÀM XÁO TRỘN MẢNG (TRỘN ĐỀ) ---
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// --- COMPONENT LÀM BÀI ---
const QuizModal = ({ activeQuiz, quizState, setQuizState, timeLeft, handleSelect, handleFinish, setActiveQuiz, setIsFocus, formatTime, allowReview }) => {
    
    useEffect(() => {
        if (setIsFocus) setIsFocus(true); 
        return () => { if (setIsFocus) setIsFocus(false); };
    }, [setIsFocus]);

    // MÀN HÌNH BÁO ĐIỂM + NÚT XEM LẠI (CÓ RÀNG BUỘC ALLOWREVIEW)
    if (quizState.showResult) {
        return (
            <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
                <div className="bg-white w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2 italic uppercase leading-none">Hoàn thành!</h2>
                    <p className="text-slate-400 font-bold mb-6 italic text-[10px] uppercase tracking-widest text-center">Kết quả đã được gửi tới thầy Hải</p>
                    
                    <div className="bg-blue-50 py-10 rounded-[2.5rem] mb-8 border-2 border-blue-100 text-center">
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-2">Số điểm đạt được</div>
                        <div className="text-7xl font-black text-blue-600 tracking-tighter">{quizState.finalScore}</div>
                        <div className="mt-4">
                            <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-blue-500 shadow-sm border border-blue-100">
                                Đúng {quizState.correctCount} / {activeQuiz.length} câu
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {allowReview ? (
                            <button 
                                onClick={() => setQuizState({...quizState, showResult: false, reviewMode: true, currentQ: 0})} 
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                🔍 Xem lại bài làm
                            </button>
                        ) : (
                            <div className="py-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Thầy chưa mở quyền xem đáp án</p>
                            </div>
                        )}
                        <button onClick={() => setActiveQuiz(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">Thoát</button>
                    </div>
                </div>
            </div>
        );
    }

    const q = activeQuiz[quizState.currentQ];
    if (!q) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col text-left overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
                <button onClick={() => confirm("Thoát bài thi?") && setActiveQuiz(null)} className="p-2 text-slate-400 text-2xl font-bold">✕</button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase font-black tracking-widest text-blue-400 italic">
                        {quizState.reviewMode ? "CHẾ ĐỘ XEM LẠI" : "Thời gian còn lại"}
                    </span>
                    <span className={`text-2xl font-mono font-black ${!quizState.reviewMode && timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                        {quizState.reviewMode ? "---" : formatTime(timeLeft)}
                    </span>
                </div>
                <div className="bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black border border-slate-700 uppercase">CÂU {quizState.currentQ + 1}/{activeQuiz.length}</div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white pt-2">
                <div className="w-full h-2 bg-slate-100 mb-2">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${((quizState.currentQ + 1) / activeQuiz.length) * 100}%`}}></div>
                </div>
                <div className="p-4 max-w-2xl mx-auto">
                    <div className="quiz-question-mobile mb-8 italic font-bold text-slate-800 leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-lg lg:text-xl text-left">{q.q}</div>
                    <div className="flex flex-col gap-4 mb-32">
                        {q.o.map((opt, idx) => {
                            let statusClass = "bg-white border-slate-50";
                            
                            // CHỈ HIỆN MÀU ĐÚNG SAI NẾU THẦY MỞ KHÓA (allowReview)
                            if (quizState.reviewMode && allowReview) {
                                if (idx === q.c) statusClass = "bg-green-100 border-green-500 text-green-700 shadow-sm shadow-green-100";
                                else if (quizState.answers[quizState.currentQ] === idx) statusClass = "bg-red-50 border-red-300 text-red-600";
                            } else if (quizState.answers[quizState.currentQ] === idx) {
                                statusClass = "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100";
                            }

                            return (
                                <button key={idx} disabled={quizState.reviewMode} onClick={() => handleSelect(idx)} 
                                    className={`flex items-center p-5 rounded-[1.8rem] border-2 text-left transition-all active:scale-[0.97] shadow-sm ${statusClass}`}>
                                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black mr-6 shrink-0 text-xl 
                                        ${quizState.answers[quizState.currentQ] === idx ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="flex-1 font-bold text-sm leading-tight">{opt}</span>
                                    
                                    {/* CHỈ HIỆN ICON NẾU THẦY MỞ KHÓA (allowReview) */}
                                    {quizState.reviewMode && allowReview && idx === q.c && <span className="text-xl ml-2">✅</span>}
                                    {quizState.reviewMode && allowReview && quizState.answers[quizState.currentQ] === idx && idx !== q.c && <span className="text-xl ml-2">❌</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t flex gap-4 shadow-2xl">
                <button disabled={quizState.currentQ === 0} onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ - 1})} className="flex-1 py-5 rounded-2xl font-black text-sm uppercase bg-slate-100 text-slate-500">Quay lại</button>
                {quizState.currentQ === activeQuiz.length - 1 ? (
                    <button onClick={quizState.reviewMode ? () => setActiveQuiz(null) : handleFinish} 
                        className={`flex-[2] py-5 rounded-2xl font-black text-sm uppercase text-white shadow-lg ${quizState.reviewMode ? 'bg-slate-900' : 'bg-green-600 animate-bounce'}`}>
                        {quizState.reviewMode ? "Hoàn tất xem" : "Nộp bài ngay"}
                    </button>
                ) : (
                    <button onClick={() => setQuizState({...quizState, currentQ: quizState.currentQ + 1})} className="flex-[2] py-5 rounded-2xl font-black text-sm uppercase bg-blue-600 text-white shadow-lg">Câu tiếp theo</button>
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
    const [stName, setStName] = useState("");
    const [stClass, setStClass] = useState("");
    const [pendingQuiz, setPendingQuiz] = useState(null);
    const [allowReview, setAllowReview] = useState(false);

    // 1. LẮNG NGHE NÚT GẠT TỪ FIREBASE
    useEffect(() => {
        const unsub = db.collection("settings").doc("quiz_config")
            .onSnapshot(doc => {
                if (doc.exists) {
                    const status = doc.data().allowReview;
                    setAllowReview(status);
                    
                    // NẾU THẦY KHÓA ĐỘT NGỘT KHI HS ĐANG XEM -> ĐẨY HS RA NGOÀI
                    if (status === false && quizState.reviewMode === true) {
                        setQuizState(prev => ({ ...prev, reviewMode: false, showResult: true }));
                        alert("Thầy đã đóng quyền xem lại đáp án.");
                    }
                }
            });
        return () => unsub();
    }, [quizState.reviewMode]);

    // 2. HÀM KIỂM TRA LÀM 1 LẦN
    const checkExamAttempt = async (email, quizTitle) => {
        try {
            const snapshot = await db.collection("quiz_results")
                .where("email", "==", email)
                .where("quizTitle", "==", quizTitle)
                .get();
            return !snapshot.empty;
        } catch (e) {
            console.error(e); return false;
        }
    };

    useEffect(() => {
        if (!activeQuiz || quizState.showResult || quizState.reviewMode) return;
        const handleCheat = () => {
            if (document.hidden || !document.hasFocus()) {
                alert("⚠️ CẢNH BÁO GIAN LẬN!\nHệ thống ghi nhận em vừa thoát màn hình làm bài.");
            }
        };
        document.addEventListener("visibilitychange", handleCheat);
        window.addEventListener("blur", handleCheat);
        return () => {
            document.removeEventListener("visibilitychange", handleCheat);
            window.removeEventListener("blur", handleCheat);
        };
    }, [activeQuiz, quizState.showResult, quizState.reviewMode]);

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
        if (timeLeft === null || quizState.showResult || quizState.reviewMode) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, quizState.showResult, quizState.reviewMode]);

    const handleSelect = (idx) => {
        if (quizState.showResult || quizState.reviewMode) return;
        const newAns = [...quizState.answers];
        newAns[quizState.currentQ] = idx;
        setQuizState({ ...quizState, answers: newAns });
    };

    const handleFinish = async () => {
        if (!activeQuiz || activeQuiz.length === 0) return;
        try {
            const score = quizState.answers.filter((ans, i) => ans === activeQuiz[i]?.c).length;
            const total = activeQuiz.length;
            const finalPoint = Math.round((score / total) * 100) / 10;
            const quizTitle = activeQuiz[0]?.quizTitle || "Kiểm tra";

            if (window.Database && window.Database.sendQuizResult) {
                const studentProfile = {
                    uid: user?.uid || "hs_" + Date.now(),
                    displayName: stName.trim() || "Học sinh ẩn danh",
                    email: user?.email || "student@gmail.com"
                };
                await window.Database.sendQuizResult(studentProfile, stClass.trim(), quizTitle, finalPoint, `${score}/${total}`);
            }
            setQuizState(prev => ({ ...prev, showResult: true, finalScore: finalPoint, correctCount: score, reviewMode: false }));
            setTimeLeft(null);
        } catch (e) { console.error("Lỗi:", e); alert("Lỗi gửi điểm!"); }
    };

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
            <div className="text-5xl mb-10 font-black text-blue-400 italic uppercase tracking-tighter">E-TECH HUB</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase shadow-2xl active:scale-95 transition-all">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 flex-col lg:flex-row text-left">
            <Sidebar tab={tab} setTab={setTab} isFocus={isFocus} setIsFocus={setIsFocus} />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Header grade={grade} setGrade={setGrade} user={user} isFocus={isFocus} setIsFocus={setIsFocus} />
                <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                    {tab === 'baigiang' ? (
                        <>
                            <div className={`w-full lg:w-72 border-r bg-white p-4 overflow-y-auto transition-all ${isFocus ? 'hidden' : 'block'}`}>
                                {localLessons[grade].map((l, i) => (
                                    <div key={i} onClick={() => setLs(l)} className={`p-4 rounded-2xl cursor-pointer mb-2 border-2 transition-all ${ls?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                                        <div className="text-[9px] font-black text-blue-500 uppercase italic">Bài {l.lessonIndex}</div>
                                        <div className="text-xs font-bold text-slate-700 leading-tight">{l.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-slate-50/50">
                                {ls ? (
                                    <div className="max-w-3xl mx-auto bg-white p-8 lg:p-12 rounded-[2rem] shadow-sm whitespace-pre-line leading-relaxed text-slate-700 border border-white">
                                        <h2 className="text-2xl font-black mb-8 text-slate-900 leading-tight italic border-b-2 border-blue-100 pb-4">{ls.title}</h2>
                                        {ls.content}
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase px-10 italic text-center">📖 Chọn bài học ở danh sách bên trái</div>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {(localQuizzes[grade] || []).map((q, i) => (
                                    <div key={i} className={`p-8 rounded-[2.5rem] shadow-xl border-2 transition-all group relative overflow-hidden ${q.isLive ? 'bg-orange-50 border-orange-200 ring-4 ring-orange-50' : 'bg-white border-transparent'}`}>
                                        <div className="font-black text-slate-800 mb-8 uppercase text-[11px] min-h-[40px] leading-tight text-left italic">{q.isLive ? q.title : `Luyện tập Bài ${q.quizIndex}`}</div>
                                        <button onClick={() => setPendingQuiz(q)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">Làm bài ngay</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* POPUP NHẬP THÔNG TIN (KIỂM TRA LƯỢT LÀM) */}
                {pendingQuiz && (
                    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-left">
                        <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 text-center">
                            <div className="text-5xl mb-6">📝</div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8">Thông tin thí sinh</h3>
                            <div className="space-y-4 mb-8 text-left">
                                <label className="text-[9px] font-black text-blue-500 uppercase ml-4 mb-1 block">Họ và tên học sinh</label>
                                <input type="text" placeholder="Ví dụ: Nguyễn Văn A" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500" value={stName} onChange={(e) => setStName(e.target.value)} />
                                <label className="text-[9px] font-black text-blue-500 uppercase ml-4 mt-4 mb-1 block">Lớp quản lý</label>
                                <input type="text" placeholder="Ví dụ: 10A7" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500" value={stClass} onChange={(e) => setStClass(e.target.value)} />
                            </div>
                            <button disabled={!stName.trim() || !stClass.trim()} onClick={async (e) => {
                                const btn = e.target; btn.disabled = true;
                                const q = pendingQuiz;
                                const title = q.isLive ? q.title : `Luyện tập Bài ${q.quizIndex}`;
                                
                                const hasDone = await checkExamAttempt(user.email, title);
                                if (hasDone) {
                                    alert(`⛔ THÔNG BÁO:\nEm đã hoàn thành bài thi này rồi. Mỗi học sinh chỉ được làm bài 1 lần duy nhất.`);
                                    setPendingQuiz(null); return;
                                }

                                let shuffledQs = shuffleArray(q.questions || []);
                                const readyQs = shuffledQs.map(item => {
                                    let opts = (item.a || item.o || []).map((text, idx) => ({ text, isCorrect: idx === item.c }));
                                    opts = shuffleArray(opts);
                                    return { ...item, q: item.q || "Lỗi", o: opts.map(o => o.text), c: opts.findIndex(o => o.isCorrect), quizTitle: title };
                                });
                                setActiveQuiz(readyQs);
                                setQuizState({currentQ:0, answers: new Array(readyQs.length).fill(null), showResult:false, reviewMode:false});
                                setTimeLeft(q.time || 15 * 60);
                                setPendingQuiz(null);
                            }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-xl disabled:opacity-30 active:scale-95 transition-all">Bắt đầu làm bài</button>
                            <button onClick={() => setPendingQuiz(null)} className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Quay lại</button>
                        </div>
                    </div>
                )}

                {activeQuiz && (
                    <QuizModal activeQuiz={activeQuiz} quizState={quizState} setQuizState={setQuizState} timeLeft={timeLeft} handleSelect={handleSelect} handleFinish={handleFinish} setActiveQuiz={setActiveQuiz} setIsFocus={setIsFocus} formatTime={(s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`} allowReview={allowReview} />
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
