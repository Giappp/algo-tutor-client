# Landing Page API Contract

Tài liệu mô tả các API cần thiết để thay thế dữ liệu fallback đang hiển thị trên landing page.

## Nguyên tắc chung

- Base URL: `/api/v1`
- Response dùng cấu trúc `ApiResponse<T>` hiện tại.
- Các endpoint landing là public, không yêu cầu đăng nhập.
- FE tự dùng nội dung fallback khi API lỗi hoặc trả mảng rỗng.
- Nội dung trả về nên dùng tiếng Việt.

## Endpoints

### `GET /landing/stats`

```json
{
  "success": true,
  "data": {
    "totalStudents": 52341,
    "totalProblems": 1247,
    "totalTopics": 12,
    "avgCompletionRate": 73
  }
}
```

### `GET /landing/features`

Trả tối đa 6 tính năng, sắp xếp theo thứ tự ưu tiên.

```json
{
  "success": true,
  "data": [
    {
      "id": "structured-roadmaps",
      "title": "Lộ trình có thứ tự",
      "description": "Mỗi chủ đề được sắp xếp theo nền tảng cần có.",
      "iconKey": "Map",
      "colorToken": "text-primary",
      "bgToken": "bg-primary/10"
    }
  ]
}
```

`iconKey`, `colorToken` và `bgToken` phải nằm trong danh sách FE hỗ trợ. Không nhận CSS tùy ý từ người dùng.

### `GET /landing/roadmaps`

Trả tối đa 3 lộ trình nổi bật đã publish.

```json
{
  "success": true,
  "data": [
    {
      "name": "Nền tảng cấu trúc dữ liệu",
      "slug": "data-structures-foundation",
      "level": "BEGINNER",
      "thumbnailUrl": "https://...",
      "description": "Mảng, chuỗi, hash map và các kỹ thuật cốt lõi.",
      "goal": "Xây nền tư duy giải thuật",
      "topicCount": 6,
      "lessonCount": 28,
      "isPremium": false
    }
  ]
}
```

### `GET /landing/testimonials`

Chỉ trả phản hồi đã được người dùng đồng ý công khai và admin duyệt.

```json
{
  "success": true,
  "data": [
    {
      "id": "feedback-id",
      "name": "Minh Anh",
      "role": "Sinh viên Công nghệ thông tin",
      "avatarInitials": "MA",
      "avatarColorIndex": 0,
      "content": "Lộ trình giúp mình biết phần nào cần học trước.",
      "starRating": 5,
      "createdAt": "2026-06-13T00:00:00Z"
    }
  ]
}
```

## Endpoint gộp đề xuất

Khi tối ưu SSR/SEO, backend có thể cung cấp `GET /landing` trả đồng thời `stats`, `features`, `roadmaps` và `testimonials`. FE hiện gọi riêng từng endpoint để mỗi section có thể tải độc lập.

## Checklist backend

- Chỉ trả roadmap đã publish.
- Giới hạn số phần tử theo contract.
- Cache response landing vì dữ liệu thay đổi ít.
- Không trả testimonial chưa được cho phép công khai.
- Có giá trị mặc định khi thống kê chưa sẵn sàng.
