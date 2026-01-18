// Header.js
function Header({ grade, setGrade, user, isFocus, setIsFocus }) {
    return (
        <header className="h-16 px-8 border-b bg-white/50 backdrop-blur-xl flex items-center justify-between z-10">
            <div className="flex items-center gap-6">
                <div className="px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <select value={grade} onChange={e=>setGrade(e.target.value)} className="font-black text-blue-600 text-[10px] uppercase outline-none bg-transparent cursor-pointer">
                        <option value="10">Khối 10</option>
                        <option value="11">Khối 11</option>
                        <option value="12">Khối 12</option>
                    </select>
                </div>
                {!isFocus && user && (
                    <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{user.displayName}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Học viên</div>
                        </div>
                        <img src={user.photoURL} className="w-9 h-9 rounded-xl border-2 border-white shadow-md" alt="Avatar" />
                    </div>
                )}
            </div>
            <button onClick={() => setIsFocus(!isFocus)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shadow-inner">
                {isFocus ? '✕' : '⛶'}
            </button>
        </header>
    );
}
