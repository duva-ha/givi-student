const { useState, useEffect, useCallback } = React;

function App() {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('baigiang');
    const [grade, setGrade] = useState('10');
    const [ls, setLs] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const [localLessons, setLocalLessons] = useState({ "10": [], "11": [], "12": [] });
    const [hasMedia, setHasMedia] = useState(false);

    const scanData = useCallback(() => {
        const resLessons = { "10": [], "11": [], "12": [] };
        ["10", "11", "12"].forEach(g => {
            for (let i = 1; i <= 20; i++) {
                const d = window[`D${g}_B${i}`];
                if (d) resLessons[g].push({ ...d, lessonIndex: i });
            }
        });
        setLocalLessons(prev => JSON.stringify(prev) !== JSON.stringify(resLessons) ? resLessons : prev);
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
    
    useEffect(() => { setSlideIndex(0); setHasMedia(false); }, [ls, isFocus]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFocus) return;
            if (e.key === "ArrowRight" || e.key === " ") {
                setSlideIndex(prev => Math.min(pages.length - 1, prev + 1));
            }
            if (e.key === "ArrowLeft") {
                setSlideIndex(prev => Math.max(0, prev - 1));
            }
            if (e.key === "Escape") setIsFocus(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFocus, pages]);

    if (!user) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-bold">
            <div className="mb-8 text-blue-500 text-4xl italic font-black uppercase tracking-tighter">E-Tech Hub</div>
            <button onClick={() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold w-full max-w-xs shadow-2xl">Đăng nhập Google</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden relative bg-[#fdfdfb]">
            <aside className={`flex flex-col p-6 shadow-2xl transition-all duration-500 overflow-hidden ${isFocus ? 'w-0 p-0 opacity-0 -translate-x-full' : 'w-[260px] relative'}`}>
                <div className="mb-10 px-4 font-black text-2xl text-blue-500 italic uppercase whitespace-nowrap">E-Tech Hub</div>
                <nav className="flex-1 space-y-1 overflow-hidden">
                    {['baigiang', 'luyentap', 'kiemtra', 'tuliaeu'].map(t => (
                        <button key={t} onClick={() => { setTab(t); if(window.innerWidth < 768) setIsFocus(false); }} className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'nav-active shadow-md text-white' : 'text-slate-500 hover:text-white'}`}>
                            {t === 'baigiang' ? '📖 Bài giảng' : t === 'luyentap' ? '📝 Luyện tập' : t === 'kiemtra' ? '🎯 Kiểm tra' : '📚 Tư liệu'}
                        </button>
                    ))}
                </nav>
                <button onClick={() => auth.signOut()} className="mt-auto py-4 text-slate-500 text-[10px] font-black uppercase text-center border-t border-slate-700 whitespace-nowrap">Thoát</button>
            </aside>

            <main className="flex-1 bg-white relative main-container shadow-2xl overflow-hidden flex flex-col border-l border-slate-100">
                <header className="h-14 px-4 lg:px-8 border-b flex items-center justify-between bg-white/80 backdrop-blur-md z-40">
                     <div className="flex items-center gap-2 lg:gap-6">
                        <select value={grade} onChange={e=>setGrade(e.target.value)} className="bg-transparent font-black text-blue-600 text-[10px] uppercase outline-none cursor-pointer">
                            <option value="12">K12</option><option value="11">K11</option><option value="10">K10</option>
                        </select>
                        {!isFocus && user && (
                            <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
                                <img src={user.photoURL} className="w-6 h-6 rounded-full border border-slate-200" />
                                <span className="hidden lg:block text-[9px] font-black uppercase text-slate-400">{user.displayName}</span>
                            </div>
                        )}
                    </div>

                    {isFocus && pages.length > 1 && (
                        <div className="flex items-center gap-3 lg:gap-6 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm animate-in fade-in duration-300">
                            <button onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))} className="text-blue-600 font-bold px-2 hover:bg-white rounded">←</button>
                            <span className="text-[9px] lg:text-[11px] font-black text-slate-500 uppercase italic">Trang {slideIndex + 1} / {pages.length}</span>
                            <button onClick={() => setSlideIndex(prev => Math.min(pages.length - 1, prev + 1))} className="text-blue-600 font-bold px-2 hover:bg-white rounded">→</button>
                        </div>
                    )}

                    <button onClick={() => setIsFocus(!isFocus)} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isFocus ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {isFocus ? '✕' : '⛶'}
                    </button>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
                            
                            <div className={`flex-1 overflow-y-auto custom-scroll bg-white flex flex-col items-center ${isFocus ? 'p-2 lg:p-6' : 'p-6 lg:p-12'}`}>
                                <div className={`w-full transition-all duration-500 ${isFocus ? 'max-w-full' : 'max-w-5xl'}`}>
                                    <h2 className={`font-black tracking-tighter text-slate-800 text-center uppercase transition-all ${isFocus ? 'mb-6 text-xl lg:text-4xl' : 'mb-10 text-lg lg:text-2xl'}`}>
                                        {ls.title}
                                    </h2>

                                    <div className={`flex flex-col ${isFocus && hasMedia ? 'lg:flex-row' : 'flex-col'} gap-6 lg:gap-10 items-start justify-center`}>
                                        <div className={`${isFocus && hasMedia ? 'lg:w-1/2 w-full' : 'w-full'} bg-slate-50 p-6 lg:p-12 rounded-[2rem] lg:rounded-[3rem] slide-content border border-slate-100 text-slate-600 font-medium overflow-hidden shadow-inner`}
                                             style={{ minHeight: isFocus ? '45vh' : 'auto' }}>
                                            <div key={isFocus ? slideIndex : 'normal'} className={isFocus ? 'ppt-slide' : ''} 
                                                 style={{ fontSize: isFocus ? (window.innerWidth < 768 ? '18px' : '30px') : '16px' }}>
                                                {isFocus ? pages[slideIndex] : ls.content.split('---').join('\n\n')}
                                            </div>
                                        </div>

                                        {isFocus && (
                                            <div className={`${hasMedia ? 'lg:w-1/2 w-full' : 'hidden'} flex items-center justify-center p-2 animate-in fade-in zoom-in duration-700`}>
                                                <video src={`videos/${ls.id}-S${slideIndex + 1}.mp4`} controls autoPlay muted loop className="media-box bg-black" style={{ maxHeight: window.innerWidth < 768 ? '40vh' : '65vh' }} onLoadedData={() => setHasMedia(true)} onError={(e) => { e.target.style.display = 'none'; const img = e.target.nextSibling; if(img) img.style.display = 'block'; }} />
                                                <img src={`images/${ls.id}-S${slideIndex + 1}.jpg`} className="media-box bg-white hidden" style={{ maxHeight: window.innerWidth < 768 ? '40vh' : '65vh', objectFit: 'contain' }} onLoad={() => setHasMedia(true)} onError={(e) => { e.target.style.display = 'none'; if (!e.target.previousSibling || e.target.previousSibling.style.display === 'none') { setHasMedia(false); } }} />
                                            </div>
                                        )}
                                    </div>
                                    {isFocus && <p className="mt-8 text-center text-slate-300 font-bold text-[8px] lg:text-[10px] uppercase tracking-[0.3em] animate-pulse italic">Phím mũi tên / Space để chuyển Slide • Esc để thoát</p>}
                                </div>
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </main>
        </div>
    );
}
