# Hướng Dẫn Tích Hợp Frontend - Tính Năng AI Chat & Tư Vấn Lộ Trình

Tài liệu này hướng dẫn chi tiết cho đội ngũ phát triển Frontend (FE) cách tích hợp các API từ **`AiChatController`** để hiển thị giao diện Chat với AI Assistant cho học viên. Hệ thống hỗ trợ cả phương thức phản hồi thông thường (Standard Response) lẫn phản hồi thời gian thực theo dòng dữ liệu (Streaming Response - Server-Sent Events).

---

## 📌 1. Các Tính Năng AI Chat Chính
Hệ thống AI Chat hỗ trợ 2 phân hệ lớn:
1. **Lesson Chat (Chat Hỗ Trợ Bài Học)**:
   - Tích hợp trực tiếp tại giao diện học tập/luyện code.
   - Hỗ trợ giải thích lý thuyết (`EXPLAIN`), chỉ dẫn từng bước qua gợi ý (`HINT` - kiểm soát theo chính sách giới hạn số lượt gợi ý của bài học), sửa lỗi code (`DEBUG`), đánh giá độ phức tạp thuật toán (`COMPLEXITY`), review code (`REVIEW`), và tìm hướng đi tiếp theo (`NEXT_STEP`).
   - Có cơ chế **Quick Actions** (Gợi ý câu hỏi nhanh) động trả về từ AI để người dùng bấm chọn phản hồi nhanh chóng.
2. **General Chat (Tư Vấn Lộ Trình - Roadmap Advisory)**:
   - Chat tự do, tư vấn thắc mắc chung về ngành, lộ trình học tập.
   - Tự động phân tích nhu cầu học viên để gợi ý trực quan các **Roadmaps (Lộ trình học)** tương ứng hiện có trên hệ thống dưới dạng các card trực quan.

---

## 🛠️ 2. Danh Sách API Endpoints

### 2.1 Khởi Tạo Phiên Chat (Bootstrap Lesson Chat)
Trước khi người dùng bắt đầu giao tiếp trong một bài học, FE gọi API này để lấy tin nhắn chào mừng (Onboarding message) và thông tin cấu hình ban đầu.

* **Endpoint**: `GET /ai/chat/bootstrap`
* **Params**:
  - `lessonSlug` (String, required): Slug của bài học hiện tại (ví dụ: `binary-search-introduction`).
* **Header**: `Authorization: Bearer <token>`
* **Response DTO**: `ApiResponse<AiChatResponse>`
```json
{
  "success": true,
  "data": {
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "answer": "Chào bạn! Bạn đang học bài 'Tìm Kiếm Nhị Phân'. Mình có thể hỗ trợ bạn theo từng bước: giải thích lý thuyết, đưa ra gợi ý giải bài mà không tiết lộ code ngay, hoặc debug code của bạn. Bạn muốn bắt đầu từ đâu?",
    "mode": "BOOTSTRAP",
    "quickActions": null,
    "sources": [],
    "canAskNextHint": true
  }
}
```

---

### 2.2 Chat Hỗ Trợ Bài Học (Standard Response)
* **Endpoint**: `POST /ai/chat`
* **Header**: `Authorization: Bearer <token>`
* **Request Body** (`AiChatRequest`): *Chi tiết các thuộc tính xem ở Mục 3.*
* **Response DTO**: `ApiResponse<AiChatResponse>`
```json
{
  "success": true,
  "data": {
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "answer": "Để giải quyết bài toán này bằng hai con trỏ, bạn cần duy trì hai biến chỉ mục `left` và `right`...",
    "mode": "HINT",
    "quickActions": [
      {
        "label": "Yêu cầu gợi ý bước tiếp theo",
        "intent": "NEXT_HINT",
        "mode": "HINT",
        "message": "Hãy cho mình xin gợi ý tiếp theo."
      },
      {
        "label": "Giải thích đoạn code hiện tại",
        "intent": "EXPLAIN_CODE",
        "mode": "EXPLAIN",
        "message": "Giải thích giúp mình đoạn code này nhé!"
      }
    ],
    "sources": [],
    "canAskNextHint": true
  }
}
```

---

### 2.3 Chat Hỗ Trợ Bài Học (Streaming Response)
Sử dụng khi muốn hiển thị chữ chạy thời gian thực (như ChatGPT).

* **Endpoint**: `POST /ai/chat/stream`
* **Header**: `Authorization: Bearer <token>`
* **Accept**: `text/event-stream`
* **Request Body**: `AiChatRequest`
* **Response**: Dòng dữ liệu Server-Sent Events (SSE). *Xem hướng dẫn tích hợp chi tiết ở Mục 4.*

