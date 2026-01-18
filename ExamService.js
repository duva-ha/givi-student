// ExamService.js - Dành cho App Học sinh
const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        const database = window.db; 
        
        if (!database) {
            console.error("Firebase chưa sẵn sàng!");
            return () => {}; 
        }

        console.log("📡 Đang lắng nghe đề thi cho khối:", grade);

        // Lắng nghe realtime từ ngăn tủ "quizzes"
        return database.collection("quizzes")
            .onSnapshot((snapshot) => {
                // Lọc dữ liệu ngay tại máy học sinh để tránh lỗi kiểu dữ liệu String/Number
                const liveQuizzes = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(quiz => {
                        // Kiểm tra nếu grade khớp (chấp nhận cả "10" và 10)
                        return String(quiz.grade) === String(grade);
                    })
                    .map(quiz => ({
                        ...quiz,
                        quizIndex: "LIVE",
                        isLive: true
                    }));

                console.log(`✅ Tìm thấy ${liveQuizzes.length} đề thi mới cho khối ${grade}`);
                callback(liveQuizzes);
            }, (error) => {
                console.error("Lỗi lắng nghe:", error);
            });
    }
};
