// Modern Fashion JavaScript

// Hero Slider - Global variables
let currentSlide = 0;
let slides = [];
let dots = [];
let autoSlideInterval = null;

// Initialize Hero Slider
function initHeroSlider() {
  slides = document.querySelectorAll('.hero-slide');
  dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0) {
    console.warn('No hero slides found');
    return;
  }
  
  // Show first slide
  showSlide(0);
  
  // Auto slide every 5 seconds
  if (autoSlideInterval) clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(nextSlide, 5000);
  
  console.log('✅ Hero slider initialized with', slides.length, 'slides');
}

function showSlide(n) {
  if (slides.length === 0) return;
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  if (n >= slides.length) currentSlide = 0;
  if (n < 0) currentSlide = slides.length - 1;
  
  if (slides[currentSlide]) {
    slides[currentSlide].classList.add('active');
  }
  if (dots[currentSlide]) {
    dots[currentSlide].classList.add('active');
  }
}

// Make functions globally accessible
window.nextSlide = function() {
  currentSlide++;
  showSlide(currentSlide);
  console.log('Next slide:', currentSlide);
}

window.prevSlide = function() {
  currentSlide--;
  showSlide(currentSlide);
  console.log('Prev slide:', currentSlide);
}

window.goToSlide = function(n) {
  currentSlide = n;
  showSlide(currentSlide);
  console.log('Go to slide:', n);
}

// Countdown Timer
function startCountdown() {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;

  let hours = 2;
  let minutes = 15;
  let seconds = 32;

  setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
    }
    if (minutes < 0) {
      minutes = 59;
      hours--;
    }
    if (hours < 0) {
      hours = 23;
    }

    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const megaMenu = document.querySelector('.mega-menu');

if (mobileToggle && megaMenu) {
  mobileToggle.addEventListener('click', () => {
    megaMenu.classList.toggle('active');
  });

  // Mobile mega dropdown toggle
  const megaDropdownItems = document.querySelectorAll('.has-mega-dropdown');
  megaDropdownItems.forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('active');
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!megaMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      megaMenu.classList.remove('active');
    }
  });
}

// Filter Tabs
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // Add filter logic here
  });
});

// Cart Count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity || 1;
  });
  
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = totalItems;
    countElement.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
    newsletterForm.reset();
  });
}

// Account Dropdown Management
function updateAccountDropdown() {
  // Wait a bit to ensure auth-check.js has finished
  setTimeout(() => {
    // Check multiple login methods for compatibility
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username') || localStorage.getItem('adminUser');
    
    // Also check for currentUser object (new method)
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
      // Ignore parse errors
    }
    
    const accountGuest = document.getElementById('accountGuest');
    const accountUser = document.getElementById('accountUser');
    const adminMenuItem = document.getElementById('adminMenuItem');
    
    // Check if user is logged in (either method)
    const isLoggedIn = userLoggedIn || adminLoggedIn || currentUser;
    
    console.log('Account Dropdown Update:', {
      isLoggedIn,
      userLoggedIn,
      adminLoggedIn,
      userType,
      username
    });
    
    if (isLoggedIn) {
      // User is logged in
      if (accountGuest) accountGuest.style.display = 'none';
      if (accountUser) accountUser.style.display = 'block';
      
      // Update user info
      const displayName = currentUser?.name || currentUser?.username || username || 'Người dùng';
      const displayEmail = currentUser?.email || (username ? username + '@kaitokid.com' : '');
      
      const userNameElement = document.getElementById('userName');
      const userEmailElement = document.getElementById('userEmail');
      
      if (userNameElement) userNameElement.textContent = displayName;
      if (userEmailElement) userEmailElement.textContent = displayEmail;
      
      // Check if user is admin (multiple methods)
      const isAdmin = userType === 'admin' || adminLoggedIn || currentUser?.role === 'admin';
      
      console.log('Is Admin:', isAdmin);
      
      // Show admin menu item if user is admin
      if (isAdmin) {
        if (adminMenuItem) {
          adminMenuItem.style.display = 'flex';
        }
        // Also show the fixed admin button
        const adminButtonContainer = document.getElementById('adminButtonContainer');
        if (adminButtonContainer) {
          adminButtonContainer.style.display = 'block';
        }
      } else {
        if (adminMenuItem) {
          adminMenuItem.style.display = 'none';
        }
      }
    } else {
      // User is not logged in
      if (accountGuest) accountGuest.style.display = 'block';
      if (accountUser) accountUser.style.display = 'none';
    }
  }, 100); // Small delay to ensure other scripts have run
}

