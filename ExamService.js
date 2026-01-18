const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        // Kiểm tra db đã sẵn sàng chưa
        const database = window.db || db; 
        return database.collection("quizzes")
            .where("grade", "==", grade)
            .orderBy("createdAt", "desc")
            .onSnapshot(s => {
                const data = s.docs.map(d => ({id: d.id, ...d.data(), isLive: true}));
                callback(data);
            });
    }
};
