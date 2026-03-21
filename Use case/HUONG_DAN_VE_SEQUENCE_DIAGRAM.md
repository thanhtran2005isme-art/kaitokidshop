# Hướng Dẫn Vẽ Sequence Diagram trong Visual Paradigm

## Cách vẽ nhanh nhất:

### Bước 1: Tạo Sequence Diagram mới
1. Click phải vào project → **Add Diagram** → **Sequence Diagram**
2. Đặt tên diagram (VD: "BDTT Đặt Hàng")

### Bước 2: Thêm Actor và Lifelines
- Kéo **Actor** từ palette vào diagram
- Kéo **Lifeline** từ palette cho mỗi đối tượng

### Bước 3: Vẽ Messages (QUAN TRỌNG!)
- Click vào **Message** trong palette
- Click vào lifeline nguồn → kéo đến lifeline đích
- Nhập tên message

---

## BIỂU ĐỒ 1: ĐẶT HÀNG

### Các đối tượng (Lifelines):
| STT | Tên | Loại |
|-----|-----|------|
| 1 | Khách Hàng | Actor |
| 2 | Trang Thanh Toán | Lifeline |
| 3 | Giỏ Hàng | Lifeline |
| 4 | Hệ Thống Đơn Hàng | Lifeline |
| 5 | Cổng Thanh Toán | Lifeline |
| 6 | Cơ Sở Dữ Liệu | Lifeline |

### Các Messages (theo thứ tự):
| STT | Từ | Đến | Tên Message | Loại |
|-----|-----|-----|-------------|------|
| 1 | Khách Hàng | Trang Thanh Toán | Truy cập trang thanh toán | Call |
| 2 | Trang Thanh Toán | Giỏ Hàng | Lấy thông tin giỏ hàng | Call |
| 3 | Giỏ Hàng | Trang Thanh Toán | Trả về danh sách sản phẩm | Return |
| 4 | Trang Thanh Toán | Khách Hàng | Hiển thị form thanh toán | Return |
| 5 | Khách Hàng | Trang Thanh Toán | Nhập thông tin giao hàng | Call |
| 6 | Khách Hàng | Trang Thanh Toán | Chọn phương thức thanh toán | Call |
| 7 | Khách Hàng | Trang Thanh Toán | Xác nhận đặt hàng | Call |
| 8 | Trang Thanh Toán | Hệ Thống Đơn Hàng | Tạo đơn hàng mới | Call |
| 9 | Hệ Thống Đơn Hàng | Cơ Sở Dữ Liệu | Lưu đơn hàng vào DB | Call |
| 10 | Cơ Sở Dữ Liệu | Hệ Thống Đơn Hàng | Xác nhận lưu thành công | Return |
| 11 | Hệ Thống Đơn Hàng | Cổng Thanh Toán | Xử lý thanh toán | Call |
| 12 | Cổng Thanh Toán | Hệ Thống Đơn Hàng | Kết quả thanh toán | Return |
| 13 | Hệ Thống Đơn Hàng | Cơ Sở Dữ Liệu | Cập nhật trạng thái đơn hàng | Call |
| 14 | Trang Thanh Toán | Giỏ Hàng | Xóa giỏ hàng | Call |
| 15 | Trang Thanh Toán | Khách Hàng | Hiển thị xác nhận đơn hàng | Return |

---

## BIỂU ĐỒ 2: THÊM VÀO GIỎ HÀNG

### Các đối tượng (Lifelines):
| STT | Tên | Loại |
|-----|-----|------|
| 1 | Khách Hàng | Actor |
| 2 | Trang Chi Tiết SP | Lifeline |
| 3 | Giỏ Hàng | Lifeline |
| 4 | LocalStorage | Lifeline |

