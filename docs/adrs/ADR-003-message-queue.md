# ADR-002: Lựa chọn cơ sở dữ liệu quan hệ (MySQL)

## Trạng thái
Accepted

## Bối cảnh
Hệ thống thư viện yêu cầu xử lý các thao tác dữ liệu có tính ràng buộc rất cao, đặc biệt là trong nghiệp vụ mượn/trả sách (Borrow/Return). Hệ thống phải đảm bảo tính nhất quán của số lượng sách tồn kho, không được phép xảy ra tình trạng trừ âm số lượng sách hoặc xung đột khi có nhiều độc giả cùng mượn một cuốn sách tại cùng một thời điểm.

## Quyết định
Sử dụng Cơ sở dữ liệu quan hệ MySQL 8.0 làm trung tâm lưu trữ dữ liệu chính.

## Lý do
1. Dữ liệu thư viện (Người dùng, Thể loại, Sách, Phiếu mượn) có cấu trúc cố định và tính liên kết quan hệ (Relationship) chặt chẽ, rất phù hợp với RDBMS.
2. MySQL hỗ trợ cơ chế Transaction và ACID hoàn hảo. Cùng với hàm `select_for_update()` của Django, nó giúp khóa dòng dữ liệu (Row-level lock) trong lúc xử lý mượn sách, loại bỏ hoàn toàn rủi ro sai lệch dữ liệu.
3. MySQL tương thích cực kỳ tốt với thư viện ORM của Django, giúp sinh ra các câu lệnh query tối ưu.
4. Rất dễ đóng gói và triển khai nhanh chóng thông qua Docker.

## Hệ quả
- **Tích cực:** Toàn vẹn dữ liệu được đảm bảo tuyệt đối, truy vấn thống kê dữ liệu đa bảng (JOIN) dễ dàng.
- **Tiêu cực:** Cấu trúc bảng (Schema) cứng nhắc. Phải kiểm soát cẩn thận các file Migrations mỗi khi có sự thay đổi về mặt thiết kế CSDL.

## Ngày quyết định
06-03-2026