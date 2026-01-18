// 1. Cấu hình thông số Firebase (Giữ nguyên thông số của thầy)
const firebaseConfig = {
    apiKey: "AIzaSyAV-XVaOyUiq1c-29VTaWjLKcEXrssnnTE",
    authDomain: "qlhs10a7.firebaseapp.com",
    projectId: "qlhs10a7",
    storageBucket: "qlhs10a7.firebasestorage.app",
    messagingSenderId: "584229565603",
    appId: "1:584229565603:web:d47a10f0a512a1a309bb16"
};

// 2. Khởi tạo Firebase nếu chưa có
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. ĐỊNH NGHĨA BIẾN TOÀN CỤC (QUAN TRỌNG NHẤT)
// Việc dùng window. giúp các file nạp sau như Database.js hay ExamService.js 
// có thể tìm thấy 'db' và 'auth' ngay lập tức mà không bị lỗi trắng trang.
window.db = firebase.firestore();
window.auth = firebase.auth();

// 4. Tạo các biến tắt để dùng nhanh trong các file khác
const db = window.db;
const auth = window.auth;

console.log("🚀 Giviso Cloud: Firebase đã sẵn sàng!");