// Logout functionality
function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    // Clear all login data (both old and new methods)
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    
    alert('Đã đăng xuất thành công!');
    window.location.href = 'login.html';
  }
}

// Attach logout handler
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});

// Close account dropdown when clicking outside
document.addEventListener('click', (e) => {
  const accountWrapper = document.querySelector('.account-dropdown-wrapper');
  const accountDropdown = document.getElementById('accountDropdown');
  
  if (accountWrapper && !accountWrapper.contains(e.target)) {
    accountDropdown.style.opacity = '0';
    accountDropdown.style.visibility = 'hidden';
    accountDropdown.style.transform = 'translateY(-10px)';
  }
});

// Prevent dropdown from closing when clicking inside
const accountDropdown = document.getElementById('accountDropdown');
if (accountDropdown) {
  accountDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Initialize - Run immediately and on DOMContentLoaded
function initializeApp() {
  initHeroSlider();
  startCountdown();
  updateCartCount();
  updateAccountDropdown();
  
  // Debug: Log current login status
  console.log('Login Status:', {
    userLoggedIn: localStorage.getItem('userLoggedIn'),
    adminLoggedIn: localStorage.getItem('adminLoggedIn'),
    userType: localStorage.getItem('userType'),
    username: localStorage.getItem('username'),
    adminUser: localStorage.getItem('adminUser')
  });
}

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Also run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // Still loading, wait for DOMContentLoaded
} else {
  // DOM is already ready, execute now
  initializeApp();
}

// Listen for storage changes (when user logs in/out in another tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'userLoggedIn' || e.key === 'adminLoggedIn' || e.key === 'userType') {
    updateAccountDropdown();
  }
});

// Also update when page becomes visible (in case login happened in another tab)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateAccountDropdown();
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


// ============================================
// DYNAMIC MENU LOADER FROM ADMIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadDynamicMenu();
});

function loadDynamicMenu() {
  // Get menu items from localStorage (saved from admin panel)
  const savedMenuItems = localStorage.getItem('menuItems');
  if (!savedMenuItems) return;
  
  try {
    const menuItems = JSON.parse(savedMenuItems);
    const menuList = document.getElementById('mainMenuList');
    if (!menuList) return;
    
    // Sort by order
    menuItems.sort((a, b) => a.order - b.order);
    
    // Create menu items HTML
    let menuHTML = '';
    menuItems.forEach(item => {
      menuHTML += `
        <li>
          <a href="${item.link}" target="${item.target}">${item.name}</a>
        </li>
      `;
    });
    
    // Insert at the beginning of menu list
    menuList.insertAdjacentHTML('afterbegin', menuHTML);
    
    console.log('✅ Đã load', menuItems.length, 'menu items từ admin');
  } catch (error) {
    console.error('Lỗi khi load menu:', error);
  }
}


// ============================================
// HOMEPAGE SECTIONS VISIBILITY CONTROL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadSectionVisibility();
  loadFlashSaleSection();
  loadCustomerReviews();
});

// ============================================
// CUSTOMER REVIEWS - LOAD FROM ADMIN
// ============================================
function loadCustomerReviews() {
  const reviewsSlider = document.getElementById('reviewsSlider');
  if (!reviewsSlider) return;
  
  // Get reviews from localStorage (saved by admin)
  const savedReviews = localStorage.getItem('reviews');
  if (!savedReviews) {
    console.log('⭐ Không có dữ liệu reviews từ admin - giữ nguyên mặc định');
    return;
  }
  
  try {
    const allReviews = JSON.parse(savedReviews);
    
    // Filter: only 5-star reviews that are approved, sorted by newest
    const fiveStarReviews = allReviews
      .filter(r => r.rating === 5 && r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6); // Max 6 reviews
    
    if (fiveStarReviews.length === 0) {
      console.log('⭐ Không có đánh giá 5 sao đã duyệt - giữ nguyên mặc định');
      return;
    }
    
    // Render reviews
    reviewsSlider.innerHTML = fiveStarReviews.map(review => {
      const initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : 'K';
      const shortName = getShortName(review.customerName);
      const location = getRandomLocation();
      
      return `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-avatar">${initial}</div>
            <div class="reviewer-info">
              <h4>${shortName}</h4>
              <p>${location}</p>
            </div>
          </div>
          <div class="review-rating">
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
          </div>
          <p class="review-text">"${review.comment}"</p>
        </div>
      `;
    }).join('');
    
    console.log('⭐ Đã load', fiveStarReviews.length, 'đánh giá 5 sao từ admin');
    
  } catch (error) {
    console.error('Lỗi khi load reviews:', error);
  }
}

