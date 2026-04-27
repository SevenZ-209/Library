# ADR-001: Lựa chọn kiến trúc phân tách Client-Server (Decoupled Architecture)

## Trạng thái
Accepted

## Bối cảnh
Chúng tôi cần chọn kiến trúc phù hợp cho hệ thống quản lý thư viện số DigiLib. Hệ thống yêu cầu cung cấp trải nghiệm người dùng mượt mà, phản hồi nhanh, đồng thời xử lý các nghiệp vụ quản lý dữ liệu phức tạp ở phía sau. Nhóm phát triển cần phân chia công việc code độc lập giữa kỹ sư làm giao diện và kỹ sư làm dữ liệu.

## Quyết định
Sử dụng kiến trúc phân tách Frontend và Backend:
- **Presentation Layer (Frontend):** Xây dựng dưới dạng Single Page Application (SPA) sử dụng ReactJS, Vite và TailwindCSS.
- **Business Logic & Data Access Layer (Backend):** Cung cấp các RESTful API sử dụng Framework Django (Python).

## Lý do
1. Tách biệt rõ ràng vòng đời phát triển của code UI và code Logic.
2. Tối ưu hóa UX: Kiến trúc SPA giúp chuyển trang mượt mà không cần tải lại toàn bộ tài nguyên.
3. Tận dụng tối đa ưu điểm của các công nghệ: Hệ sinh thái React mạnh về linh hoạt UI, trong khi Django cực kỳ mạnh về bảo mật và ORM quản trị dữ liệu.
4. Có tính mở rộng: REST API của Backend có thể dễ dàng được tái sử dụng nếu sau này thư viện muốn phát triển thêm ứng dụng Mobile.

## Hệ quả
- **Tích cực:** Dễ phân chia công việc, mã nguồn dễ bảo trì, hiệu năng giao diện cao.
- **Tiêu cực:** Hệ thống phức tạp hơn mức Monolithic truyền thống. Đòi hỏi cấu hình kỹ lưỡng về CORS và thiết lập cơ chế bảo mật xác thực (Authentication) qua JWT Tokens.

## Ngày quyết định
06-03-2026