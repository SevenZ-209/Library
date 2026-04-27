# ADR-003: Lựa chọn Message Broker (RabbitMQ) và Task Queue (Celery)

## Trạng thái
Accepted

## Bối cảnh
Hệ thống cần cung cấp tính năng gửi email thông báo cho độc giả khi sách sắp đến hạn trả hoặc quá hạn. Đồng thời, hệ thống cần có cơ chế tự động quét kiểm tra ngày hạn sách vào lúc 8h sáng mỗi ngày. Nếu đặt logic gọi hàm gửi mail (giao thức SMTP) trực tiếp vào luồng xử lý đồng bộ của API, nó sẽ khiến server bị "treo" chờ phản hồi từ máy chủ mail, dẫn đến trải nghiệm người dùng tồi tệ.

## Quyết định
Sử dụng kiến trúc xử lý bất đồng bộ (Asynchronous Processing) bao gồm:
- **Message Broker:** RabbitMQ.
- **Task Queue & Worker:** Celery.
- **Scheduler:** Celery Beat.

## Lý do
1. Tách biệt hoàn toàn các tác vụ nặng (như gửi email, tạo file report) ra khỏi Request-Response cycle chính của REST API. Nhờ đó, người dùng nhận được phản hồi ngay lập tức.
2. **Tính bền vững (Durability):** Nếu Worker đang xử lý gửi mail mà server sập, tin nhắn vẫn được lưu an toàn trong hàng đợi của RabbitMQ và sẽ tự chạy tiếp khi hệ thống khởi động lại.
3. Celery Beat là một bộ định thời (cron-job scheduler) thuần Python, có thể cấu hình bằng code và quản lý chung trong vòng đời của Django thay vì phải cài đặt crontab rắc rối ở hệ điều hành.

## Hệ quả
- **Tích cực:** API Backend hoạt động ổn định và có hiệu năng cao hơn rất nhiều. Khả năng gửi tin nhắn được đảm bảo.
- **Tiêu cực:** Tăng độ phức tạp của hạ tầng Server. Nhóm dự án phải chạy và giám sát thêm 3 containers riêng biệt cho RabbitMQ, Celery Worker và Celery Beat.

## Ngày quyết định
06-03-2026