# Requirements Document

## Introduction

Tính năng "Continue Lesson" cho phép người dùng AlgoTutor nhanh chóng quay lại bài học đang dở từ Dashboard mà không cần điều hướng qua trang roadmap. Tính năng bao gồm: tự động đánh dấu trạng thái IN_PROGRESS khi mở bài học, hiển thị widget "Continue Learning" trên Dashboard với dữ liệu thực, và cung cấp API endpoint để lấy thông tin bài học hiện tại đang học.

## Glossary

- **Dashboard**: Trang chủ của người dùng sau khi đăng nhập, hiển thị tổng quan tiến độ học tập
- **Continue_Learning_Widget**: Component trên Dashboard hiển thị bài học gần nhất đang học và cho phép resume trực tiếp
- **Lesson_Page**: Trang hiển thị nội dung bài học (Theory, Quiz, hoặc Coding)
- **Progress_Tracker**: Module client-side chịu trách nhiệm cập nhật trạng thái IN_PROGRESS khi người dùng mở bài học
- **Current_Lesson_API**: Endpoint `GET /users/me/current-lesson` trả về bài học gần nhất đang được học
- **Enrollments_API**: Endpoint `GET /users/me/enrollments` trả về danh sách roadmap đã đăng ký kèm tiến độ
- **ProgressStatus**: Enum gồm ba giá trị: NOT_STARTED, IN_PROGRESS, COMPLETED
- **Roadmap**: Lộ trình học tập chứa nhiều topic và lesson

## Requirements

### Requirement 1: Auto-mark IN_PROGRESS on Lesson Open

**User Story:** As a learner, I want my lesson to be automatically marked as IN_PROGRESS when I open it, so that the system accurately tracks which lesson I am currently studying.

#### Acceptance Criteria

1. WHEN a learner navigates to the Lesson_Page AND the lesson's ProgressStatus is NOT_STARTED, THE Progress_Tracker SHALL send a PATCH request to update the lesson status to IN_PROGRESS without blocking or delaying the rendering of lesson content
2. WHILE the lesson's ProgressStatus is COMPLETED, WHEN the learner opens the Lesson_Page, THE Progress_Tracker SHALL NOT send any status update request
3. WHILE the lesson's ProgressStatus is IN_PROGRESS, WHEN the learner re-opens the Lesson_Page, THE Progress_Tracker SHALL NOT send a duplicate status update request
4. IF the PATCH request to update status fails due to a network error or non-success response, THEN THE Progress_Tracker SHALL allow the learner to continue viewing lesson content without displaying an error notification
5. WHEN a learner navigates to the Lesson_Page AND the lesson's ProgressStatus is null, THE Progress_Tracker SHALL NOT send a status update request

### Requirement 2: Current Lesson API Integration

**User Story:** As a learner, I want the system to know which lesson I was last studying, so that I can quickly resume from the Dashboard.

#### Acceptance Criteria

1. THE Current_Lesson_API SHALL return the IN_PROGRESS lesson with the most recent last-accessed timestamp across all enrolled roadmaps
2. WHEN the Current_Lesson_API is called, THE Current_Lesson_API SHALL return the roadmap slug, lesson slug, lesson title, roadmap name, and overall roadmap completion percentage as an integer from 0 to 100
3. IF the learner has no IN_PROGRESS lessons, THEN THE Current_Lesson_API SHALL return the first NOT_STARTED lesson ordered by topic displayOrder then lesson displayOrder from the most recently enrolled roadmap, including the same response fields as criterion 2
4. IF the learner has no enrolled roadmaps, THEN THE Current_Lesson_API SHALL return an empty response indicating no current lesson is available
5. IF the learner is not authenticated, THEN THE Current_Lesson_API SHALL return an error response indicating the request is unauthorized

### Requirement 3: Continue Learning Widget on Dashboard

**User Story:** As a learner, I want to see a "Continue Learning" widget on my Dashboard showing my current lesson, so that I can resume studying with one click.

#### Acceptance Criteria

