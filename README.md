# HỆ THỐNG QUẢN LÝ PHÒNG TẬP THỂ HÌNH (GYM MANAGEMENT SYSTEM)
**Môn học:** Hệ thống thông tin quản lý (MIS)  
**Công nghệ sử dụng:** React.js, Node.js (Express), MySQL, Docker, VNPay API, Cloudinary.



## 1. CẤU TRÚC DỰ ÁN (MONOREPO)
Dự án được tổ chức theo mô hình Monorepo để dễ dàng quản lý và đồng bộ dữ liệu:
* `packages/frontend`: Frontend React.js (Giao diện Admin, Coach, Member).
* `packages/backend`: Backend Node.js (Xử lý logic nghiệp vụ và RESTful API).
* `packages/shared`: Chứa các định nghĩa dữ liệu (DTO, Types, Enum) dùng chung.
* `docker/mysql/init`: Chứa file dữ liệu mẫu để tự động khởi tạo Database.

## 2. HƯỚNG DẪN CÀI ĐẶT NHANH (DOCKER)
### Bước 1: Khởi tạo Database tự động
1. Đảm bảo file SQL của dự án đã nằm tại thư mục: `./docker/mysql/init/database_dump.sql`
2. Mở Terminal tại thư mục gốc và chạy lệnh:
   ```bash
   docker-compose up -d
### Bước 2: Cài đặt ứng dụng
Tại thư mục gốc, cài đặt toàn bộ thư viện:
    npm install

### Bước 3: Chạy hệ thống
    npm run dev:backend
    npm run dev:frontend
## 3 Tài khoản demo
    0822232721 - 123123 (admin)
    0111111111 - 123123 (coach)
    0333333333 - 123123 (staff)
    0222222222 - 123123 (member)