// 1. Thông số kết nối Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAV-XVaOyUiq1c-29VTaWjLKcEXrssnnTE",
    authDomain: "qlhs10a7.firebaseapp.com",
    projectId: "qlhs10a7",
    storageBucket: "qlhs10a7.firebasestorage.app",
    messagingSenderId: "584229565603",
    appId: "1:584229565603:web:d47a10f0a512a1a309bb16"
};

// 2. Khởi tạo Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase Hub: Đã kết nối thành công!");
}

// 3. KHAI BÁO BIẾN TOÀN CỤC
window.db = firebase.firestore();
window.auth = firebase.auth();
const db = window.db;
const auth = window.auth;

// 4. HÀM GỬI ĐIỂM (BẢN CẬP NHẬT ĐỂ NHẬN HỌ TÊN & LỚP TỰ NHẬP)
window.Database = {
    sendQuizResult: async (studentProfile, className, title, point, detail) => {
        // Kiểm tra an toàn: Nếu không có dữ liệu học sinh thì không gửi
        if (!studentProfile) return;

        try {
            await db.collection("quiz_results").add({
                // Lấy UID từ Google, nếu không có thì lấy ID tạm đã tạo bên App.js
                uid: studentProfile.uid || "anonymous", 
                
                // LẤY TÊN VÀ LỚP TỪ Ô NHẬP TAY CỦA HỌC SINH
                userName: studentProfile.displayName || "Học sinh ẩn danh",
                grade: className || "Không rõ lớp", 
                
                quizTitle: title,
                point: parseFloat(point), 
                detail: detail,           
                
                // Dùng createdAt để đồng bộ với lệnh orderBy bên máy Giáo viên
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("✅ Hệ thống: Đã ghi nhận điểm của em " + studentProfile.displayName);
        } catch (error) {
            console.error("❌ Lỗi Firebase:", error);
            throw error;
        }
    }
};

// 5. Cấu hình ổn định kết nối trên GitHub Pages
db.settings({ experimentalForceLongPolling: true });
