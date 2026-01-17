// ExamService.js
const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        // Phải có lệnh return ở đây để trả về hàm hủy đăng ký của Firebase
        return db.collection("quizzes")
            .where("grade", "==", grade)
            .orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                const liveQuizzes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    quizIndex: "LIVE",
                    isLive: true
                }));
                callback(liveQuizzes);
            }, (error) => {
                console.error("Lỗi nhận đề thi:", error);
            });
    }
};
