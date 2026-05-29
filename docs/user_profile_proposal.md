# BẢN ĐỀ XUẤT THIẾT KẾ TRANG HỒ SƠ NGƯỜI DÙNG (USER PROFILE DESIGN PROPOSAL)

Bản tài liệu này phác thảo giải pháp thiết kế giao diện (Frontend) và đặc tả API hệ thống (Backend) cho trang **Hồ sơ cá nhân (User Profile)** của nền tảng **AlgoTutor**. 

Mục tiêu thiết kế nhằm hướng tới một trải nghiệm cao cấp, mang đậm tính **Gamification** (game hóa học tập) nhằm tạo động lực mạnh mẽ cho học viên thông qua việc theo dõi tiến độ chi tiết, cấp độ lập trình viên (XP/Level), chuỗi ngày học liên tục (Streak), và các huy hiệu thành tích độc đáo.

---

## I. MOCKUP THIẾT KẾ TRỰC QUAN (VISUAL MOCKUP)

Giao diện cao cấp theo phong cách Modern Dark-mode, tích hợp Glassmorphism và các cụm dữ liệu trực quan đã được phác thảo cụ thể:
* **Left Identity Sidebar:** Hiển thị Avatar tròn viền phát sáng gradient, Cấp độ lập trình (Level/XP bar) và Danh hiệu thuật toán (Algorithm Master).
* **Active Streak Card:** Ngọn lửa phát sáng hiển thị số ngày rèn luyện liên tục tăng tính cam kết học tập.
* **Overview Radial Stats:** 3 vòng tiến độ tròn khuyết riêng biệt cho Easy/Medium/Hard.
* **Unlocked Achievement Badges:** Bộ sưu tập huy hiệu dạng lục giác neon (Recursion Champion, Dynamic Programmer, Greedy Master, Stack Hero).
* **Coding Activity Heatmap:** Bản đồ nhiệt đóng góp 12 tháng tương tự GitHub nhưng dùng tone màu sáng ngọc (Cyan glow).
* **Recent Submissions:** Bảng lịch sử nộp bài gồm Trạng thái, Tên bài, Cấp độ khó, Runtime, Memory và Thời gian.

---

## II. CHI TIẾT CÁC PHÂN KHU GIAO DIỆN (UI/UX LAYOUT BREAKDOWN)

Giao diện trang Hồ sơ sẽ được phân bố theo bố cục **2 cột lệch (Split Layout)** tối ưu cho Desktop và tự động xếp chồng mượt mà trên Mobile:

### 1. Cột bên trái: Thẻ định danh & Chuỗi hoạt động (Identity Sidebar)
* **Avatar & Khung Cấp độ (User Identity Card):**
  * Avatar lớn viền phát sáng gradient theo cấp độ.
  * Tên người dùng và **Danh hiệu thuật toán** dựa trên tổng lượng XP (Ví dụ: *Algorithm Master*, *Dynamic Learner*, *Recursion Newbie*).
  * Huy hiệu cấp độ xếp hạng (Level Badge - Ví dụ: `Lv. 84`) cùng thanh kinh nghiệm (XP bar).
  * Thông tin cơ bản: Ngày tham gia, quốc gia/địa điểm.
* **Chuỗi ngày học liên tục (Active Streak Widget):**
  * Hiển thị số ngày học liên tục hiện tại kèm biểu tượng ngọn lửa phát sáng (`glowing fire effect`).
  * Thanh tiến độ đếm ngược số ngày cần thiết để đạt mốc phần thưởng kế tiếp (Ví dụ: `10 ngày tới mục tiêu tiếp theo`).

### 2. Cột bên phải: Thống kê hiệu suất & Lịch sử (Analytics & Progress)
* **Tổng quan tiến trình giải bài (Solved Problems Overview):**
  * Hiển thị tỉ lệ tổng thể dạng phân số và phần trăm (Ví dụ: `440/700 Solved (74%)`).
  * Sử dụng **3 biểu đồ tròn khuyết (Radial Progress Charts)** với màu sắc rực rỡ riêng biệt để thể hiện số bài đã giải quyết theo từng cấp độ khó:
    * **Dễ (Easy):** Màu xanh lá cây (Green) - Tỉ lệ hoàn thành.
    * **Trung bình (Medium):** Màu vàng (Yellow) - Tỉ lệ hoàn thành.
    * **Khó (Hard):** Màu đỏ (Red) - Tỉ lệ hoàn thành.