### Các Messages (theo thứ tự):
| STT | Từ | Đến | Tên Message | Loại |
|-----|-----|-----|-------------|------|
| 1 | Khách Hàng | Trang Chi Tiết SP | Chọn sản phẩm | Call |
| 2 | Trang Chi Tiết SP | Khách Hàng | Hiển thị chi tiết sản phẩm | Return |
| 3 | Khách Hàng | Trang Chi Tiết SP | Chọn size, màu, số lượng | Call |
| 4 | Khách Hàng | Trang Chi Tiết SP | Nhấn "Thêm vào giỏ" | Call |
| 5 | Trang Chi Tiết SP | Giỏ Hàng | Kiểm tra SP đã có trong giỏ | Call |
| 6 | Giỏ Hàng | LocalStorage | Lấy giỏ hàng hiện tại | Call |
| 7 | LocalStorage | Giỏ Hàng | Trả về dữ liệu giỏ hàng | Return |
| 8 | Giỏ Hàng | Giỏ Hàng | Thêm/Cập nhật sản phẩm | Self |
| 9 | Giỏ Hàng | LocalStorage | Lưu giỏ hàng mới | Call |
| 10 | LocalStorage | Giỏ Hàng | Xác nhận lưu thành công | Return |
| 11 | Giỏ Hàng | Trang Chi Tiết SP | Cập nhật số lượng hiển thị | Return |
| 12 | Trang Chi Tiết SP | Khách Hàng | Hiển thị thông báo thành công | Return |

---

## BIỂU ĐỒ 3: ĐĂNG NHẬP

### Các đối tượng (Lifelines):
| STT | Tên | Loại |
|-----|-----|------|
| 1 | Người Dùng | Actor |
| 2 | Trang Đăng Nhập | Lifeline |
| 3 | Hệ Thống Xác Thực | Lifeline |
| 4 | Cơ Sở Dữ Liệu | Lifeline |
| 5 | Session Storage | Lifeline |

### Các Messages (theo thứ tự):
| STT | Từ | Đến | Tên Message | Loại |
|-----|-----|-----|-------------|------|
| 1 | Người Dùng | Trang Đăng Nhập | Truy cập trang đăng nhập | Call |
| 2 | Trang Đăng Nhập | Người Dùng | Hiển thị form đăng nhập | Return |
| 3 | Người Dùng | Trang Đăng Nhập | Nhập email và mật khẩu | Call |
| 4 | Người Dùng | Trang Đăng Nhập | Nhấn nút "Đăng nhập" | Call |
| 5 | Trang Đăng Nhập | Trang Đăng Nhập | Validate dữ liệu đầu vào | Self |
| 6 | Trang Đăng Nhập | Hệ Thống Xác Thực | Gửi yêu cầu xác thực | Call |
| 7 | Hệ Thống Xác Thực | Cơ Sở Dữ Liệu | Tìm kiếm tài khoản | Call |
| 8 | Cơ Sở Dữ Liệu | Hệ Thống Xác Thực | Trả về thông tin tài khoản | Return |
| 9 | Hệ Thống Xác Thực | Hệ Thống Xác Thực | Kiểm tra mật khẩu | Self |
| 10 | Hệ Thống Xác Thực | Hệ Thống Xác Thực | Tạo session đăng nhập | Self |
| 11 | Hệ Thống Xác Thực | Session Storage | Lưu thông tin session | Call |
| 12 | Session Storage | Hệ Thống Xác Thực | Xác nhận lưu thành công | Return |
| 13 | Hệ Thống Xác Thực | Trang Đăng Nhập | Trả về kết quả xác thực | Return |
| 14 | Trang Đăng Nhập | Người Dùng | Chuyển hướng trang chủ | Return |

---

## Mẹo vẽ nhanh trong Visual Paradigm:

1. **Tạo Message nhanh**: Giữ Ctrl + kéo từ lifeline này sang lifeline khác
2. **Self Message**: Kéo message từ lifeline về chính nó
3. **Return Message**: Click phải vào message → Set as Return Message
4. **Đánh số tự động**: View → Show Sequence Number
5. **Copy Lifeline**: Ctrl+C, Ctrl+V để copy lifeline có sẵn

## Tham khảo thêm:
- Xem file PlantUML trong thư mục `docs/` để có hình ảnh trực quan
- File: `docs/sequence-diagram-dat-hang.puml`
- File: `docs/sequence-diagram-them-gio-hang.puml`  
- File: `docs/sequence-diagram-dang-nhap.puml`
