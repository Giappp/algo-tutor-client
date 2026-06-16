# Project Objectives

AlgoTutor is a smart online learning platform that combines algorithmic theory with hands-on coding through specialized
learning roadmaps. It guides learners systematically from foundational concepts to advanced problem-solving.

# Features

## Specialized Roadmaps & Knowledge Isolation

- Lessons are clearly divided into core topics (Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming,
  etc.).

- Coding exercises are strictly isolated to the current topic, preventing confusion from advanced concepts the user
  hasn't learned yet.

## Multi-Layered Lesson Structure

- Theory: Foundational concepts with visuals and pseudocode.
- Quizzes: Quick assessments to reinforce the theory.
- Coding: Auto-graded practice problems focused entirely on the active topic.

## Progressive Difficulty

- Problems scale from Easy (basic implementation) to Medium (logic application) and Hard (performance optimization).
- Learners must complete basic milestones to unlock advanced content.

## Context-Aware AI Assistant

- Powered by LLMs and vector databases to analyze the user's code and intent.
- Provides helpful hints strictly within the scope of the current lesson. This helps students debug and solve problems
  on their own without being overwhelmed by overly complex, out-of-scope solutions.

# API Alignment Documents

- [Current Lesson API](./CURRENT_LESSON_API.md): yêu cầu backend triển khai `GET /users/me/current-lesson` cho dashboard.
- [Auth Alignment](./AUTH_ALIGNMENT_BE.MD): đồng bộ luồng xác thực giữa FE và BE.
- [Landing API](./LANDING_API.md): dữ liệu landing page.
- [AI Chat Integration Guide](./ai_chat_integration_guide.md): tích hợp AI chatbot.
- [Chat History](./CHAT_HISTORY.md): API lịch sử hội thoại.
- [Video Lesson Integration](./video_lesson_integration.md): API bài học video.
- [Judge Alignment](./judge_alignment.md): đồng bộ judge/coding submission.