---

### 2.4 Chat Tư Vấn Lộ Trình (Standard Response)
* **Endpoint**: `POST /ai/general/chat`
* **Header**: `Authorization: Bearer <token>`
* **Request Body**: `AiChatRequest`
* **Response DTO**: `ApiResponse<AiGeneralChatResponse>`
```json
{
  "success": true,
  "data": {
    "conversationId": "8fa85f64-5717-4562-b3fc-2c963f66afb2",
    "answer": "Dựa trên mong muốn học cấu trúc dữ liệu giải thuật cơ bản của bạn, mình đề xuất bạn nên bắt đầu với Lộ trình Cấu Trúc Dữ Liệu và Thuật Toán Basic. Sau đó có thể chuyển sang Advanced.",
    "roadmaps": [
      {
        "name": "Cấu Trúc Dữ Liệu & Thuật Toán Cơ Bản",
        "slug": "dsa-basic",
        "level": "BEGINNER",
        "description": "Lộ trình dành cho người mới bắt đầu làm quen với Array, Linked List, Stack, Queue...",
        "thumbnailUrl": "https://cdn.algotutor.vn/roadmaps/dsa-basic.png",
        "topicCount": 5,
        "lessonCount": 24,
        "isPremium": false
      }
    ]
  }
}
```

---

### 2.5 Chat Tư Vấn Lộ Trình (Streaming Response)
* **Endpoint**: `POST /ai/general/chat/stream`
* **Header**: `Authorization: Bearer <token>`
* **Accept**: `text/event-stream`
* **Request Body**: `AiChatRequest`
* **Response**: Dòng dữ liệu Server-Sent Events (SSE). *Xem hướng dẫn tích hợp chi tiết ở Mục 4.*

---

## 📋 3. Chi Tiết Các Cấu Trúc Dữ Liệu (DTO Schemas)

### 3.1 DTO Gửi Đi: `AiChatRequest`
> [!IMPORTANT]
> Backend áp dụng ràng buộc xác thực: **Ít nhất một trong hai trường `message` hoặc `code` phải được cung cấp**. Nếu thiếu cả hai, API sẽ trả về lỗi `400 Bad Request`.
> Khi chuyển sang các mode cần code như `DEBUG`, `REVIEW`, `COMPLEXITY`, FE bắt buộc phải gửi trường `code`.

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `conversationId` | `String (UUID)` | Không | ID cuộc hội thoại cũ nếu muốn chat tiếp. Để `null` ở lượt chat đầu tiên (sau đó lưu ID trả về từ response để gửi lại ở các lượt tiếp theo). |
| `lessonId` | `Long` | Không | ID bài học hiện tại (Bắt buộc đối với Lesson Chat để AI hiểu ngữ cảnh bài học). |
| `lessonSlug` | `String` | Không | Slug bài học. |
| `provider` | `String` | Không | Nhà cung cấp LLM mong muốn (ví dụ: `OPENAI`, `GEMINI`). Thường để mặc định. |
| `mode` | `String` | **Có** | Chế độ chat. Giá trị thuộc enum `AiChatMode`: `HINT`, `EXPLAIN`, `DEBUG`, `REVIEW`, `COMPLEXITY`, `SOLUTION`, `NEXT_STEP`. |
| `message` | `String` | Tùy chọn | Lời nhắn/câu hỏi từ người dùng. Tối đa 5,000 ký tự. |
| `code` | `String` | Tùy chọn | Đoạn code hiện tại trong IDE của học viên. Tối đa 10,000 ký tự. (Bắt buộc với mode `DEBUG`, `REVIEW`, `COMPLEXITY`). |
| `language` | `String` | Không | Ngôn ngữ lập trình của IDE (ví dụ: `cpp`, `java`, `python`). |
| `judgeResult` | `String` | Không | Kết quả chấm thử từ trình chấm (ví dụ: `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`). |
| `errorMessage` | `String` | Không | Thông báo lỗi biên dịch/lỗi runtime nếu có. |
| `failedTestCases` | `List<String>` | Không | Danh sách test case bị sai để AI phân tích. |

---