// Get short name (e.g., "Nguyễn Văn A" -> "Văn A.")
function getShortName(fullName) {
  if (!fullName) return 'Khách hàng';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  // Get last 2 parts and add initial
  const lastName = parts[parts.length - 1];
  const middleName = parts.length > 2 ? parts[parts.length - 2] : '';
  return middleName ? `${middleName} ${lastName.charAt(0)}.` : `${lastName.charAt(0)}.`;
}

// Get random location for display
function getRandomLocation() {
  const locations = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Bình Dương'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function loadSectionVisibility() {
  // Get section settings from localStorage (set by admin)
  const savedSettings = localStorage.getItem('homepageSections');
  if (!savedSettings) return;
  
  try {
    const settings = JSON.parse(savedSettings);
    
    // Apply visibility settings
    if (settings.saleproducts === false) {
      hideSection('section-saleproducts');
    }
    if (settings.bestsellers === false) {
      hideSection('section-bestsellers');
    }
    if (settings.lookbook === false) {
      hideSection('section-lookbook');
    }
    if (settings.flashsale === false) {
      hideSection('section-flashsale');
    }
    
    console.log('✅ Đã áp dụng cài đặt hiển thị sections:', settings);
  } catch (error) {
    console.error('Lỗi khi load section visibility:', error);
  }
}

function hideSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'none';
  }
}

// ============================================
// FLASH SALE SECTION - LOAD FROM ADMIN DATA
// ============================================
function loadFlashSaleSection() {
  const flashSaleSection = document.getElementById('section-flashsale');
  if (!flashSaleSection) return;
  
  // Get flash sales from localStorage (saved by admin)
  const savedFlashSales = localStorage.getItem('flashSales');
  
  if (!savedFlashSales) {
    // No flash sales data - hide section
    flashSaleSection.style.display = 'none';
    console.log('⚡ Không có dữ liệu Flash Sale - ẩn section');
    return;
  }
  
  try {
    const flashSales = JSON.parse(savedFlashSales);
    const now = new Date();
    
    // Find active flash sale (currently running)
    const activeFlashSale = flashSales.find(fs => {
      const start = new Date(fs.startTime);
      const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
      return start <= now && end >= now;
    });
    
    if (!activeFlashSale) {
      // No active flash sale - hide section
      flashSaleSection.style.display = 'none';
      console.log('⚡ Không có Flash Sale đang diễn ra - ẩn section');
      return;
    }
    
    // Show section and render flash sale
    flashSaleSection.style.display = 'block';
    renderActiveFlashSale(activeFlashSale);
    console.log('⚡ Đang hiển thị Flash Sale:', activeFlashSale.name);
    
  } catch (error) {
    console.error('Lỗi khi load Flash Sale:', error);
    flashSaleSection.style.display = 'none';
  }
}

