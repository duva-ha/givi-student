// quizzes.js
const QUIZ_DATA = {
    "10": [
        {
            id: "q10-1",
            title: "Kiểm tra Bài 1 - Lớp 10",
            time: 300, // 5 phút (tính bằng giây)
            questions: [
                { q: "Khoa học là gì?", a: ["Hệ thống tri thức", "Công cụ sản xuất", "Kỹ năng làm việc"], correct: 0 },
                { q: "Công nghệ là gì?", a: ["Lý thuyết suông", "Giải pháp thực tế", "Một loại máy móc"], correct: 1 }
            ]
        }
    ],
    "11": [
        {
            id: "q11-1",
            title: "Kiểm tra Cơ khí - Lớp 11",
            time: 600,
            questions: [
                { q: "Vật liệu nào sau đây là kim loại đen?", a: ["Đồng", "Nhôm", "Gang"], correct: 2 }
            ]
        }
    ],
    "12": [
        {
            id: "q12-1",
            title: "Kiểm tra Hệ thống điện - Lớp 12",
            time: 300,
            questions: [
                { q: "Lưới điện quốc gia gồm?", a: ["Đường dây và trạm biến áp", "Nhà máy điện", "Cả 2 phương án trên"], correct: 2 }
            ]
        },
        {
            id: "q12-2",
            title: "Kiểm tra Linh kiện điện tử",
            time: 900,
            questions: [
                { q: "Trị số điện trở được đơn vị là gì?", a: ["Ohm", "Farad", "Henry"], correct: 0 }
            ]
        }
    ]
};

// Đưa dữ liệu vào window để App truy cập được
window.E_TECH_QUIZZES = QUIZ_DATA;
