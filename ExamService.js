const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        // Lấy db từ window (đã khởi tạo ở config.js)
        const database = window.db; 
        
        if (!database) {
            console.error("Hệ thống chưa kết nối được Firebase!");
            return () => {}; // Trả về hàm rỗng để App.js không bị crash
        }

        // Lắng nghe đề thi mới từ ngăn tủ "quizzes"
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
                console.log("Đang đợi đề thi mới từ thầy...");
            });
    }
};