function renderActiveFlashSale(flashSale) {
  const start = new Date(flashSale.startTime);
  const end = new Date(start.getTime() + flashSale.duration * 60 * 60 * 1000);
  
  // Update header title
  const headerTitle = document.querySelector('.flash-sale-header h2');
  if (headerTitle) {
    headerTitle.textContent = flashSale.name || 'FLASH SALE';
  }
  
  // Start countdown timer
  startFlashSaleCountdown(end);
  
  // Render products
  const grid = document.querySelector('.flash-sale-grid');
  if (grid && flashSale.products && flashSale.products.length > 0) {
    grid.innerHTML = flashSale.products.map(product => {
      const originalPrice = product.price;
      const discountPercent = product.discount || 0;
      const salePrice = Math.round(originalPrice * (1 - discountPercent / 100));
      const productLink = `chitietsanpham.html?id=${product.id}`;
      
      return `
        <div class="flash-product-card" onclick="window.location.href='${productLink}'" style="cursor: pointer;">
          <div class="flash-product-badge">-${discountPercent}%</div>
          <a href="${productLink}" class="flash-product-link">
            <img src="${product.image}" alt="${product.name}" class="flash-product-image">
          </a>
          <div class="flash-product-info">
            <a href="${productLink}" class="flash-product-name-link">
              <h4 class="flash-product-name">${product.name}</h4>
            </a>
            <div class="flash-product-prices">
              <span class="flash-price-sale">${formatPriceVND(salePrice)}</span>
              <span class="flash-price-original">${formatPriceVND(originalPrice)}</span>
            </div>
            <div class="flash-product-actions">
              <button class="btn-flash-buy" onclick="event.stopPropagation(); addFlashSaleToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${salePrice}, '${product.image}')">
                <i class="fa fa-shopping-cart"></i> Mua ngay
              </button>
              <a href="${productLink}" class="btn-flash-detail" onclick="event.stopPropagation();">
                <i class="fa fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    // No products in flash sale
    grid.innerHTML = '<p style="color: #fff; text-align: center; width: 100%;">Chưa có sản phẩm trong Flash Sale này</p>';
  }
}

// Add flash sale product to cart
function addFlashSaleToCart(productId, productName, salePrice, productImage) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: salePrice,
      image: productImage,
      quantity: 1,
      isFlashSale: true
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show notification
  showAddToCartNotification(productName);
}

// Show add to cart notification
function showAddToCartNotification(productName) {
  const existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <i class="fa fa-check-circle"></i>
    <span>Đã thêm "${productName}" vào giỏ hàng!</span>
    <a href="GioHang.html">Xem giỏ hàng</a>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function startFlashSaleCountdown(endTime) {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;
  
  const updateTimer = () => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) {
      // Flash sale ended - hide section
      const section = document.getElementById('section-flashsale');
      if (section) section.style.display = 'none';
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  };
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

function formatPriceVND(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}


// ============================================
// PREMIUM ANIMATIONS & EFFECTS
// ============================================

// Scroll Reveal Animation
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;
    
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check
}

// Parallax Effect
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = -(window.pageYOffset * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// Magnetic Button Effect
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  
  magneticButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0) scale(1)';
    });
  });
}

// 3D Card Tilt Effect
function init3DCards() {
  const cards = document.querySelectorAll('.card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// Countdown Timer
function initCountdown(endDate, elementId) {
  const countdownElement = document.getElementById(elementId);
  if (!countdownElement) return;
  
  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = new Date(endDate).getTime() - now;
    
    if (distance < 0) {
      countdownElement.innerHTML = '<div class="countdown-expired">Đã kết thúc!</div>';
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdownElement.innerHTML = `
      <div class="countdown-item">
        <div class="countdown-number">${days}</div>
        <div class="countdown-label">Ngày</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${hours}</div>
        <div class="countdown-label">Giờ</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${minutes}</div>
        <div class="countdown-label">Phút</div>
      </div>
      <div class="countdown-item">
        <div class="countdown-number">${seconds}</div>
        <div class="countdown-label">Giây</div>
      </div>
    `;
  };
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Lazy Loading Images
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Add to Cart Animation
function animateAddToCart(button, cartIcon) {
  const buttonRect = button.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();
  
  const flyingItem = document.createElement('div');
  flyingItem.className = 'flying-item';
  flyingItem.style.cssText = `
    position: fixed;
    left: ${buttonRect.left}px;
    top: ${buttonRect.top}px;
    width: 30px;
    height: 30px;
    background: var(--primary-gradient);
    border-radius: 50%;
    z-index: 9999;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  document.body.appendChild(flyingItem);
  
  setTimeout(() => {
    flyingItem.style.left = cartRect.left + 'px';
    flyingItem.style.top = cartRect.top + 'px';
    flyingItem.style.transform = 'scale(0)';
    flyingItem.style.opacity = '0';
  }, 10);
  
  setTimeout(() => {
    flyingItem.remove();
    // Animate cart icon
    cartIcon.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
      cartIcon.style.animation = '';
    }, 500);
  }, 800);
}

// Number Counter Animation
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// Progress Bar Animation
function animateProgressBar(element, percentage) {
  const fill = element.querySelector('.progress-fill');
  if (fill) {
    setTimeout(() => {
      fill.style.width = percentage + '%';
    }, 100);
  }
}

// Toast Notification
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--success-gradient)' : 
                 type === 'error' ? 'var(--secondary-gradient)' : 
                 'var(--primary-gradient)'};
    color: white;
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    font-weight: 600;
    font-size: 14px;
    animation: slideInRight 0.5s ease-out;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInLeft 0.5s ease-out reverse';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initParallax();
  initMagneticButtons();
  init3DCards();
  initSmoothScroll();
  initLazyLoading();
  
  // Initialize counters
  document.querySelectorAll('[data-counter]').forEach(element => {
    const target = parseInt(element.dataset.counter);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(element, target);
          observer.unobserve(element);
        }
      });
    });
    observer.observe(element);
  });
  
  // Initialize progress bars
  document.querySelectorAll('.progress-bar').forEach(bar => {
    const percentage = bar.dataset.percentage || 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateProgressBar(bar, percentage);
          observer.unobserve(bar);
        }
      });
    });
    observer.observe(bar);
  });
});

