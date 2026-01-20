const ExamService = {
    subscribeToQuizzes: (grade, callback) => {
        const database = window.db; 
        if (!database) return () => {};

        const gradeStr = String(grade);
        // Lắng nghe TRỰC TIẾP document của khối lớp
        return database.collection("live_quizzes").doc(gradeStr)
            .onSnapshot((doc) => {
                let liveList = [];
                if (doc.exists) {
                    const data = doc.data();
                    liveList = [{ 
                        ...data, 
                        isLive: true,
                        // Quan trọng: Gán lại để App.js hiểu
                        questions: data.questions || [] 
                    }];
                }
                callback(liveList);
            });
    }
};
