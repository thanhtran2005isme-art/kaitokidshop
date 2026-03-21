// Trang chủ - chuyển từ index.html sang React
// Bao gồm: Hero Slider, Trust Bar, Category Tiles, New Arrivals, Sale, Best Sellers,
// Lookbook, Campaign, Flash Sale, Brand Values, Reviews, Newsletter

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [filteredNewArrivals, setFilteredNewArrivals] = useState<Product[]>([]);
  const [newArrivalsFilter, setNewArrivalsFilter] = useState('Tất cả');
  
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [filteredBestSellers, setFilteredBestSellers] = useState<Product[]>([]);
  const [bestSellersFilter, setBestSellersFilter] = useState('Tất cả');
  
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 15, seconds: 32 });

  useEffect(() => {
    const newArr = productService.getNewArrivals();
    setNewArrivals(newArr);
    setFilteredNewArrivals(newArr);
    
    setSaleProducts(productService.getSaleProducts());
    
    const best = productService.getBestSellers();
    setBestSellers(best);
    setFilteredBestSellers(best);
    
    // Flash sale products (first 4 sale products)
    setFlashSaleProducts(productService.getSaleProducts().slice(0, 4));
  }, []);

  // Filter New Arrivals
  useEffect(() => {
    if (newArrivalsFilter === 'Tất cả') {
      setFilteredNewArrivals(newArrivals);
    } else {
      setFilteredNewArrivals(newArrivals.filter(p => p.gender === newArrivalsFilter));
    }
  }, [newArrivalsFilter, newArrivals]);

  // Filter Best Sellers
  useEffect(() => {
    if (bestSellersFilter === 'Tất cả') {
      setFilteredBestSellers(bestSellers);
    } else {
      setFilteredBestSellers(bestSellers.filter(p => p.category?.includes(bestSellersFilter)));
    }
  }, [bestSellersFilter, bestSellers]);

  // Hero Slider auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (n: number) => setCurrentSlide(n);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + 3) % 3);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % 3);

  const slides = [
    { img: '/slide_1.jpg', tag: 'SPRING / SUMMER 2025', title: 'Everyday Essentials', sub: 'Những thiết kế tối giản, dễ phối cho mọi ngày của bạn' },
    { img: '/slide_2.jpg', tag: 'NEW ARRIVALS', title: 'Fresh & Trendy', sub: 'Khám phá những xu hướng thời trang mới nhất' },
    { img: '/slide_3.jpg', tag: 'SALE UP TO 50%', title: 'Summer Sale', sub: 'Giảm giá lên đến 50% cho toàn bộ bộ sưu tập hè' },
  ];

  return (
    <div className="home-page">
      {/* SECTION 1: HERO BANNER */}
      <section className="hero-banner">
        {slides.map((slide, i) => (
          <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`}>
            <img src={slide.img} alt={slide.title} />
            <div className="hero-content">
              <span className="hero-tagline">{slide.tag}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.sub}</p>
              <div className="hero-buttons">
                <Link to="/collections" className="btn-hero-primary">Xem bộ sưu tập</Link>
                <Link to="/products" className="btn-hero-secondary">Mua ngay</Link>
              </div>
            </div>
          </div>
        ))}
        <div className="hero-controls">
          <button className="hero-arrow prev" onClick={prevSlide}><i className="fa fa-chevron-left"></i></button>
          <button className="hero-arrow next" onClick={nextSlide}><i className="fa fa-chevron-right"></i></button>
        </div>
        <div className="hero-dots">
          {slides.map((_, i) => (
            <span key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(i)}></span>
          ))}
        </div>
      </section>

      {/* SECTION 2: TRUST BAR */}
      <section className="trust-bar">
        <div className="trust-container">
          <div className="trust-item">
            <i className="fa fa-truck"></i>
            <div className="trust-text">
              <h4>FREESHIP từ 499K</h4>
              <p>Giao nhanh toàn quốc</p>
            </div>
          </div>
          <div className="trust-item">
            <i className="fa fa-rotate-left"></i>
            <div className="trust-text">
              <h4>Đổi trả trong 7 ngày</h4>
              <p>Nếu sản phẩm lỗi hoặc không vừa</p>
            </div>
          </div>
          <div className="trust-item">
            <i className="fa fa-clock"></i>
            <div className="trust-text">
              <h4>Giao hàng 24-48H</h4>
              <p>Áp dụng nội thành</p>
            </div>
          </div>
          <div className="trust-item">
            <i className="fa fa-headset"></i>
            <div className="trust-text">
              <h4>Hỗ trợ 24/7</h4>
              <p>Luôn có người nghe máy</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CATEGORY TILES */}
      <section className="category-section">
        <div className="category-grid">
          <Link to="/products?gender=Nữ" className="category-tile">
            <img src="/london.png" alt="Women" />
            <div className="category-overlay">
              <h3>WOMEN</h3>
              <span>Khám phá ngay →</span>
            </div>
          </Link>
          <Link to="/products?gender=Nam" className="category-tile">
            <img src="/Nhat.png" alt="Men" />
            <div className="category-overlay">
              <h3>MEN</h3>
              <span>Khám phá ngay →</span>
            </div>
          </Link>
          <Link to="/products?filter=new" className="category-tile">
            <img src="/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png" alt="New In" />
            <div className="category-overlay">
              <h3>NEW IN</h3>
              <span>Khám phá ngay →</span>
            </div>
          </Link>
          <Link to="/products?filter=sale" className="category-tile">
            <img src="/ChatGPT Image 22_35_00 22 thg 4, 2025.png" alt="Sale" />
            <div className="category-overlay">
              <h3>SALE</h3>
              <span>Khám phá ngay →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 4: NEW ARRIVALS */}
      <section className="products-section" id="section-newarrivals">
        <div className="section-header"><h2>NEW ARRIVALS</h2><p>Cập nhật mẫu mới mỗi tuần</p></div>
        <div className="filter-tabs">
          <button className={`tab filter-btn ${newArrivalsFilter === 'Tất cả' ? 'active' : ''}`} onClick={() => setNewArrivalsFilter('Tất cả')}>Tất cả</button>
          <button className={`tab filter-btn ${newArrivalsFilter === 'Nữ' ? 'active' : ''}`} onClick={() => setNewArrivalsFilter('Nữ')}>Nữ</button>
          <button className={`tab filter-btn ${newArrivalsFilter === 'Nam' ? 'active' : ''}`} onClick={() => setNewArrivalsFilter('Nam')}>Nam</button>
          <button className={`tab filter-btn ${newArrivalsFilter === 'Unisex' ? 'active' : ''}`} onClick={() => setNewArrivalsFilter('Unisex')}>Unisex</button>
        </div>
        <div className="products-grid" id="new-arrivals-grid">
          {filteredNewArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="view-all-container"><Link to="/products?filter=new" className="btn-view-all">Xem tất cả</Link></div>
      </section>

      {/* SECTION 4.5: SALE PRODUCTS */}
      <section className="products-section sale-products-section" id="section-saleproducts">
        <div className="section-header"><h2>🔥 ĐANG GIẢM GIÁ</h2><p>Săn sale ngay - Số lượng có hạn</p></div>
        <div className="products-grid sale-grid" id="sale-products-grid">
          {saleProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="view-all-container"><Link to="/products?filter=sale" className="btn-view-all">Xem tất cả</Link></div>
      </section>

      {/* SECTION 5: BEST SELLERS */}
      <section className="products-section bestseller-section" id="section-bestsellers">
        <div className="section-header"><h2>BEST SELLERS</h2><p>Được yêu thích nhất tuần này</p></div>
        <div className="filter-tabs">
          <button className={`tab filter-btn ${bestSellersFilter === 'Tất cả' ? 'active' : ''}`} onClick={() => setBestSellersFilter('Tất cả')}>Tất cả</button>
          <button className={`tab filter-btn ${bestSellersFilter === 'Áo' ? 'active' : ''}`} onClick={() => setBestSellersFilter('Áo')}>Áo</button>
          <button className={`tab filter-btn ${bestSellersFilter === 'Quần' ? 'active' : ''}`} onClick={() => setBestSellersFilter('Quần')}>Quần</button>
          <button className={`tab filter-btn ${bestSellersFilter === 'Váy' ? 'active' : ''}`} onClick={() => setBestSellersFilter('Váy')}>Váy</button>
          <button className={`tab filter-btn ${bestSellersFilter === 'Đầm' ? 'active' : ''}`} onClick={() => setBestSellersFilter('Đầm')}>Đầm</button>
        </div>
        <div className="products-grid bestseller-grid" id="bestsellers-grid">
          {filteredBestSellers.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="view-all-container"><Link to="/products?filter=bestseller" className="btn-view-all">Xem tất cả</Link></div>
      </section>

      {/* SECTION 6: LOOKBOOK */}
      <section className="lookbook-section" id="section-lookbook">
        <div className="section-header"><h2>GỢI Ý PHỐI ĐỒ</h2><p>Lookbook: Street Style / Office Chic / Weekend Chill</p></div>
        <div className="lookbook-container">
          <div className="lookbook-item">
            <div className="lookbook-image"><img src="/london.png" alt="Office Chic" /></div>
            <div className="lookbook-content">
              <h3>Office Chic</h3>
              <p>3 items – 5 outfit đi làm cả tuần</p>
              <ul className="outfit-list">
                <li><span>Áo blazer kẻ</span><a href="#">Xem sản phẩm →</a></li>
                <li><span>Quần tây lưng cao</span><a href="#">Xem sản phẩm →</a></li>
                <li><span>Áo thun trắng basic</span><a href="#">Xem sản phẩm →</a></li>
              </ul>
              <button className="btn-buy-set">Mua toàn bộ set</button>
            </div>
          </div>
          <div className="lookbook-item reverse">
            <div className="lookbook-content">
              <h3>Street Style</h3>
              <p>Mix & match cho phong cách đường phố</p>
              <ul className="outfit-list">
                <li><span>Áo hoodie oversized</span><a href="#">Xem sản phẩm →</a></li>
                <li><span>Quần jeans baggy</span><a href="#">Xem sản phẩm →</a></li>
                <li><span>Giày sneaker trắng</span><a href="#">Xem sản phẩm →</a></li>
              </ul>
              <button className="btn-buy-set">Mua toàn bộ set</button>
            </div>
            <div className="lookbook-image"><img src="/Nhat.png" alt="Street Style" /></div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CAMPAIGN */}
      <section className="campaign-section">
        <div className="campaign-container">
          <div className="campaign-image"><img src="/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png" alt="Summer Breeze Collection" /></div>
          <div className="campaign-content">
            <span className="campaign-tag">SUMMER BREEZE COLLECTION</span>
            <h2>Nhẹ tênh như gió hè</h2>
            <p>Chất liệu linen, cotton thoáng mát, tông màu be, trắng, xanh biển...</p>
            <Link to="/collections" className="btn-campaign">Khám phá BST →</Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: FLASH SALE */}
      {flashSaleProducts.length > 0 && (
        <section className="flash-sale-section" id="section-flashsale">
          <div className="flash-sale-header">
            <h2>FLASH SALE 24H</h2>
            <div className="countdown-timer" id="countdown">
              <span className="time-unit"><span id="hours">{String(countdown.hours).padStart(2, '0')}</span>h</span>
              <span className="time-unit"><span id="minutes">{String(countdown.minutes).padStart(2, '0')}</span>m</span>
              <span className="time-unit"><span id="seconds">{String(countdown.seconds).padStart(2, '0')}</span>s</span>
            </div>
          </div>
          <div className="flash-sale-grid">
            {flashSaleProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* SECTION 9: BRAND VALUES */}
      <section className="brand-values-section">
        <div className="brand-container">
          <div className="brand-image"><img src="/london.png" alt="Về KAITO KID" /></div>
          <div className="brand-content">
            <h2>Chúng tôi là KAITO KID</h2>
            <ul className="brand-values">
              <li><i className="fa fa-check-circle"></i><span>Thiết kế tại Việt Nam, hướng tới dáng người châu Á</span></li>
              <li><i className="fa fa-check-circle"></i><span>Chất liệu được chọn kỹ, ưu tiên thoáng mát – ít nhăn</span></li>
              <li><i className="fa fa-check-circle"></i><span>Cam kết đổi trả trong 7 ngày nếu bạn không hài lòng</span></li>
            </ul>
            <a href="#" className="btn-brand">Xem thêm câu chuyện của chúng tôi</a>
          </div>
        </div>
      </section>

      {/* SECTION 10: REVIEWS */}
      <section className="reviews-section">
        <div className="section-header"><h2>Khách hàng nói gì?</h2></div>
        <div className="reviews-slider" id="reviewsSlider">
          {[
            { name: 'Thảo N.', loc: 'Hà Nội', text: '"Vải rất mát, form chuẩn, giao hàng nhanh. Sẽ ủng hộ thêm!"' },
            { name: 'Minh H.', loc: 'TP.HCM', text: '"Chất lượng tốt, giá hợp lý. Đóng gói cẩn thận!"' },
            { name: 'Linh P.', loc: 'Đà Nẵng', text: '"Thiết kế đẹp, mặc rất thoải mái. Sẽ quay lại mua tiếp!"' },
          ].map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-header">
                <div className="reviewer-avatar">{r.name[0]}</div>
                <div className="reviewer-info"><h4>{r.name}</h4><p>{r.loc}</p></div>
              </div>
              <div className="review-rating">
                {[1,2,3,4,5].map(s => <i key={s} className="fa fa-star"></i>)}
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 11: NEWSLETTER + SOCIAL */}
      <section className="newsletter-social-section">
        <div className="newsletter-social-container">
          <div className="newsletter-box">
            <h3>Nhận ưu đãi & tin mới nhất</h3>
            <p>Đăng ký email để nhận voucher 10% cho đơn đầu tiên</p>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Email của bạn" required />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
          <div className="social-gallery">
            <h3>#kaitokidlook</h3>
            <div className="social-grid">
              {['/london.png', '/Nhat.png', '/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png', '/ChatGPT Image 22_35_00 22 thg 4, 2025.png'].map((img, i) => (
                <div key={i} className="social-item">
                  <img src={img} alt="Instagram" />
                  <div className="social-overlay"><i className="fab fa-instagram"></i></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
