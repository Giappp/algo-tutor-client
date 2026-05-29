# Hướng Dẫn Tích Hợp Front-End Với AlgoTutor AI Service

Tài liệu này cung cấp chi tiết kỹ thuật dành cho đội ngũ Phát triển Front-End (FE) để tích hợp các API hỗ trợ học tập bằng AI (AI Tutor, AI Hint, Debug Code, Review Code...) của AlgoTutor.

---

## 1. Tổng Quan Kiến Trúc Gọi AI

Hệ thống cung cấp 3 API chính đặt tại endpoint `/ai`:
1. **Bootstrap (`GET /ai/chat/bootstrap`)**: Khởi tạo phiên chat chào mừng cho bài học.
2. **Chat Đồng Bộ (`POST /ai/chat`)**: Nhận câu hỏi và trả về câu trả lời hoàn chỉnh sau khi mô hình đã xử lý xong.
3. **Chat Streaming SSE (`POST /ai/chat/stream`)**: Sử dụng kết nối Server-Sent Events (SSE) để truyền dữ liệu câu trả lời dưới dạng stream thời gian thực (real-time).

> [!IMPORTANT]
> **Phương thức Streaming dùng `POST`**: API `/ai/chat/stream` nhận tham số qua **HTTP POST JSON** và trả về định dạng `text/event-stream`. Vì đối tượng `EventSource` mặc định của trình duyệt chỉ hỗ trợ phương thức `GET` và không cho phép gửi kèm body/headers, FE **bắt buộc** phải sử dụng API `fetch` đọc Stream hoặc thư viện chuyên dụng như `@microsoft/fetch-event-source`.

---

## 2. Các Luồng Nghiệp Vụ & Chat Mode

Mỗi yêu cầu gửi lên AI Service đều phải chỉ định tham số `mode` (không phân biệt hoa thường, Server sẽ tự động chuyển thành viết hoa):

| Mode | Mục đích sử dụng | Bắt buộc gửi kèm Code? |
| :--- | :--- | :--- |
| `HINT` | Gợi ý giải bài tập từng bước (không tiết lộ lời giải ngay) | Không |
| `EXPLAIN` | Giải thích lý thuyết hoặc giải thích đề bài tập | Không |
| `DEBUG` | Tìm và sửa lỗi sai trong mã nguồn | **Có** |
| `REVIEW` | Đánh giá chất lượng và tối ưu hóa cấu trúc code | **Có** |
| `COMPLEXITY` | Phân tích độ phức tạp thời gian Big-O (Time & Space Complexity) | **Có** |
| `SOLUTION` | Xem giải pháp mẫu của bài học | Không |
| `NEXT_STEP` | Định hướng bước tiếp theo người dùng cần thực hiện | Không |

---

## 3. Chi Tiết API Endpoints

### 3.1 Bootstrap Conversation
Khởi tạo phiên hội thoại mới cho bài học. FE nên gọi API này khi người dùng vừa mở tab Chatbot AI bên cạnh bài học.

* **Endpoint**: `/ai/chat/bootstrap`
* **Method**: `GET`
* **Query Parameters**:
  * `lessonSlug` (String, Required): Slug định danh duy nhất của bài học.
* **Headers**: `Authorization: Bearer <Token>`
* **Response (JSON)**:
  ```json
  {
    "status": 200,
    "message": "Success",
    "data": {
      "conversationId": "4a1b6352-710e-47af-999d-16a7f805a5a1",
      "answer": "Chào mừng bạn đến với bài học! Tôi có thể giúp gì cho bạn hôm nay?",
      "mode": "EXPLAIN",
      "quickActions": [
        {
          "label": "Giải thích lý thuyết",
          "intent": "EXPLAIN_PROBLEM",
          "mode": "EXPLAIN",
          "message": "Giải thích lại lý thuyết của bài học này giúp tôi."
        },
        {
          "label": "Gợi ý câu hỏi ôn tập",
          "intent": "SUGGEST_NEXT_STEP",
          "mode": "NEXT_STEP",
          "message": "Gợi ý cho tôi một câu hỏi ôn tập về bài học."
        }
      ],
      "sources": [],
      "canAskNextHint": null
    }
  }
  ```

---

### 3.2 Chat Đồng Bộ (Synchronous Chat)
Gửi yêu cầu và nhận câu trả lời dạng block văn bản tĩnh thông thường.