// Export functions for use in other scripts
window.modernFashion = {
  animateAddToCart,
  showToast,
  animateCounter,
  animateProgressBar,
  initCountdown
};


// ============================================
// LOOKBOOK - LOAD FROM ADMIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadLookbookSection();
});

function loadLookbookSection() {
  const lookbookContainer = document.querySelector('.lookbook-container');
  if (!lookbookContainer) return;
  
  // Get lookbooks from localStorage (saved by admin)
  const savedLookbooks = localStorage.getItem('lookbooks');
  if (!savedLookbooks) {
    console.log('📸 Không có dữ liệu Lookbook từ admin - giữ nguyên mặc định');
    return;
  }
  
  try {
    const allLookbooks = JSON.parse(savedLookbooks);
    
    // Filter: only active lookbooks
    const activeLookbooks = allLookbooks
      .filter(l => l.status === 'active')
      .slice(0, 2); // Max 2 lookbooks on homepage
    
    if (activeLookbooks.length === 0) {
      console.log('📸 Không có Lookbook đang hiển thị - giữ nguyên mặc định');
      return;
    }
    
    // Get products for lookbook
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Render lookbooks
    lookbookContainer.innerHTML = activeLookbooks.map((lookbook, index) => {
      const isReverse = index % 2 === 1;
      const lookbookProducts = (lookbook.products || [])
        .map(id => products.find(p => p.id === id))
        .filter(p => p);
      
      const totalPrice = lookbookProducts.reduce((sum, p) => sum + (p.salePrice || p.price || 0), 0);
      
      const productListHTML = lookbookProducts.slice(0, 3).map(p => `
        <li>
          <span>${p.name}</span>
          <a href="chitietsanpham.html?id=${p.id}">Xem sản phẩm →</a>
        </li>
      `).join('');
      
      const imageHTML = `
        <div class="lookbook-image">
          <img src="${lookbook.image || '/images/placeholder.png'}" alt="${lookbook.name}" onerror="this.src='/images/placeholder.png'" />
        </div>
      `;
      
      const contentHTML = `
        <div class="lookbook-content">
          <h3>${lookbook.name}</h3>
          <p>${lookbook.description || ''}</p>
          <ul class="outfit-list">
            ${productListHTML || '<li><span>Chưa có sản phẩm</span></li>'}
          </ul>
          ${lookbookProducts.length > 0 ? `
            <button class="btn-buy-set" onclick="buyLookbookSet(${JSON.stringify(lookbookProducts.map(p => p.id)).replace(/"/g, "'")})">
              Mua toàn bộ set (${formatPriceVND(totalPrice)})
            </button>
          ` : ''}
        </div>
      `;
      
      return `
        <div class="lookbook-item ${isReverse ? 'reverse' : ''}">
          ${isReverse ? contentHTML + imageHTML : imageHTML + contentHTML}
        </div>
      `;
    }).join('');
    
    console.log('📸 Đã load', activeLookbooks.length, 'Lookbook từ admin');
    
  } catch (error) {
    console.error('Lỗi khi load Lookbook:', error);
  }
}

// Buy entire lookbook set
function buyLookbookSet(productIds) {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  productIds.forEach(id => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images?.[0] || product.image || '/images/placeholder.png',
        quantity: 1
      });
    }
  });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show notification
  showAddToCartNotification('Đã thêm cả set vào giỏ hàng!');
}

window.buyLookbookSet = buyLookbookSet;


// ============================================
// LOAD STORE SETTINGS FROM ADMIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadStoreSettings();
});

function loadStoreSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  if (!settings.general) {
    console.log('⚙️ Không có cài đặt từ admin - giữ nguyên mặc định');
    return;
  }
  
  const general = settings.general;
  
  // Update footer email
  const footerEmail = document.getElementById('footer-email');
  if (footerEmail && general.storeEmail) {
    footerEmail.textContent = general.storeEmail;
  }
  
  // Update footer phone
  const footerPhone = document.getElementById('footer-phone');
  if (footerPhone && general.storePhone) {
    footerPhone.textContent = general.storePhone;
  }
  
  // Update store name in title if needed
  if (general.storeName) {
    // Update any element with class 'store-name'
    document.querySelectorAll('.store-name').forEach(el => {
      el.textContent = general.storeName;
    });
  }
  
  console.log('⚙️ Đã load thông tin cửa hàng từ admin');
}