### 3.2 DTO Nhận Về (Khi không Stream)
#### `AiChatResponse` (Dành cho Lesson Chat)
* `conversationId` (`UUID`): ID cuộc hội thoại hiện tại.
* `answer` (`String`): Câu trả lời dạng Markdown.
* `mode` (`String`): Chế độ hiện tại của cuộc chat.
* `quickActions` (`List<AiQuickAction>`): Danh sách hành động nhanh được đề xuất.
* `sources` (`List<AiSource>`): Các nguồn tham khảo tài liệu học tập nếu có.
* `canAskNextHint` (`Boolean`): Trả về `true`/`false` cho biết người dùng có thể bấm nút xin gợi ý tiếp theo hay không. Nếu bài học hết gợi ý, trường này sẽ là `false` (nút xin Hint nên bị mờ đi).

#### `AiGeneralChatResponse` (Dành cho General Chat)
* `conversationId` (`UUID`): ID cuộc hội thoại hiện tại.
* `answer` (`String`): Lời phản hồi tư vấn của AI.
* `roadmaps` (`List<RoadmapInfo>`): Danh sách lộ trình được AI phân tích và đề xuất.

---

## 🌊 4. Hướng Dẫn Tích Hợp API Stream (Server-Sent Events)

Các API Stream (`/ai/chat/stream` và `/ai/general/chat/stream`) nhận yêu cầu bằng phương thức **`POST`** và trả về dòng stream. 
> [!WARNING]
> Không thể sử dụng đối tượng `new EventSource(url)` mặc định của trình duyệt vì nó chỉ hỗ trợ phương thức `GET` và không cho phép tùy biến HTTP Headers (đặc biệt là Token Authorization).

### 🛠️ Giải Pháo Kỹ Thuật
FE nên sử dụng API `fetch` tiêu chuẩn với `ReadableStream` hoặc cài đặt thư viện chuyên dụng như **`@microsoft/fetch-event-source`**.

#### Ví dụ Tích Hợp bằng `fetch` và `ReadableStream` (Vanilla JS / TypeScript):
```typescript
interface ChunkData {
  answer: string;
}

interface MetadataResponse {
  conversationId: string;
  mode?: string;
  quickActions?: any[];
  canAskNextHint?: boolean;
  roadmaps?: any[];
}

async function sendAiChatStream(requestPayload: AiChatRequest, onChunk: (text: string) => void, onMetadata: (meta: MetadataResponse) => void) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("https://api.algotutor.vn/ai/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(requestPayload)
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Xử lý giới hạn tần suất yêu cầu (Rate Limit)
      const retryAfter = response.headers.get("Retry-After") || "60";
      alert(`Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`);
    } else {
      alert("Đã xảy ra lỗi khi kết nối với AI.");
    }
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  if (!reader) return;

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // SSE phân tách các event bằng hai ký tự xuống dòng liên tiếp (\n\n)
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || ""; // Giữ lại phần chưa hoàn thành trong buffer

    for (const part of parts) {
      if (part.trim() === "") continue;

      // Xử lý dòng dữ liệu SSE: "event: message\ndata: {...}" hoặc "event: metadata\ndata: {...}"
      const lines = part.split("\n");
      let eventName = "message";
      let dataString = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventName = line.replace("event:", "").trim();
        } else if (line.startsWith("data:")) {
          dataString = line.replace("data:", "").trim();
        }
      }

      if (!dataString) continue;

      try {
        const parsedData = JSON.parse(dataString);
        if (eventName === "message") {
          // data là AiChunkResponse { answer: "một phần text..." }
          onChunk(parsedData.answer);
        } else if (eventName === "metadata") {
          // data là AiChatResponse (chứa conversationId, quickActions, canAskNextHint...)
          onMetadata(parsedData);
        }
      } catch (e) {
        console.error("Lỗi parse JSON chunk:", e, dataString);
      }
    }
  }
}
```

---

## 🎨 5. Hướng Dẫn Thiết Kế & Trải Nghiệm Người Dùng (UI/UX)

Để đảm bảo mang lại trải nghiệm tương tác AI cao cấp, hiện thực các tiêu chuẩn thiết kế sau:

### 5.1 Hiển Thị Khung Chat & Trình Trình Chiếu Chữ (Typing Indicator)
* **Markdown Rendering**: Sử dụng thư viện markdown mạnh mẽ (như `react-markdown` kết hợp với `rehype-katex` để hiển thị biểu thức toán học và `react-syntax-highlighter` để highlight cú pháp code).
* **Streaming Cursor**: Khi luồng stream đang hoạt động (`message` chunks liên tục gửi tới), hãy hiển thị một dấu nháy dọc nhấp nháy hoặc một chấm tròn nhỏ ở cuối dòng text (`typing-cursor`) để biểu thị AI đang tiếp tục viết.
* **Auto Scroll**: Tự động cuộn khung chat xuống dưới cùng khi có chunk mới xuất hiện, nhưng hãy dừng auto-scroll nếu người dùng chủ động cuộn ngược lên trên để đọc lịch sử chat.

