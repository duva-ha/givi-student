// ExamService.js - Chuyên nhận đề thi từ Giáo viên
const ExamService = {
    // Hàm lắng nghe đề thi mới
    subscribeToQuizzes: (grade, callback) => {
        if (!window.db) return;

        return db.collection("quizzes")
            .where("grade", "==", grade)
            .orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                const liveQuizzes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    quizIndex: "LIVE", // Đánh dấu đề thi trực tiếp
                    isLive: true
                }));
                callback(liveQuizzes);
            }, (error) => {
                console.error("Lỗi nhận đề thi:", error);
            });
    }
};
