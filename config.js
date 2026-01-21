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

// 4. HÀM GỬI ĐIỂM (QUAN TRỌNG: Để hiện kết quả lên Báo cáo giáo viên)
window.Database = {
    sendQuizResult: async (user, grade, title, point, detail) => {
        if (!user) return;
        try {
            // Gửi dữ liệu vào đúng ngăn tủ "quiz_results" mà trang Giáo viên đang đọc
            await db.collection("quiz_results").add({
                uid: user.uid,
                userName: user.displayName || "Học sinh ẩn danh",
                userEmail: user.email,
                grade: String(grade),
                quizTitle: title,
                point: parseFloat(point), // Lưu dạng số để tính trung bình cộng
                detail: detail,           // Lưu dạng "8/10"
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("✅ Đã lưu điểm thành công vào hệ thống!");
        } catch (error) {
            console.error("❌ Lỗi lưu điểm:", error);
            throw error;
        }
    }
};

// 5. Cấu hình ổn định kết nối
db.settings({ experimentalForceLongPolling: true });