* **Huy hiệu thành tích đã mở khóa (Unlocked Achievement Badges):**
  * Hiển thị danh sách các huy hiệu thành tích lập trình dạng lưới ngang (Carousel/Grid).
  * Mỗi huy hiệu được thiết kế theo dạng hình lục giác neon cực kỳ nổi bật kèm tên giải thưởng (Ví dụ: *Recursion Champion*, *Dynamic Programmer*, *Graph Guru*, *Greedy Master*).
  * Khi di chuột qua (Hover) sẽ có hiệu ứng phóng to nhẹ và hiển thị tooltip giải thích điều kiện đạt được.
* **Biểu đồ nhiệt hoạt động code (Coding Activity Heatmap):**
  * Hiển thị bản đồ nhiệt 12 tháng (tương tự GitHub Heatmap nhưng sử dụng tone màu xanh lam ngọc phát sáng thống nhất với hệ thống).
  * Cung cấp số liệu thống kê: Streak hiện tại, Streak lớn nhất từng đạt được.
* **Lịch sử nộp bài gần đây (Recent Submissions Table):**
  * Bảng hiển thị danh sách các bài tập đã nộp gần nhất.
  * Các cột thông tin: Trạng thái (Accepted/Runtime Error/Wrong Answer), Tên bài tập (được gắn link chuyển nhanh tới bài học), Cấp độ khó, Thời gian chạy (Run time), Bộ nhớ tiêu thụ (Memory), và Thời gian thực hiện.

---

## III. ĐỀ XUẤT CẤU TRÚC COMPONENT PHÍA FE (NEXT.JS)

Trang Hồ sơ sẽ được tạo tại `app/(dashboard)/profile/page.tsx` và cấu trúc các thành phần như sau:

```
components/profile/
├── index.ts
├── profile-sidebar.tsx       # Cột trái: Avatar, XP, Level, Streak Widget
├── stats-radial-charts.tsx   # Cột phải: 3 biểu đồ tròn Easy/Medium/Hard
├── achievements-grid.tsx     # Cột phải: Danh sách huy hiệu neon
├── activity-heatmap-card.tsx # Cột phải: Lịch sử đóng góp dạng heatmap
└── submissions-table.tsx     # Cột phải: Bảng lịch sử nộp bài gần nhất
```

---

## IV. ĐẶC TẢ API CẦN THIẾT PHÍA BACKEND (SPRING BOOT)

Để đảm bảo hiệu năng và giảm số lượng kết nối mạng, Backend cần cung cấp các API chuyên dụng sau:

### 1. Lấy thông tin chi tiết hồ sơ người dùng
* **Endpoint:** `GET /api/v1/users/profile`
* **Xác thực:** Cần Bearer Token (JWT).
* **Mẫu dữ liệu trả về (Response Payload):**
```json
{
  "userId": 1024,
  "username": "alexrivera",
  "fullName": "Alex Rivera",
  "avatarUrl": "/assets/avatars/alex.png",
  "level": 84,
  "currentXp": 48200,
  "nextLevelXp": 50000,
  "title": "ALGORITHM MASTER",
  "joinedDate": "2023-10-15T08:30:00Z",
  "location": "London",
  "streakCount": 45,
  "nextStreakGoal": 10,
  "solvedStats": {
    "total": 700,
    "solved": 440,
    "easy": { "solved": 215, "total": 250 },
    "medium": { "solved": 180, "total": 300 },
    "hard": { "solved": 45, "total": 150 }
  },
  "achievements": [
    { "id": "rec-1", "name": "Recursion Champion", "icon": "DnaIcon", "color": "emerald" },
    { "id": "dp-1", "name": "Dynamic Programmer", "icon": "SettingsIcon", "color": "pink" },
    { "id": "graph-1", "name": "Graph Guru", "icon": "GitForkIcon", "color": "blue" }
  ]
}
```

### 2. Lấy dữ liệu hoạt động đóng góp (Heatmap)
* **Endpoint:** `GET /api/v1/users/profile/contributions?year=2026`
* **Mẫu dữ liệu trả về (Response Payload):**
```json
{
  "totalContributions": 284,
  "maxStreak": 88,
  "contributions": {
    "2026-01-01": 2,
    "2026-01-02": 5,
    "2026-01-05": 1
  }
}
```

### 3. Lấy lịch sử nộp bài (Recent Submissions)
* **Endpoint:** `GET /api/v1/users/profile/submissions?page=0&size=10`
* **Mẫu dữ liệu trả về (Response Payload):**
```json
{
  "content": [
    {
      "submissionId": "sub-901",
      "problemId": "prob-two-sum",
      "problemTitle": "Two Sum",
      "difficulty": "EASY",
      "status": "ACCEPTED",
      "executionTimeSec": 0.04,
      "memoryUsageMb": 14.1,
      "submittedAt": "2026-05-24T15:20:00Z"
    }
  ],
  "totalPages": 15,
  "totalElements": 150
}
```
