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
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { readStoredBanners, type BannerItem } from '../utils/bannerConfig';
import { matchesProductCategory, matchesProductGender } from '../utils/productTaxonomy';
import { getHomepageReviews, readStoredReviews, type ReviewRecord } from '../utils/reviewConfig';

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

type HomepageSectionKey = 'newArrivals' | 'saleProducts' | 'bestSellers';

type HomepageSectionsConfig = Partial<Record<HomepageSectionKey, number[]>>;

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

function readHomepageSectionsConfig(): HomepageSectionsConfig | null {
  try {
    const rawValue = localStorage.getItem('homepageSections');

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue as HomepageSectionsConfig;
  } catch {
    return null;
  }
}

function hasConfiguredHomepageSection(config: HomepageSectionsConfig | null, sectionKey: HomepageSectionKey): boolean {
  return !!config && Object.prototype.hasOwnProperty.call(config, sectionKey) && Array.isArray(config[sectionKey]);
}

function getFallbackNewArrivals(products: Product[]) {
  const newProducts = products
    .filter((product) => product.isNew)
    .sort((first, second) => second.id - first.id);

  return (newProducts.length > 0 ? newProducts : [...products].sort((first, second) => second.id - first.id)).slice(0, 8);
}

function getFallbackSaleProducts(products: Product[]) {
  const saleProducts = products
    .filter((product) => product.isSale || (!!product.oldPrice && product.oldPrice > product.price))
    .sort((first, second) => {
      const firstDiscount = first.oldPrice ? first.oldPrice - first.price : 0;
      const secondDiscount = second.oldPrice ? second.oldPrice - second.price : 0;
      return secondDiscount - firstDiscount;
    });

  return saleProducts.slice(0, 8);
}

function getFallbackBestSellers(products: Product[]) {
  const bestSellerProducts = products
    .filter((product) => product.isBestSeller)
    .sort((first, second) => second.soldCount - first.soldCount);

  return (bestSellerProducts.length > 0 ? bestSellerProducts : [...products].sort((first, second) => second.soldCount - first.soldCount)).slice(0, 8);
}

function matchesCategory(product: Product, filter: string) {
  return matchesProductCategory(product.category, filter);
}

function mapBannerToHeroSlide(banner: BannerItem): HeroSlide {
  const primaryLink = banner.primaryButtonLink?.trim() || banner.link?.trim() || '/products';
  const index = Math.max((banner.order || 1) - 1, 0);
  const primaryLabel = index === 0 ? 'Khám phá ngay' : index === 1 ? 'Xem chi tiết' : 'Mua ngay';
  const secondaryLink = primaryLink === '/products' ? '/collections' : '/products';
  const resolvedPrimaryLabel = banner.primaryButtonLabel?.trim() || primaryLabel;
  const resolvedTagline = banner.tagline?.trim() || `FEATURED ${String(index + 1).padStart(2, '0')}`;
  const resolvedSubtitle = banner.subtitle?.trim() || banner.description?.trim() || 'Khám phá bộ sưu tập nổi bật từ KAITO KID';
  const resolvedSecondaryLabel = banner.secondaryButtonLabel?.trim() || 'Xem tất cả';

  const heroSlide: HeroSlide = {
    image: banner.imageUrl,
    alt: banner.title,
    tagline: resolvedTagline,
    title: banner.title,
    subtitle: resolvedSubtitle,
    primaryAction: { label: resolvedPrimaryLabel, to: primaryLink },
    secondaryAction: { label: resolvedSecondaryLabel, to: secondaryLink },
  };

  return heroSlide;
}

