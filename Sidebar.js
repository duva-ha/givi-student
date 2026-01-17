function Sidebar({ tab, setTab, isFocus, setIsFocus }) {
    const menus = [
        {id: 'baigiang', icon: '📖', label: 'Bài giảng', color: 'blue'},
        {id: 'luyentap', icon: '📝', label: 'Luyện tập', color: 'orange'},
        {id: 'kiemtra', icon: '🎯', label: 'Kiểm tra', color: 'purple'},
        {id: 'tuliaeu', icon: '📚', label: 'Tư liệu', color: 'emerald'}
    ];

    return (
        <aside className={`flex flex-col p-6 bg-white shadow-2xl transition-all duration-500 border-r border-slate-100 ${isFocus ? 'w-0 p-0 opacity-0 -translate-x-full' : 'w-[280px]'}`}>
            <div className="mb-10 px-4 font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic uppercase">E-Tech Hub</div>
            <nav className="flex-1 space-y-3">
                {menus.map(t => (
                    <button key={t.id} onClick={() => { setTab(t.id); setIsFocus(false); }} 
                        className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t.id ? `bg-${t.color}-600 text-white shadow-lg shadow-${t.color}-200 scale-105` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                        <span className="text-lg">{t.icon}</span> {t.label}
                    </button>
                ))}
            </nav>
            <button onClick={() => auth.signOut()} className="mt-auto py-4 text-rose-400 text-[10px] font-black uppercase border-t border-slate-50 hover:text-rose-600">Thoát tài khoản</button>
        </aside>
    );
}
