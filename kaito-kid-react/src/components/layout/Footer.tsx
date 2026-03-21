// Footer - thiết kế mới với background đen và Google Maps

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Column 1: GIỚI THIỆU */}
        <div className="footer-column">
          <h3>GIỚI THIỆU</h3>
          <a href="#">Về chúng tôi</a>
          <a href="#">Liên hệ</a>
          <a href="#">Tuyển dụng</a>
          <a href="#">Tin tức</a>
          <div className="footer-contact">
            <p>Email:</p>
            <p>kaitokid@gmail.com</p>
            <p>Hotline:</p>
            <p>0906264126</p>
          </div>
        </div>

        {/* Column 2: HỖ TRỢ KHÁCH HÀNG */}
        <div className="footer-column">
          <h3>HỖ TRỢ KHÁCH HÀNG</h3>
          <Link to="/order-tracking"><i className="fa fa-box"></i> Tra cứu đơn hàng</Link>
          <a href="#">Hướng dẫn đặt hàng</a>
          <a href="#">Hướng dẫn chọn size</a>
          <a href="#">Câu hỏi thường gặp</a>
          <a href="#">Thanh toán - Giao hàng</a>
        </div>

        {/* Column 3: HỆ THỐNG CỬA HÀNG */}
        <div className="footer-column">
          <h3>HỆ THỐNG CỬA HÀNG</h3>
          <p>Tìm địa chỉ cửa hàng gần bạn</p>
        </div>

        {/* Column 4: KẾT NỐI VỚI KAITO KID SHOP + MAP */}
        <div className="footer-column footer-map-column">
          <h3>KẾT NỐI VỚI KAITO KID SHOP</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/KaitooKidd.1412" target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://www.youtube.com/@Kuroba_Kaito_GM" target="_blank" rel="noreferrer" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@kurobaa_kaitoo" target="_blank" rel="noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://www.instagram.com/kaitoo.kidd1412" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
          {/* Google Maps Embed */}
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096890417594!2d105.78031287503188!3d21.028810980629447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd0c66f05%3A0xea31563511af2e54!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
              width="100%"
              height="150"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kaito Kid Shop Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© 2025 KAITO KID. All rights reserved.</p>
        <button 
          className="back-to-top" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <i className="fa fa-arrow-up"></i>
        </button>
      </div>
    </footer>
  );
}