function mapReviewToHomeReview(review: ReviewRecord): HomeReview {
  return {
    name: review.customerName?.trim() || 'Khách hàng',
    meta: review.productName?.trim() || `Đơn hàng ${review.orderId}`,
    text: `"${review.comment?.trim() || 'Sản phẩm rất đáng thử!'}"`,
    rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
  };
}

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [reviews, setReviews] = useState<HomeReview[]>(defaultReviews);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [filteredNewArrivals, setFilteredNewArrivals] = useState<Product[]>([]);
  const [newArrivalsFilter, setNewArrivalsFilter] = useState('all');
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [filteredBestSellers, setFilteredBestSellers] = useState<Product[]>([]);
  const [bestSellersFilter, setBestSellersFilter] = useState('all');
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 15, seconds: 32 });

  useEffect(() => {
    const activeProducts = productService.getActive();
    const homepageSectionsConfig = readHomepageSectionsConfig();
    const configuredNewArrivals = productService.getNewArrivals();
    const configuredSaleProducts = productService.getSaleProducts();
    const configuredBestSellers = productService.getBestSellers();
    const nextNewArrivals = hasConfiguredHomepageSection(homepageSectionsConfig, 'newArrivals')
      ? configuredNewArrivals
      : getFallbackNewArrivals(activeProducts);
    const nextSaleProducts = hasConfiguredHomepageSection(homepageSectionsConfig, 'saleProducts')
      ? configuredSaleProducts
      : getFallbackSaleProducts(activeProducts);
    const nextBestSellers = hasConfiguredHomepageSection(homepageSectionsConfig, 'bestSellers')
      ? configuredBestSellers
      : getFallbackBestSellers(activeProducts);

    setNewArrivals(nextNewArrivals);
    setFilteredNewArrivals(nextNewArrivals);
    setSaleProducts(nextSaleProducts);
    setBestSellers(nextBestSellers);
    setFilteredBestSellers(nextBestSellers);
    setFlashSaleProducts(nextSaleProducts.slice(0, 4));
  }, []);

  useEffect(() => {
    const loadHomepageContent = () => {
      const storedBanners = readStoredBanners()
        .filter((banner) => banner.type === 'slider' && banner.status === 'active' && banner.position === 'homepage')
        .sort((first, second) => first.order - second.order);

      if (storedBanners.length > 0) {
        setHeroSlides(storedBanners.slice(0, 3).map(mapBannerToHeroSlide));
      } else {
        setHeroSlides(defaultHeroSlides);
      }

      const storedReviews = getHomepageReviews(readStoredReviews())
        .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

      if (storedReviews.length > 0) {
        setReviews(storedReviews.slice(0, 3).map(mapReviewToHomeReview));
      } else {
        setReviews(defaultReviews);
      }
    };

    loadHomepageContent();
    window.addEventListener('storage', loadHomepageContent);

    return () => window.removeEventListener('storage', loadHomepageContent);
  }, []);

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
          hours = 23;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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
            filteredNewArrivals.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Sản phẩm mới sẽ được cập nhật sớm.</p>
          )}
        </div>

        <div className="view-all-container">
          <Link to="/new-in" className="btn-view-all">
            Xem tất cả
          </Link>
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
            saleProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Danh sách sản phẩm sale đang được cập nhật.</p>
          )}
        </div>

        <div className="view-all-container">
          <Link to="/sale" className="btn-view-all">
            Xem tất cả
          </Link>
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
            filteredBestSellers.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Sản phẩm bán chạy sẽ hiển thị tại đây.</p>
          )}
        </div>

        <div className="view-all-container">
          <Link to="/bestseller" className="btn-view-all">
            Xem tất cả
          </Link>
        </div>
      </section>

      <section className="flash-sale-section" id="section-flashsale">
        <div className="flash-sale-header">
          <h2>FLASH SALE 24H</h2>
          <div className="countdown-timer" id="countdown">
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
          {flashSaleProducts.length > 0 ? (
            flashSaleProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p style={emptyStateStyle}>Flash sale sẽ xuất hiện ngay khi có chương trình mới.</p>
          )}
        </div>
      </section>

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

      <section className="reviews-section">
        <div className="section-header">
          <h2>Khách hàng nói gì?</h2>
        </div>

        <div className="reviews-slider" id="reviewsSlider">
          {reviews.map((review, index) => (
            <div key={`${review.name}-${index}`} className="review-card">
              <div className="review-header">
                <div className="reviewer-avatar">{review.name.charAt(0)}</div>
                <div className="reviewer-info">
                  <h4>{review.name}</h4>
                  <p>{review.meta}</p>
                </div>
              </div>

              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <PiStarFill
                    key={star}
                    aria-hidden="true"
                    style={{ opacity: star <= review.rating ? 1 : 0.25 }}
                  />
                ))}
              </div>

              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
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