* **Endpoint**: `/ai/chat`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <Token>`
* **Request Body (JSON)**:
  ```json
  {
    "conversationId": "4a1b6352-710e-47af-999d-16a7f805a5a1",
    "lessonId": 12,
    "mode": "HINT",
    "message": "Hãy cho tôi một gợi ý.",
    "code": "public int sum(int a, int b) { return a + b; }",
    "language": "JAVA",
    "judgeResult": "WRONG_ANSWER",
    "errorMessage": "Expected 5, got 4 on testcase 3",
    "failedTestCases": ["test_case_3"]
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "status": 200,
    "message": "Success",
    "data": {
      "conversationId": "4a1b6352-710e-47af-999d-16a7f805a5a1",
      "answer": "Để giải quyết bài toán này, bạn hãy chú ý đến việc xử lý các phần tử biên...",
      "mode": "HINT",
      "quickActions": [
        {
          "label": "Gợi ý tiếp theo",
          "intent": "NEXT_HINT",
          "mode": "HINT",
          "message": "Cho tôi xin gợi ý tiếp theo nhé."
        }
      ],
      "sources": [],
      "canAskNextHint": true
    }
  }
  ```

---

### 3.3 Chat Streaming (Server-Sent Events)
Truyền tải câu trả lời thời gian thực giúp mang lại trải nghiệm mượt mà (giống ChatGPT).

* **Endpoint**: `/ai/chat/stream`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Accept: text/event-stream`
  * `Authorization: Bearer <Token>`
* **Request Body (JSON)**: *(Tương tự cấu trúc của Chat Đồng Bộ ở mục 3.2)*

#### Định dạng gói tin SSE nhận về từ Server
Luồng Stream trả về các sự kiện dòng lệnh (events) phân biệt bằng từ khóa `event`. FE cần bắt và xử lý 2 loại sự kiện sau:

##### 1. Sự kiện `event: message` (Gói tin Chunk)
Gửi liên tục khi AI đang sinh chữ. Mỗi chunk chứa một từ hoặc ký tự mới của câu trả lời.
* **Dữ liệu (`data`)**: Đối tượng JSON chứa chuỗi text mới.
* **Ví dụ**:
  ```text
  event: message
  data: {"answer": "Để "}

  event: message
  data: {"answer": "giải "}
  ```

##### 2. Sự kiện `event: metadata` (Gói tin Kết thúc)
Được bắn **một lần duy nhất** ngay trước khi luồng stream kết thúc (`emitter.complete()`). Nó chứa thông tin hội thoại, danh sách Quick Actions động, và trạng thái giới hạn Hint.
* **Dữ liệu (`data`)**: Đối tượng JSON chứa Metadata cấu trúc đầy đủ.
* **Ví dụ**:
  ```text
  event: metadata
  data: {"conversationId":"4a1b6352-710e-47af-999d-16a7f805a5a1","answer":null,"mode":"HINT","quickActions":[{"label":"Gợi ý tiếp theo","intent":"NEXT_HINT","mode":"HINT","message":"Cho tôi xin gợi ý tiếp theo nhé."}],"sources":[],"canAskNextHint":true}
  ```

---

## 4. Cấu Trúc Các Dữ Liệu (DTO Schemas)

### 4.1 AiQuickAction (Hành động nhanh gợi ý)
Hệ thống AI tự động phân tích ngữ cảnh bài học và chế độ chat hiện tại để đề xuất các nút hành động tiếp theo cho người dùng.
```typescript
interface AiQuickAction {
  label: string;    // Nhãn hiển thị trên Button (ví dụ: "Kiểm tra lỗi code")
  intent: string;   // Intent của hành động (NEXT_HINT, DEBUG_CODE, EXPLAIN_PROBLEM...)
  mode: string;     // Mode cần chuyển đổi khi gửi yêu cầu tiếp theo (HINT, DEBUG...)
  message: string;  // Nội dung tin nhắn mẫu gửi lên chatbot khi người dùng Click
}
```

### 4.2 Lỗi Giới Hạn Gợi Ý (Hints Limit Error)
Đối với bài tập thực hành Code (`LessonType.CODING`), người dùng bị giới hạn đếm số lần hỏi gợi ý (`mode: HINT`) tối đa bằng kích thước danh sách gợi ý của bài tập (tối đa 5 lần).
Nếu cố tình gọi API `/ai/chat` hoặc `/ai/chat/stream` với `mode: HINT` vượt giới hạn, Server sẽ trả về lỗi:

* **HTTP Status**: `400 Bad Request` hoặc lỗi qua SSE Emitter.
* **Mã Lỗi (Error Code)**: `NO_MORE_HINTS`
* **JSON Body**:
  ```json
  {
    "status": 400,
    "errorCode": "NO_MORE_HINTS",
    "message": "You have reached the maximum number of allowed hints for this coding lesson."
  }
  ```
