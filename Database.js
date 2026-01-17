// Database.js - Dành cho App Học sinh (Givi Student)
const Database = {
    
    // 1. Gửi kết quả sau khi làm bài xong (Gửi về ngăn tủ quiz_results)
    sendQuizResult: async (userData, grade, title, score, details) => {
        try {
            await firebase.firestore().collection("quiz_results").add({
                studentName: userData.displayName,
                studentEmail: userData.email,
                studentAvatar: userData.photoURL,
                quizTitle: title,
                grade: grade,
                score: score,
                details: details, // Ví dụ: "9/10"
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("✅ Điểm đã được gửi về cho Giáo viên!");
            return true;
        } catch (e) {
            console.error("❌ Lỗi gửi điểm:", e);
            return false;
        }
    },

    // 2. Lấy các tư liệu học tập (Nếu thầy dùng Firebase để lưu tài liệu)
    getDocuments: (grade, callback) => {
        return firebase.firestore().collection("documents")
            .where("grade", "==", grade)
            .onSnapshot((snapshot) => {
                const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(docs);
            });
    }
};