```css
/* Animation nhấp nháy cho cursor stream */
.typing-cursor {
  display: inline-block;
  width: 6px;
  height: 15px;
  background-color: var(--primary-color, #4f46e5);
  margin-left: 4px;
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

---

### 5.2 Quản Lý Trạng Thái Gợi Ý (Hint Policy UI)
Đối với các bài tập Coding, hệ thống khống chế số lượt yêu cầu Gợi ý (`HINT`) để tránh việc học viên lạm dụng AI giải hộ toàn bộ bài toán.
* Khi gọi API Bootstrap hoặc API Chat thông thường, hãy kiểm tra thuộc tính `canAskNextHint`.
* **Giao diện**:
  - Nếu `canAskNextHint === true`: Nút "Yêu cầu gợi ý" (hoặc Quick Action tương đương) được hiển thị bình thường.
  - Nếu `canAskNextHint === false`: Vô hiệu hóa nút (Disable / Gray-out) và hiển thị tooltip ngắn: *"Bạn đã dùng hết số lượt gợi ý cho bài tập này. Hãy cố gắng tự hoàn thiện phần còn lại nhé!"*.

---

### 5.3 Hiển Thị Quick Actions (Hành Động Nhanh)
Gợi ý nhanh giúp học viên không cần gõ phím mà vẫn tương tác nhanh với AI.
* Khi kết thúc stream (nhận sự kiện `metadata`), hoặc khi gọi API Standard thành công, backend trả về danh sách `quickActions` dạng mảng:
  ```json
  {
    "label": "Xem phân tích độ phức tạp",
    "intent": "ANALYZE_COMPLEXITY",
    "mode": "COMPLEXITY",
    "message": "Phân tích độ phức tạp thời gian và không gian của code này giúp mình."
  }
  ```
* **Cách xử lý khi bấm Quick Action**:
  1. Hiển thị ngay nội dung của thuộc tính `message` vào khung chat như một tin nhắn gửi đi của User.
  2. Tự động kích hoạt cuộc chat mới (Stream hoặc Standard) với thuộc tính `mode` lấy từ Quick Action đó (ở ví dụ trên là gửi request với `mode: "COMPLEXITY"` và đính kèm `code` hiện tại trong IDE).

---

### 5.4 Hiển Thị Đề Xuất Lộ Trình (General Chat)
Trong phân hệ General Chat, AI sẽ đề cử các Roadmap liên quan. 
* Khi kết thúc stream hoặc API trả về mảng `roadmaps`, hãy kết xuất chúng thành danh sách các Card đẹp mắt bên dưới câu trả lời của AI.
* **Layout Card**:
  - Hình ảnh thu nhỏ (`thumbnailUrl`).
  - Tên Lộ Trình (`name`) kèm badge độ khó (`level` - BEGINNER: Xanh lá, INTERMEDIATE: Vàng, ADVANCED: Đỏ).
  - Tóm tắt thông tin: Số chủ đề (`topicCount` chủ đề), Số bài học (`lessonCount` bài học).
  - Nhãn **Premium** nổi bật nếu `isPremium: true`.
  - Nút hành động: "Bắt đầu học ngay" (chuyển hướng người dùng sang trang `/roadmaps/{slug}`).

---

### 5.5 Xử Lý Lỗi & Giới Hạn Tần Suất (Rate Limiting)
Hệ thống giới hạn tần suất gửi tin nhắn lên AI (mặc định tối đa 20 yêu cầu trong vòng 60 giây).
* Khi vượt ngưỡng giới hạn, API sẽ trả về mã lỗi **`429 Too Many Requests`** đi kèm header `Retry-After` (thời gian chờ tính bằng giây).
* **FE xử lý**:
  1. Chặn người dùng gửi thêm tin nhắn.
  2. Hiển thị banner/hộp thoại cảnh báo trực quan: *"Bạn đang thao tác quá nhanh. AI cần nghỉ ngơi một chút. Vui lòng thử lại sau X giây."*
  3. Chạy bộ đếm ngược thời gian thực trên giao diện đếm lùi số giây này về 0, sau đó tự động mở khóa nút gửi tin nhắn.

---

Chúc các bạn phát triển Frontend tích hợp thành công trải nghiệm AI đột phá trên AlgoTutor! Mọi thắc mắc về luồng dữ liệu vui lòng liên hệ team Backend.
