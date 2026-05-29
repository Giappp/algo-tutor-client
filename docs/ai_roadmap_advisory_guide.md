# TECHNICAL GUIDE: INTEGRATING AI ROADMAP ADVISORY (AI ASSISTANT WIDGET)

This guide documents the technical architecture, data contracts, and UI components needed to integrate the general floating **AI Assistant Widget** (`AIChatWidget`) with the backend to advise learning paths (Roadmaps) based on student goals.

---

## 1. DATA CONTRACTS (API SPECIFICATION)

### 1.1 Chat Stream Request
* **Endpoint**: `POST `/ai/general/chat/stream`
* **Headers**:
  * `Content-Type: application/json`
  * `Accept: text/event-stream`
* **Request Body**:
  ```json
  {
    "conversationId": "5fa8c823-3b10-48a1-b844-32591a27e8a9", // optional
    "message": "Tôi là người mới bắt đầu học, hãy tư vấn lộ trình học thuật toán phù hợp cho tôi.",
    "mode": "EXPLAIN"
  }
  ```

---

### 1.2 SSE Stream Response Structure

The backend streams response tokens under the event `message`. Once the response is fully generated, it emits a `metadata` event containing the recommended roadmaps:

#### 1. Token Stream Event
```http
event: message
data: {"answer": "Để bắt đầu học cấu trúc dữ liệu và giải thuật hiệu quả..."}
```

#### 2. Metadata Event (End of stream)
```http
event: metadata
data: {
  "conversationId": "5fa8c823-3b10-48a1-b844-32591a27e8a9",
  "roadmaps": [
    {
      "name": "Cấu trúc dữ liệu & Giải thuật Cơ bản",
      "slug": "dsa-co-ban",
      "level": "BEGINNER",
      "description": "Phù hợp cho người mới bắt đầu học. Hướng dẫn mảng, chuỗi, đệ quy và cấu trúc dữ liệu cơ bản.",
      "thumbnailUrl": "/images/roadmaps/dsa-basic.png",
      "topicCount": 6,
      "lessonCount": 24,
      "isPremium": false
    }
  ]
}
```

---

## 2. FRONT-END INTERFACE ENHANCEMENT

### 2.1 Extending Types
In [lib/types/lesson.ts](file:///home/giap/Desktop/Workspace/AlgoTutor/algo-tutor-client/lib/types/lesson.ts) or directly in `AIChatWidget`, extend the `ChatMessage` and define `RoadmapRecommendation`:

```typescript
export interface RoadmapRecommendation {
    name: string;
    slug: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    description: string;
    thumbnailUrl?: string;
    topicCount: number;
    lessonCount: number;
    isPremium: boolean;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    roadmaps?: RoadmapRecommendation[]; // Dynamic recommendations
}
```

---

### 2.2 Designing the Interactive Roadmap Card Component

The card list will render inside the chatbot stream window. Here is the suggested Tailwind CSS mockup code for `RoadmapAdvisoryCard`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, ArrowRightIcon } from "lucide-react";
import type { RoadmapRecommendation } from "@/lib/types/roadmap";

export function RoadmapAdvisoryCard({ roadmap }: { roadmap: RoadmapRecommendation }) {
    const levelColors = {
        BEGINNER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        INTERMEDIATE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        ADVANCED: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="group relative rounded-xl border border-border/50 bg-background/50 backdrop-blur-xs p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-background/80 overflow-hidden flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {roadmap.name}
                </h4>
                <Badge variant="outline" className={`text-[9px] font-bold uppercase rounded px-1.5 py-0 ${levelColors[roadmap.level]}`}>
                    {roadmap.level}
                </Badge>
            </div>
            
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                {roadmap.description}
            </p>

            <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                    <BookOpenIcon className="size-3 text-primary" />
                    <span>{roadmap.lessonCount} bài học ({roadmap.topicCount} chủ đề)</span>
                </div>
                {roadmap.isPremium && (
                    <Badge className="text-[8px] font-extrabold bg-amber-500 hover:bg-amber-600 text-white rounded scale-90 origin-right">
                        PRO
                    </Badge>
                )}
            </div>

            <Link href={`/roadmaps/${roadmap.slug}`} className="mt-2 w-full">
                <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground transition-all duration-200 active:scale-95 cursor-pointer shadow-xs">
                    <span>Học ngay</span>
                    <ArrowRightIcon className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </Link>
        </div>
    );
}
```

---

## 3. CHECKLIST FOR ROBUST STREAM READER IN `AIChatWidget`

Ensure these steps are followed inside `sendMessage` of [ai-chat-widget.tsx](file:///home/giap/Desktop/Workspace/AlgoTutor/algo-tutor-client/components/dashboard/ai-chat-widget.tsx):

- [x] Create stream state containers: `const [conversationId, setConversationId] = useState<string | null>(null)`.
- [x] Read SSE events using `TextDecoder` chunk-by-chunk.
- [x] Match both `event: message` (for text stream append) and `event: metadata` (for extracting roadmap recommend lists).
- [x] Implement the `ReactMarkdown` styling wrapper.
- [x] Provide dual-level fallbacks (Synchronous backend call first, local mock data responder second) to ensure 100% operational uptime.
