// ExamService.js - Dành cho App Học sinh (Givi Student)
const ExamService = {
    /**
     * Lắng nghe đề thi trực tuyến từ giáo viên
     * @param {string} grade - Khối lớp (10, 11 hoặc 12)
     * @param {function} callback - Hàm xử lý dữ liệu trả về cho App.js
     */
    subscribeToQuizzes: (grade, callback) => {
        // Lấy db từ window (đã định nghĩa ở config.js)
        const database = window.db || firebase.firestore(); 
        
        if (!database) {
            console.error("❌ Firebase chưa sẵn sàng! Hãy kiểm tra config.js");
            return () => {}; 
        }

        // Đảm bảo grade luôn là chuỗi để khớp với ID Document
        const gradeStr = String(grade);
        console.log(`📡 Đang kết nối "sóng" đề thi cho Khối ${gradeStr}...`);

        /**
         * Lắng nghe trực tiếp document theo khối lớp trong ngăn tủ live_quizzes
         * Cách này giúp mỗi khối chỉ nhận duy nhất 1 đề thi đang diễn ra.
         */
        return database.collection("live_quizzes").doc(gradeStr)
            .onSnapshot((doc) => {
                let liveQuizzes = [];
                
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Kiểm tra nếu đề có danh sách câu hỏi thì mới hiển thị
                    if (data.questions && data.questions.length > 0) {
                        liveQuizzes = [{
                            ...data,
                            id: doc.id,
                            quizIndex: "LIVE", // Đánh dấu đây là đề trực tiếp
                            isLive: true,      // Kích hoạt giao diện màu cam "ĐỀ TỪ THẦY"
                            timestamp: data.createdAt // Thời gian phát đề
                        }];
                        console.log(`🚀 Đã nhận đề thi mới: "${data.title}" (${data.questions.length} câu)`);
                    }
                } else {
                    console.log(`ℹ️ Hiện tại không có đề thi trực tuyến cho Khối ${gradeStr}`);
                }

                // Trả dữ liệu về cho App.js thông qua callback
                callback(liveQuizzes);
            }, (error) => {
                console.error("❌ Lỗi kết nối Firebase:", error);
                // Nếu gặp lỗi Permission (403), thầy cần kiểm tra lại Firebase Rules
                if (error.code === 'permission-denied') {
                    alert("Lỗi quyền truy cập! Thầy Hải hãy kiểm tra lại Rules trên Firebase.");
                }
            });
    }
};
