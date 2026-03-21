// Thanh thông báo trên cùng - từ index.html .top-bar với marquee effect

export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <span>🚚 Freeship đơn từ 499K</span>
        <span>🔁 Đổi trả trong 7 ngày</span>
        <span>⚡ Sale tới 50% - Chỉ hôm nay</span>
        {/* Duplicate for seamless loop */}
        <span>🚚 Freeship đơn từ 499K</span>
        <span>🔁 Đổi trả trong 7 ngày</span>
        <span>⚡ Sale tới 50% - Chỉ hôm nay</span>
      </div>
    </div>
  );
}
