// Database.js - Dành cho App Học sinh (Givi Student)
const Database = {
    
    // 1. Gửi kết quả sau khi làm bài xong
    sendQuizResult: async (userData, grade, title, score, details) => {
        try {
            // Sử dụng window.db nếu đã định nghĩa ở config.js hoặc dùng trực tiếp firebase.firestore()
            const db = window.db || firebase.firestore();
            
            await db.collection("quiz_results").add({
                studentName: userData.displayName,
                studentEmail: userData.email,
                studentAvatar: userData.photoURL,
                quizTitle: title,
                grade: grade,
                score: score,
                details: details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("✅ Điểm đã được gửi về cho Giáo viên!");
            return true;
        } catch (e) {
            console.error("❌ Lỗi gửi điểm:", e);
            return false;
        }
    },

    // 2. Lấy các tư liệu học tập
    getDocuments: (grade, callback) => {
        const db = window.db || firebase.firestore();
        return db.collection("documents")
            .where("grade", "==", grade)
            .onSnapshot((snapshot) => {
                const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(docs);
            }, (error) => {
                console.error("Lỗi lấy tài liệu:", error);
            });
    }
};
