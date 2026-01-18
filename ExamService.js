// ExamService.js
const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        // Sử dụng window.db để đảm bảo biến đã được nạp từ config.js
        const database = window.db; 
        
        if (!database) {
            console.error("Chưa tìm thấy cấu hình Firebase db!");
            return;
        }

        return database.collection("quizzes")
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
                console.error("Lỗi nhận đề:", error);
            });
    }
};
