import { useEffect, useState } from 'react';
import {
  PiArrowRightBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiFireFill,
  PiInstagramLogoFill,
  PiPaperPlaneTiltFill,
  PiSealCheckFill,
  PiStarFill,
  PiSparkleFill,
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { productApi, customerOrderApi, flashSaleApi, type PublicFlashSale } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  getViewedProducts,
  getInterestedCategories,
  getInterestedGender,
  getSearchHistory,
} from '../utils/viewedTracker';
import type { Product } from '../types';
import { matchesProductCategory, matchesProductGender } from '../utils/productTaxonomy';

interface HeroSlide {
  image: string;
  alt: string;
  tagline: string;
  title: string;
  subtitle: string;
  primaryAction: { label: string; to: string };
  secondaryAction: { label: string; to: string };
}

interface HomeReview {
  name: string;
  meta: string;
  text: string;
  rating: number;
}

const defaultHeroSlides: HeroSlide[] = [
  {
    image: '/slide_1.jpg',
    alt: 'Spring Summer 2025',
    tagline: 'SPRING / SUMMER 2025',
    title: 'Everyday Essentials',
    subtitle: 'Những thiết kế tối giản, dễ phối cho mọi ngày của bạn',
    primaryAction: { label: 'Xem bộ sưu tập', to: '/collections' },
    secondaryAction: { label: 'Mua ngay', to: '/products' },
  },
  {
    image: '/slide_2.jpg',
    alt: 'New Collection',
    tagline: 'NEW ARRIVALS',
    title: 'Fresh & Trendy',
    subtitle: 'Khám phá những xu hướng thời trang mới nhất',
    primaryAction: { label: 'Sản phẩm mới', to: '/new-in' },
    secondaryAction: { label: 'Mua ngay', to: '/products' },
  },
  {
    image: '/slide_3.jpg',
    alt: 'Sale Collection',
    tagline: 'SALE UP TO 50%',
    title: 'Summer Sale',
    subtitle: 'Giảm giá lên đến 50% cho toàn bộ bộ sưu tập hè',
    primaryAction: { label: 'Mua ngay', to: '/sale' },
    secondaryAction: { label: 'Xem thêm', to: '/collections' },
  },
];

const categoryTiles = [
  { image: '/london.png', alt: 'Women', title: 'WOMEN', to: '/women' },
  { image: '/Nhat.png', alt: 'Men', title: 'MEN', to: '/men' },
  { image: '/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png', alt: 'New In', title: 'NEW IN', to: '/new-in' },
  { image: '/ChatGPT Image 22_35_00 22 thg 4, 2025.png', alt: 'Sale', title: 'SALE', to: '/sale' },
] as const;

const brandValues = [
  'Thiết kế tại Việt Nam, hướng tới dáng người châu Á',
  'Chất liệu được chọn kỹ, ưu tiên thoáng mát - ít nhăn',
  'Cam kết đổi trả trong 7 ngày nếu bạn không hài lòng',
] as const;

const defaultReviews: HomeReview[] = [
  {
    name: 'Thảo N.',
    meta: 'Hà Nội',
    text: '"Vải rất mát, form chuẩn, giao hàng nhanh. Sẽ ủng hộ thêm!"',
    rating: 5,
  },
  {
    name: 'Minh H.',
    meta: 'TP.HCM',
    text: '"Chất lượng tốt, giá hợp lý. Đóng gói cẩn thận!"',
    rating: 5,
  },
  {
    name: 'Linh P.',
    meta: 'Đà Nẵng',
    text: '"Thiết kế đẹp, mặc rất thoải mái. Sẽ quay lại mua tiếp!"',
    rating: 5,
  },
];

const socialImages = [
  '/london.png',
  '/Nhat.png',
  '/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png',
  '/ChatGPT Image 22_35_00 22 thg 4, 2025.png',
] as const;

const newArrivalsFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nữ', value: 'Nu' },
  { label: 'Nam', value: 'Nam' },
  { label: 'Unisex', value: 'Unisex' },
] as const;

const bestSellerFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Áo', value: 'Ao' },
  { label: 'Quần', value: 'Quan' },
  { label: 'Váy', value: 'Vay' },
  { label: 'Đầm', value: 'Dam' },
] as const;

const emptyStateStyle = {
  gridColumn: '1 / -1',
  padding: '24px 0',
  textAlign: 'center',
  color: '#616161',
} as const;

