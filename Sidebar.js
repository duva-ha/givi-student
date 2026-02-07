function Sidebar({ tab, setTab, isFocus, setIsFocus }) {
    const menus = [
        {id: 'baigiang', icon: '📖', label: 'Bài giảng', color: 'blue'},
        {id: 'luyentap', icon: '📝', label: 'Luyện tập', color: 'orange'},
        {id: 'kiemtra', icon: '🎯', label: 'Kiểm tra', color: 'purple'},
        {id: 'tulieu', icon: '📚', label: 'Tư liệu', color: 'emerald'}
    ];

    // Hàm đóng sidebar: Chuyển isFocus thành true (trạng thái tập trung làm bài)
    const closeSidebar = () => {
        if (setIsFocus) setIsFocus(true);
    };

    return (
        <React.Fragment>
            {/* 1. Lớp phủ mờ (Overlay): Xuất hiện khi Sidebar mở (isFocus = false) */}
            {!isFocus && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[10000] md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* 2. Thanh bên (Sidebar Drawer) */}
            <aside 
                className={`fixed md:relative top-0 left-0 h-screen z-[10001] flex flex-col p-6 bg-white shadow-2xl transition-all duration-500 ease-in-out border-r border-slate-100 
                ${isFocus ? '-translate-x-full invisible w-0' : 'translate-x-0 visible w-[85%] max-w-[320px]'}`}
            >
                {/* Header của Sidebar & Nút X đóng nhanh */}
                <div className="flex justify-between items-center mb-10">
                    <div className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 italic uppercase tracking-tighter">
                        E-Tech Hub
                    </div>
                    
                    {/* Nút X đóng sidebar cực to dễ bấm trên mobile */}
                    <button 
                        onClick={closeSidebar}
                        className="p-3 -mr-2 text-slate-400 active:text-indigo-600 transition-colors md:hidden"
                    >
                        <span className="text-4xl leading-none">✕</span>
                    </button>
                </div>

                {/* Danh sách Menu chính */}
                <nav className="flex-1 space-y-5 overflow-y-auto pr-2">
                    {menus.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => { 
                                setTab(t.id); 
                                closeSidebar(); // Tự động thu gọn sau khi chọn bài
                            }} 
                            className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-200 active:scale-95
                                ${tab === t.id 
                                    ? `bg-indigo-600 text-white shadow-xl shadow-indigo-200` 
                                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}
                        >
                            <span className="text-3xl">{t.icon}</span> 
                            <span className="text-sm">{t.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Chân trang Sidebar */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => {
                            if(confirm("Bạn muốn đăng xuất?")) auth.signOut();
                        }} 
                        className="w-full py-5 text-rose-500 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        🚪 Thoát tài khoản
                    </button>
                </div>
            </aside>
        </React.Fragment>
    );
}
