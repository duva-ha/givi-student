const Database = {
    // 1. Gửi kết quả sau khi làm bài xong
    sendQuizResult: async (userData, grade, title, scoreValue, details) => {
        try {
            const db = window.db || firebase.firestore();
            
            // CHÚ Ý: Tên trường phải khớp hoàn toàn với GradeReport.js của thầy
            await db.collection("quiz_results").add({
                userName: userData.displayName,  // Sửa từ studentName thành userName
                userEmail: userData.email,      // Sửa từ studentEmail thành userEmail
                userAvatar: userData.photoURL,
                quizTitle: title,
                grade: grade,
                point: scoreValue,               // Sửa từ score thành point
                detail: details,                // Sửa từ details thành detail (không có s)
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log("✅ Điểm đã được gửi về cho Giáo viên với cấu trúc mới!");
            return true;
        } catch (e) {
            console.error("❌ Lỗi gửi điểm:", e);
            return false;
        }
    },

    // 2. Lấy các tư liệu học tập (Giữ nguyên)
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
