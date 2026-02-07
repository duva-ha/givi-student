function Sidebar({ tab, setTab, isFocus, setIsFocus }) {
    const menus = [
        {id: 'baigiang', icon: '📖', label: 'Bài giảng', color: 'blue'},
        {id: 'luyentap', icon: '📝', label: 'Luyện tập', color: 'orange'},
        {id: 'kiemtra', icon: '🎯', label: 'Kiểm tra', color: 'purple'},
        {id: 'tulieu', icon: '📚', label: 'Tư liệu', color: 'emerald'}
    ];

    return (
        <>
            {/* Lớp phủ mờ (Overlay): Bấm vào vùng trống bên ngoài cũng sẽ đóng Sidebar */}
            {!isFocus && (
                <div 
                    className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
                    onClick={() => setIsFocus(true)}
                ></div>
            )}

            <aside className={`fixed md:relative top-0 left-0 h-full z-[9999] flex flex-col p-6 bg-white shadow-2xl transition-all duration-500 border-r border-slate-100 
                ${isFocus ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100 w-[85%] max-w-[320px]'}`}>
                
                {/* TIÊU ĐỀ & NÚT X ĐÓNG MENU */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <div className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic uppercase">
                        E-Tech Hub
                    </div>
                    
                    {/* NÚT X - Sửa lỗi tại đây */}
                    <button 
                        onClick={() => setIsFocus(true)} 
                        className="text-slate-400 hover:text-slate-600 p-2 md:hidden"
                    >
                        <span className="text-3xl">✕</span>
                    </button>
                </div>

                <nav className="flex-1 space-y-4">
                    {menus.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => { 
                                setTab(t.id); 
                                setIsFocus(true); // Tự động đóng sau khi chọn mục
                            }} 
                            className={`w-full flex items-center gap-5 px-6 py-5 text-[14px] font-black uppercase tracking-widest rounded-2xl transition-all 
                                ${tab === t.id 
                                    ? `bg-${t.color}-600 text-white shadow-xl shadow-${t.color}-200` 
                                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <span className="text-2xl">{t.icon}</span> 
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => auth.signOut()} 
                        className="w-full py-5 text-rose-500 text-[12px] font-black uppercase tracking-tighter"
                    >
                        Thoát tài khoản
                    </button>
                </div>
            </aside>
        </>
    );
}