1. WHEN the Dashboard loads AND the Current_Lesson_API returns a lesson, THE Continue_Learning_Widget SHALL display the lesson title, roadmap name, and a progress bar showing roadmap completion percentage (0–100%, calculated as completed lessons divided by total lessons in the roadmap, rounded to the nearest integer)
2. WHEN the learner clicks the continue button on the Continue_Learning_Widget, THE Continue_Learning_Widget SHALL navigate the learner directly to `/learn/{roadmapSlug}/{lessonSlug}`
3. WHILE the Current_Lesson_API is loading, THE Continue_Learning_Widget SHALL display a skeleton loading state matching the widget's layout dimensions
4. IF the Current_Lesson_API returns an empty response (204), THEN THE Continue_Learning_Widget SHALL display a text message prompting the learner to explore roadmaps and a link that navigates to the roadmaps listing page
5. IF the Current_Lesson_API returns a network error or non-success status code (4xx/5xx), THEN THE Continue_Learning_Widget SHALL display an error message indicating the data could not be loaded and a retry button that re-triggers the API call
6. WHEN the Dashboard loads AND the Current_Lesson_API returns a lesson, THE Continue_Learning_Widget SHALL replace the hardcoded welcome subtitle text with the actual roadmap name and computed completion percentage from the API response

### Requirement 4: Enrollments List API Integration

**User Story:** As a learner, I want to see all my enrolled roadmaps with progress on the Dashboard, so that I can choose which roadmap to continue.

#### Acceptance Criteria

1. THE Enrollments_API SHALL return a list of all roadmaps the learner is enrolled in, including roadmap name, slug, completion percentage as an integer from 0 to 100, and the next incomplete lesson slug and title
2. WHEN the Enrollments_API is called, THE Enrollments_API SHALL sort the results by the most recent lesson progress update timestamp first, with enrollments having no lesson progress sorted by enrollment creation date
3. IF the learner has no enrollments, THEN THE Enrollments_API SHALL return an empty array with HTTP status 200
4. IF a roadmap has all lessons completed, THEN THE Enrollments_API SHALL return null for the next incomplete lesson slug and title for that roadmap
5. IF the learner is not authenticated, THEN THE Enrollments_API SHALL return HTTP status 401 and not expose any enrollment data

### Requirement 5: Welcome Section Dynamic Content

**User Story:** As a learner, I want the welcome section on my Dashboard to show my actual learning progress, so that I feel motivated and informed about my current status.

#### Acceptance Criteria

1. WHEN the Dashboard loads AND the learner has at least one enrolled roadmap with EnrollmentStatus "ACTIVE", THE Continue_Learning_Widget SHALL display the text "Tiếp tục hành trình trong {roadmapName} — bạn đã hoàn thành {percentage}%" where {percentage} is calculated as (number of lessons with ProgressStatus "COMPLETED" / total lesson count in that roadmap) × 100, rounded down to the nearest integer (range: 0 to 100)
2. WHEN the Dashboard loads AND the learner has no enrolled roadmaps, THE Continue_Learning_Widget SHALL display the text "Bắt đầu hành trình học thuật toán ngay hôm nay"
3. IF the learner has multiple enrolled roadmaps with EnrollmentStatus "ACTIVE", THEN THE Continue_Learning_Widget SHALL display progress for the roadmap whose enrollment was most recently updated (most recent lessonProgression updatedAt timestamp)
4. WHEN the Dashboard loads AND the learner has an active enrollment, THE Continue_Learning_Widget SHALL include a call-to-action button labeled "Tiếp tục học" that links to the first lesson in display order with ProgressStatus "IN_PROGRESS", or if none exists, the first lesson with ProgressStatus "NOT_STARTED"
5. IF the progress data fails to load within 5 seconds, THEN THE Continue_Learning_Widget SHALL display the fallback text "Bắt đầu hành trình học thuật toán ngay hôm nay" with the call-to-action button linking to the roadmaps listing page

### Requirement 6: Error Handling and Resilience

**User Story:** As a learner, I want the Dashboard to remain functional even when API calls fail, so that I can still access other features.

#### Acceptance Criteria

1. IF the Current_Lesson_API request fails (network error, timeout after 5 seconds, or HTTP status 5xx), THEN THE Continue_Learning_Widget SHALL display the fallback message "Chào mừng bạn trở lại" without lesson name, topic name, or completion percentage
2. IF the Current_Lesson_API request fails, THEN THE Continue_Learning_Widget SHALL render independently so that all other Dashboard components render without waiting for the Current_Lesson_API response
3. IF the Current_Lesson_API request fails, THEN THE Continue_Learning_Widget SHALL retry the request exactly once after a 3-second delay
4. IF the retry request also fails, THEN THE Continue_Learning_Widget SHALL remain in the fallback state displaying "Chào mừng bạn trở lại" and SHALL NOT attempt further retries
