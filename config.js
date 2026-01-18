// 1. Thông số kết nối Firebase (Dùng chung với bên Giáo viên)
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

// 3. KHAI BÁO BIẾN TOÀN CỤC (QUAN TRỌNG NHẤT)
// Việc dùng window. giúp các file ExamService.js và Database.js 
// luôn tìm thấy dữ liệu ngay cả khi mạng chậm hoặc nạp file lệch nhau.
window.db = firebase.firestore();
window.auth = firebase.auth();

// Tạo biến tắt để các đoạn code cũ trong App.js vẫn chạy được
const db = window.db;
const auth = window.auth;

// 4. Cấu hình bổ sung (nếu cần)
db.settings({ experimentalForceLongPolling: true }); // Giúp kết nối ổn định hơn trên GitHub Pages