function matchesCategory(product: Product, filter: string) {
  return matchesProductCategory(product.category, filter);
}

export default function Home() {
  const { user } = useAuth();
  const [heroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recommendReason, setRecommendReason] = useState<string>('Sản phẩm bán chạy mà bạn có thể thích');
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [filteredNewArrivals, setFilteredNewArrivals] = useState<Product[]>([]);
  const [newArrivalsFilter, setNewArrivalsFilter] = useState('all');
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [filteredBestSellers, setFilteredBestSellers] = useState<Product[]>([]);
  const [bestSellersFilter, setBestSellersFilter] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [flashSale, setFlashSale] = useState<PublicFlashSale | null>(null);

  // Show all flags for each section (mặc định chỉ hiện 4 sản phẩm = 1 hàng)
  const [showAllNewArrivals, setShowAllNewArrivals] = useState(false);
  const [showAllSale, setShowAllSale] = useState(false);
  const [showAllBestSellers, setShowAllBestSellers] = useState(false);

  useEffect(() => {
    // Load data từ API thay vì localStorage
    const loadHomeData = async () => {
      try {
        // Load song song bằng Promise.all
        const [newArrivalsResult, saleResult, bestSellersResult] = await Promise.all([
          productApi.getNewArrivals(8),
          productApi.getSaleProducts(8),
          productApi.getBestSellers(8),
        ]);

        // Set new arrivals
        if (newArrivalsResult.success && newArrivalsResult.data) {
          setNewArrivals(newArrivalsResult.data);
        } else {
          setNewArrivals([]);
        }

        // Set sale products
        if (saleResult.success && saleResult.data) {
          setSaleProducts(saleResult.data);
        } else {
          setSaleProducts([]);
        }

        // Set best sellers
        if (bestSellersResult.success && bestSellersResult.data) {
          setBestSellers(bestSellersResult.data);
        } else {
          setBestSellers([]);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
        // Fallback to empty arrays
        setNewArrivals([]);
        setSaleProducts([]);
        setBestSellers([]);
      }
    };

    loadHomeData();
    // Load banners và reviews tạm giữ static (chưa cần API public)
  }, []);

  // Load flash sale đang chạy
  useEffect(() => {
    const loadFlashSale = async () => {
      const result = await flashSaleApi.getActive();
      if (result.success && result.data && result.data.active) {
        setFlashSale(result.data);

        // Tính countdown từ endDate
        if (result.data.endDate) {
          const endTime = new Date(result.data.endDate).getTime();
          const now = Date.now();
          const diff = Math.max(0, endTime - now);

          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setCountdown({ hours, minutes, seconds });
        }
      } else {
        setFlashSale(null);
      }
    };
    loadFlashSale();
  }, []);

  // Load gợi ý sản phẩm cho khách hàng (giống Shopee)
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Tổng hợp dữ liệu hành vi từ localStorage
        const viewedProducts = getViewedProducts();
        const interestedCategories = getInterestedCategories(3);
        const interestedGender = getInterestedGender();
        const searchHistory = getSearchHistory();

        const purchasedProductIds = new Set<number>();
        const wishlistIds = new Set<number>();
        const viewedIds = new Set<number>(viewedProducts.map((p) => p.id));

        // Lấy đơn hàng đã mua (nếu đăng nhập)
        if (user) {
          const ordersResult = await customerOrderApi.getMyOrders().catch(() => null);
          if (ordersResult?.success && ordersResult.data) {
            ordersResult.data.forEach((order) => {
              order.items?.forEach((item) => {
                purchasedProductIds.add(item.productId);
              });
            });
          }
        }

        // Lấy wishlist
        try {
          const wishlist: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
          wishlist.forEach((id) => wishlistIds.add(id));
        } catch {
          // ignore
        }

        // Strategy 1: Đã từng xem sp → lấy related từ sp xem gần nhất
        if (viewedProducts.length > 0) {
          const latestViewed = viewedProducts[0];
          const relatedResult = await productApi.getRelated(latestViewed.id, 8);

          if (relatedResult.success && relatedResult.data && relatedResult.data.length > 0) {
            const filtered = relatedResult.data.filter(
              (p) =>
                !purchasedProductIds.has(p.id) &&
                !viewedIds.has(p.id) &&
                !wishlistIds.has(p.id)
            );

            if (filtered.length >= 3) {
              setRecommendations(filtered.slice(0, 4));
              setRecommendReason(
                latestViewed.name
                  ? `Tương tự "${latestViewed.name}" bạn vừa xem`
                  : 'Tương tự sản phẩm bạn vừa xem'
              );
              return;
            }
          }
        }

        // Strategy 2: Từ category quan tâm nhất (xem nhiều) + gender quan tâm
        if (interestedCategories.length > 0) {
          const result = await productApi.getAll({
            category: interestedCategories[0],
            gender: interestedGender || undefined,
            pageSize: 12,
          });

          if (result.success && result.data) {
            const filtered = result.data.products.filter(
              (p) =>
                !purchasedProductIds.has(p.id) &&
                !viewedIds.has(p.id)
            );

            if (filtered.length >= 3) {
              setRecommendations(filtered.slice(0, 4));
              setRecommendReason(`Dành cho bạn yêu thích ${interestedCategories[0]}`);
              return;
            }
          }
        }

        // Strategy 3: Từ keyword tìm kiếm gần nhất
        if (searchHistory.length > 0) {
          const latestSearch = searchHistory[0];
          const result = await productApi.getAll({
            search: latestSearch.keyword,
            pageSize: 8,
          });

          if (result.success && result.data && result.data.products.length > 0) {
            const filtered = result.data.products.filter(
              (p) => !purchasedProductIds.has(p.id) && !viewedIds.has(p.id)
            );

            if (filtered.length >= 3) {
              setRecommendations(filtered.slice(0, 4));
              setRecommendReason(`Liên quan đến "${latestSearch.keyword}" bạn đã tìm`);
              return;
            }
          }
        }

        // Strategy 4: Sản phẩm đã mua → gợi ý related
        if (purchasedProductIds.size > 0) {
          const firstId = Array.from(purchasedProductIds)[0];
          const relatedResult = await productApi.getRelated(firstId, 8);

          if (relatedResult.success && relatedResult.data && relatedResult.data.length > 0) {
            const filtered = relatedResult.data.filter(
              (p) => !purchasedProductIds.has(p.id)
            );

            if (filtered.length > 0) {
              setRecommendations(filtered.slice(0, 4));
              setRecommendReason('Dựa trên đơn hàng đã mua');
              return;
            }
          }
        }

        // Strategy 5: Wishlist → gợi ý related
        if (wishlistIds.size > 0) {
          const firstId = Array.from(wishlistIds)[0];
          const relatedResult = await productApi.getRelated(firstId, 8);

          if (relatedResult.success && relatedResult.data && relatedResult.data.length > 0) {
            const filtered = relatedResult.data.filter(
              (p) => !wishlistIds.has(p.id)
            );

            if (filtered.length > 0) {
              setRecommendations(filtered.slice(0, 4));
              setRecommendReason('Dựa trên sản phẩm bạn yêu thích');
              return;
            }
          }
        }

        // Fallback: sản phẩm bán chạy
        const fallback = await productApi.getBestSellers(4);
        if (fallback.success && fallback.data) {
          setRecommendations(fallback.data);
          setRecommendReason('Sản phẩm bán chạy mà bạn có thể thích');
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, [user]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (newArrivalsFilter === 'all') {
      setFilteredNewArrivals(newArrivals);
      return;
    }

    setFilteredNewArrivals(newArrivals.filter((product) => matchesProductGender(product.gender, newArrivalsFilter)));
  }, [newArrivals, newArrivalsFilter]);

  useEffect(() => {
    if (bestSellersFilter === 'all') {
      setFilteredBestSellers(bestSellers);
      return;
    }

    setFilteredBestSellers(bestSellers.filter((product) => matchesCategory(product, bestSellersFilter)));
  }, [bestSellers, bestSellersFilter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((previousSlide) => (previousSlide + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!flashSale?.active) return;

    const timer = window.setInterval(() => {
      setCountdown((previousCountdown) => {
        let { hours, minutes, seconds } = previousCountdown;

        seconds -= 1;

        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }

        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }

        if (hours < 0) {
          // Hết giờ → tắt flash sale
          setFlashSale(null);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [flashSale?.active]);

  const prevSlide = () => setCurrentSlide((previousSlide) => (previousSlide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setCurrentSlide((previousSlide) => (previousSlide + 1) % heroSlides.length);

  return (
    <div className="home-page">
      <section className="hero-banner">
        {heroSlides.map((slide, index) => (
          <div key={`${slide.title}-${index}`} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
            <Link to={slide.primaryAction.to}>
              <img src={slide.image} alt={slide.alt} />
            </Link>
          </div>
        ))}

        <div className="hero-controls">
          <button className="hero-arrow prev" onClick={prevSlide} type="button" aria-label="Slide trước">
            <PiCaretLeftBold aria-hidden="true" />
          </button>
          <button className="hero-arrow next" onClick={nextSlide} type="button" aria-label="Slide tiếp theo">
            <PiCaretRightBold aria-hidden="true" />
          </button>
        </div>

        <div className="hero-dots">
          {heroSlides.map((slide, index) => (
            <span
              key={`${slide.title}-dot-${index}`}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      <section className="category-section">
        <div className="category-grid">
          {categoryTiles.map((tile) => (
            <Link key={tile.title} to={tile.to} className="category-tile">
              <img src={tile.image} alt={tile.alt} />
              <div className="category-overlay">
                <h3>{tile.title}</h3>
                <span className="category-overlay-cta">
                  <span>Khám phá ngay</span>
                  <PiArrowRightBold aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="products-section" id="section-newarrivals">
        <div className="section-header">
          <h2>NEW ARRIVALS</h2>
          <p>Cập nhật mẫu mới mỗi tuần</p>
        </div>

        <div className="filter-tabs">
          {newArrivalsFilters.map((filter) => (
            <button
              key={filter.value}
              className={`tab filter-btn ${newArrivalsFilter === filter.value ? 'active' : ''}`}
              onClick={() => setNewArrivalsFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="products-grid" id="new-arrivals-grid">
          {filteredNewArrivals.length > 0 ? (
            (showAllNewArrivals ? filteredNewArrivals : filteredNewArrivals.slice(0, 4)).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Sản phẩm mới sẽ được cập nhật sớm.</p>
          )}
        </div>

        <div className="view-all-container">
          {filteredNewArrivals.length > 4 ? (
            <button
              type="button"
              className="btn-view-all"
              onClick={() => setShowAllNewArrivals(!showAllNewArrivals)}
            >
              {showAllNewArrivals ? 'Thu gọn' : `Xem thêm (${filteredNewArrivals.length - 4})`}
            </button>
          ) : (
            <Link to="/new-in" className="btn-view-all">
              Xem tất cả
            </Link>
          )}
        </div>
      </section>

      <section className="products-section sale-products-section" id="section-saleproducts">
        <div className="section-header">
          <h2 className="section-title-with-icon">
            <PiFireFill aria-hidden="true" />
            <span>ĐANG GIẢM GIÁ</span>
          </h2>
          <p>Săn sale ngay - Số lượng có hạn</p>
        </div>

        <div className="products-grid sale-grid" id="sale-products-grid">
          {saleProducts.length > 0 ? (
            (showAllSale ? saleProducts : saleProducts.slice(0, 4)).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Danh sách sản phẩm sale đang được cập nhật.</p>
          )}
        </div>

        <div className="view-all-container">
          {saleProducts.length > 4 ? (
            <button
              type="button"
              className="btn-view-all"
              onClick={() => setShowAllSale(!showAllSale)}
            >
              {showAllSale ? 'Thu gọn' : `Xem thêm (${saleProducts.length - 4})`}
            </button>
          ) : (
            <Link to="/sale" className="btn-view-all">
              Xem tất cả
            </Link>
          )}
        </div>
      </section>

      <section className="products-section bestseller-section" id="section-bestsellers">
        <div className="section-header">
          <h2>BEST SELLERS</h2>
          <p>Được yêu thích nhất tuần này</p>
        </div>

        <div className="filter-tabs">
          {bestSellerFilters.map((filter) => (
            <button
              key={filter.value}
              className={`tab filter-btn ${bestSellersFilter === filter.value ? 'active' : ''}`}
              onClick={() => setBestSellersFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="products-grid bestseller-grid" id="bestsellers-grid">
          {filteredBestSellers.length > 0 ? (
            (showAllBestSellers ? filteredBestSellers : filteredBestSellers.slice(0, 4)).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Sản phẩm bán chạy sẽ hiển thị tại đây.</p>
          )}
        </div>

        <div className="view-all-container">
          {filteredBestSellers.length > 4 ? (
            <button
              type="button"
              className="btn-view-all"
              onClick={() => setShowAllBestSellers(!showAllBestSellers)}
            >
              {showAllBestSellers ? 'Thu gọn' : `Xem thêm (${filteredBestSellers.length - 4})`}
            </button>
          ) : (
            <Link to="/bestseller" className="btn-view-all">
              Xem tất cả
            </Link>
          )}
        </div>
      </section>

      {flashSale?.active && flashSale.items && flashSale.items.length > 0 && (
        <section className="flash-sale-section" id="section-flashsale">
          <div className="flash-sale-header">
            <h2>{flashSale.name || 'FLASH SALE'}</h2>
            <div className="countdown-timer" id="countdown">
              <span style={{ marginRight: 8, color: '#fff' }}>Kết thúc sau:</span>
              <span className="time-unit">
                <span id="hours">{String(countdown.hours).padStart(2, '0')}</span>h
              </span>
              <span className="time-unit">
                <span id="minutes">{String(countdown.minutes).padStart(2, '0')}</span>m
              </span>
              <span className="time-unit">
                <span id="seconds">{String(countdown.seconds).padStart(2, '0')}</span>s
              </span>
            </div>
          </div>

          <div className="flash-sale-grid">
            {flashSale.items.map((item) => {
              const discount = item.originalPrice > 0
                ? Math.round((1 - item.flashPrice / item.originalPrice) * 100)
                : 0;
              const soldPercent = item.stockLimit > 0
                ? Math.round((item.sold / item.stockLimit) * 100)
                : 0;
              const remaining = Math.max(0, item.stockLimit - item.sold);

              return (
                <Link
                  key={item.id}
                  to={`/product/${item.productId}`}
                  className="flash-sale-card"
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                    {discount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: '#ef4444',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <h4 style={{
                      fontSize: 14,
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 40,
                    }}>
                      {item.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 16 }}>
                        {item.flashPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {item.originalPrice > item.flashPrice && (
                        <span style={{ color: '#999', textDecoration: 'line-through', fontSize: 12 }}>
                          {item.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: 10,
                      overflow: 'hidden',
                      height: 16,
                      position: 'relative',
                    }}>
                      <div style={{
                        background: 'linear-gradient(to right, #ef4444, #f59e0b)',
                        width: `${soldPercent}%`,
                        height: '100%',
                        transition: 'width 0.3s',
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#1f2937',
                      }}>
                        {remaining > 0 ? `Đã bán ${item.sold}` : 'Đã hết'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="brand-values-section">
        <div className="brand-container">
          <div className="brand-image">
            <img src="/london.png" alt="Về KAITO KID" />
          </div>

          <div className="brand-content">
            <h2>Chúng tôi là KAITO KID</h2>

            <ul className="brand-values">
              {brandValues.map((value) => (
                <li key={value}>
                  <PiSealCheckFill aria-hidden="true" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>

            <Link to="/collections" className="btn-brand">
              Xem thêm câu chuyện của chúng tôi
            </Link>
          </div>
        </div>
      </section>

      <section className="reviews-section recommendations-section">
        <div className="section-header">
          <h2>
            <PiSparkleFill aria-hidden="true" style={{ color: '#f59e0b', marginRight: 8, verticalAlign: 'middle' }} />
            Gợi ý cho bạn
          </h2>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
            {recommendReason}
          </p>
        </div>

        <div className="sanphams" style={{ marginTop: 24 }}>
          {recommendations.length > 0 ? (
            recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p style={emptyStateStyle}>Đang tải gợi ý...</p>
          )}
        </div>

        {recommendations.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#0ea5e9',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Khám phá thêm sản phẩm <PiArrowRightBold />
            </Link>
          </div>
        )}
      </section>

      <section className="newsletter-social-section">
        <div className="newsletter-social-container">
          <div className="newsletter-box">
            <h3>Nhận ưu đãi & tin mới nhất</h3>
            <p>Đăng ký email để nhận voucher 10% cho đơn đầu tiên</p>

            <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Email của bạn" required />
              <button type="submit">
                <PiPaperPlaneTiltFill aria-hidden="true" />
                <span>Đăng ký</span>
              </button>
            </form>

            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>Tôi đồng ý với Chính sách bảo mật</span>
            </label>
          </div>

          <div className="social-gallery">
            <h3>#kaitokidlook</h3>

            <div className="social-grid">
              {socialImages.map((image) => (
                <div key={image} className="social-item">
                  <img src={image} alt="Instagram" />
                  <div className="social-overlay">
                    <PiInstagramLogoFill aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