> [!TIP]
> **Giải pháp FE**: Luôn đọc thuộc tính `canAskNextHint` trong metadata phản hồi từ Server. Nếu `canAskNextHint === false`, hãy ẩn nút "Yêu cầu gợi ý" (hoặc Quick Action dạng `HINT`) trên giao diện người dùng để ngăn chặn việc gọi lỗi.

---

## 5. Hướng Dẫn Triển Khai FE Code Mẫu (React)

Dưới đây là đoạn code React mẫu sử dụng thư viện `@microsoft/fetch-event-source` để gửi yêu cầu `POST` dạng Streaming và cập nhật giao diện mượt mà.

```bash
npm install @microsoft/fetch-event-source
```

```tsx
import React, { useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface QuickAction {
  label: string;
  intent: string;
  mode: string;
  message: string;
}

export const AiChatBox: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [canHint, setCanHint] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const startStreamChat = async (userPrompt: string, mode: string = "EXPLAIN") => {
    setLoading(true);
    setCurrentResponse("");
    setQuickActions([]);
    
    const requestBody = {
      conversationId: "your-conversation-uuid-from-state",
      lessonId: 12,
      mode: mode,
      message: userPrompt,
      code: "// Source code của học viên...",
      language: "JAVA"
    };

    const controller = new AbortController();

    try {
      await fetchEventSource('http://localhost:8080/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,

        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            return; // Kết nối thành công
          }
          if (response.status === 400) {
            // Xử lý lỗi giới hạn hint hoặc lỗi logic khác
            const errData = await response.json();
            if (errData.errorCode === 'NO_MORE_HINTS') {
              alert("Bạn đã hết lượt xin gợi ý cho bài tập này!");
              setCanHint(false);
            }
          }
          throw new Error("Không thể mở kết nối SSE");
        },

        onmessage(event) {
          // Xử lý từng dòng sự kiện trả về
          if (event.event === 'message') {
            const data = JSON.parse(event.data);
            // Append từng ký tự nhận được vào phản hồi đang hiển thị
            setCurrentResponse((prev) => prev + data.answer);
          } 
          
          else if (event.event === 'metadata') {
            const metadata = JSON.parse(event.data);
            console.log("Metadata nhận được:", metadata);
            // Cập nhật danh sách Quick Actions động từ Server
            setQuickActions(metadata.quickActions || []);
            if (metadata.canAskNextHint !== null) {
              setCanHint(metadata.canAskNextHint);
            }
          }
        },

        onclose() {
          setLoading(false);
          // Đưa câu trả lời hoàn chỉnh vào danh sách tin nhắn chính thức
          setMessages((prev) => [...prev, currentResponse]);
        },

        onerror(err) {
          console.error("Lỗi SSE stream:", err);
          setLoading(false);
          controller.abort();
        }
      });
    } catch (error) {
      console.error("Failed to call stream API:", error);
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Khung hiển thị danh sách tin nhắn */}
      <div className="messages-list">
        {messages.map((msg, i) => <div key={i} className="message">{msg}</div>)}
        {loading && <div className="message typing">{currentResponse}</div>}
      </div>

      {/* Hiển thị danh sách Quick Actions nút bấm gợi ý động */}
      <div className="quick-actions-bar">
        {quickActions.map((action, idx) => (
          <button 
            key={idx} 
            disabled={action.mode === 'HINT' && !canHint}
            onClick={() => startStreamChat(action.message, action.mode)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. Lưu Ý Khi Thiết Kế Giao Diện Trực Quan (UX Tips)

1. **Hiển thị Typing Effect**: Dòng chữ AI sinh ra cần cập nhật liên tục mượt mà. Tránh hiện tượng load xoay vòng dài rồi mới hiển thị cả khối chữ lớn.
2. **Dynamic UI cho Quick Actions**: Đưa Quick Actions vào các thẻ bo tròn nhỏ nằm ngay trên ô nhập liệu chat (giống Google Gemini). Khi click vào hành động nào, hãy gửi tin nhắn mẫu của hành động đó lên giống như người dùng tự gõ câu lệnh.
3. **Vô hiệu hóa thông minh**: Khi `canAskNextHint === false`, không xóa mất nút gợi ý mà hãy hiển thị trạng thái `disabled` mờ kèm theo thông báo tooltip: *"Bạn đã dùng hết 5 gợi ý tối đa cho bài tập này. Hãy tự thử thách bản thân hoặc xem giải pháp mẫu nhé!"* để tăng tính trải nghiệm.
