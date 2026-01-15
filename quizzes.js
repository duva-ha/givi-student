// quizzes.js
window.QUIZ_DATA = {
    "10": [
        {
            id: "q10-1",
            title: "Khảo sát kiến thức Công nghệ 10",
            time: 600, // 10 phút
            questions: [
                { q: "Lĩnh vực nào sau đây thuộc công nghệ cao?", a: ["Đúc gang", "Trồng lúa", "Công nghệ Nano", "Dệt may"], correct: 2 },
                { q: "Thiết kế kỹ thuật gồm mấy giai đoạn chính?", a: ["3", "5", "7", "9"], correct: 1 },
                // Bạn có thể thêm tiếp 18 câu khác tương tự ở đây
            ]
        }
    ],
    "11": [
        {
            id: "q11-1",
            title: "Ôn tập Động cơ đốt trong",
            time: 900, // 15 phút
            questions: [
                { q: "Chu trình làm việc của động cơ 4 kỳ gồm?", a: ["Nạp, Nén, Nổ, Xả", "Nạp, Nén, Cháy, Xả", "Hút, Nén, Đốt, Thải", "Nạp, Hút, Nén, Xả"], correct: 0 },
                { q: "Piston chuyển động tịnh tiến trong bộ phận nào?", a: ["Thanh truyền", "Trục khuỷu", "Xi lanh", "Thân máy"], correct: 2 },
            ]
        }
    ],
    "12": [
        {
            id: "q12-1",
            title: "Kiểm tra 15 phút: Linh kiện điện tử",
            time: 900,
            questions: [
                { q: "Linh kiện nào sau đây có khả năng khuếch đại tín hiệu?", a: ["Điện trở", "Tụ điện", "Transistor", "Cuộn cảm"], correct: 2 },
                { q: "Trị số điện trở được xác định bằng?", a: ["Vòng màu", "Kích thước", "Khối lượng", "Độ dẫn điện"], correct: 0 },
                { q: "Tụ điện có công dụng chính là gì?", a: ["Cản trở dòng điện", "Tích và phóng điện", "Khuếch đại dòng điện", "Chỉnh lưu dòng điện"], correct: 1 },
                { q: "Đơn vị đo của Điện dung là?", a: ["Ohm (Ω)", "Farad (F)", "Henry (H)", "Watt (W)"], correct: 1 },
                { q: "Linh kiện bán dẫn có mấy tiếp giáp P-N?", a: ["1", "2", "3", "Tùy loại"], correct: 3 },
                { q: "Điốt bán dẫn có công dụng gì?", a: ["Khuếch đại", "Chỉnh lưu", "Ổn áp", "Cả B và C"], correct: 3 },
                { q: "Triac có bao nhiêu cực?", a: ["2 cực", "3 cực", "4 cực", "5 cực"], correct: 1 },
                { q: "Ký hiệu của Tranzito loại NPN khác PNP ở điểm nào?", a: ["Mũi tên ở cực E", "Mũi tên ở cực B", "Mũi tên ở cực C", "Không có mũi tên"], correct: 0 },
                { q: "IC là tên viết tắt của?", a: ["Mạch in", "Mạch tích hợp", "Mạch logic", "Mạch số"], correct: 1 },
                { q: "Màu nào tương ứng với số 0 trong bảng mã màu điện trở?", a: ["Đen", "Nâu", "Đỏ", "Cam"], correct: 0 },
                { q: "Màu Đỏ trong vòng màu điện trở tương ứng với số?", a: ["1", "2", "3", "4"], correct: 1 },
                { q: "Linh kiện nào dùng để chặn dòng điện một chiều?", a: ["Điện trở", "Cuộn cảm", "Tụ điện", "Điốt"], correct: 2 },
                { q: "Cuộn cảm có đơn vị đo là?", a: ["Farad", "Ohm", "Henry", "Ampe"], correct: 2 },
                { q: "Tranzito có bao nhiêu lớp tiếp giáp P-N?", a: ["1", "2", "3", "4"], correct: 1 },
                { q: "Cực điều khiển của Tyristor ký hiệu là?", a: ["A", "K", "G", "B"], correct: 2 },
                { q: "Linh kiện điện tử nào dùng để ổn định điện áp một chiều?", a: ["Điốt chỉnh lưu", "Điốt Zener", "Điốt phát quang", "Điốt biến dung"], correct: 1 },
                { q: "Trong mạch chỉnh lưu cầu, cần dùng ít nhất mấy Điốt?", a: ["1", "2", "3", "4"], correct: 3 },
                { q: "Điện trở biến đổi theo nhiệt độ gọi là?", a: ["Quang điện trở", "Nhiệt điện trở", "Biến trở", "Chiết áp"], correct: 1 },
                { q: "Vạch màu thứ 4 trên điện trở 4 vòng màu chỉ?", a: ["Giá trị hàng đơn vị", "Hệ số nhân", "Sai số", "Giá trị hàng chục"], correct: 2 },
                { q: "Tác dụng của mạch lọc nguồn là?", a: ["Tăng điện áp", "San bằng độ gợn sóng", "Chỉnh lưu dòng điện", "Bảo vệ mạch điện"], correct: 1 }
            ]
        }
    ]
};

// Đưa dữ liệu lên cấp độ toàn cục để index.html có thể truy cập
window.E_TECH_QUIZZES = QUIZ_DATA;
