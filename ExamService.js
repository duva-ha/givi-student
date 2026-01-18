// ExamService.js
const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        // Kiểm tra db an toàn từ window
        const database = window.db;
        
        if (!database) {
            console.error("Firebase chưa sẵn sàng!");
            return () => {}; // Trả về hàm rỗng để App.js không bị crash
        }

        try {
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
                    console.log("Đợi dữ liệu...");
                });
        } catch (e) {
            return () => {};
        }
    }
};
