// Admin Reviews JavaScript

let reviews = [];
let filteredReviews = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
  setupFilters();
  loadProductFilter();
});

// Load Reviews
function loadReviews() {
  // Load from localStorage
  reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  
  // If no reviews, create sample data
  if (reviews.length === 0) {
    reviews = generateSampleReviews();
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }
  
  filteredReviews = [...reviews];
  updateStatistics();
  displayReviews();
}

// Generate Sample Reviews
function generateSampleReviews() {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
  
  const sampleReviews = [];
  const customers = ['Nguyễn Thị A', 'Trần Văn B', 'Lê Thị C', 'Phạm Văn D', 'Hoàng Thị E'];
  
  // Generate reviews from completed orders
  orders.filter(o => o.status === 'completed').slice(0, 10).forEach((order, index) => {
    order.items?.forEach((item, itemIndex) => {
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
      const statuses = ['approved', 'pending', 'approved'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const review = {
        id: `REV${Date.now()}-${index}-${itemIndex}`,
        orderId: order.id,
        productId: item.id,
        productName: item.name,
        productImage: item.imgSrc || '../images/d53c7593-3c1b-437a-98bc-f71b44050b40.png',
        customerName: order.customerName || customers[Math.floor(Math.random() * customers.length)],
        customerEmail: order.customerEmail || 'customer@example.com',
        rating: rating,
        comment: getSampleComment(rating),
        status: status,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: status === 'approved' ? new Date().toISOString() : null
      };
      
      sampleReviews.push(review);
    });
  });
  
  return sampleReviews;
}

// Get Sample Comment
function getSampleComment(rating) {
  const comments = {
    5: [
      'Sản phẩm rất đẹp, chất lượng tốt, giao hàng nhanh. Sẽ ủng hộ thêm!',
      'Rất hài lòng với sản phẩm. Đúng như mô tả, đóng gói cẩn thận.',
      'Tuyệt vời! Chất lượng vượt mong đợi. Cảm ơn shop!',
      'Sản phẩm đẹp, form chuẩn, mặc rất thoải mái. Đáng mua!'
    ],
    4: [
      'Sản phẩm tốt, giá hợp lý. Giao hàng hơi chậm một chút.',
      'Chất lượng ổn, thiết kế đẹp. Sẽ quay lại mua tiếp.',
      'Nhìn chung hài lòng, nhưng có thể cải thiện thêm về đóng gói.'
    ],
    3: [
      'Sản phẩm ổn, không có gì đặc biệt.',
      'Chất lượng bình thường, giá hợp lý.'
    ],
    2: [
      'Không như mong đợi, chất lượng hơi kém.',
      'Sản phẩm có vấn đề nhỏ về đường may.'
    ],
    1: [
      'Rất thất vọng với sản phẩm.',
      'Chất lượng kém, không đúng mô tả.'
    ]
  };
  
  const ratingComments = comments[rating] || comments[3];
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
}

// Setup Filters
function setupFilters() {
  const ratingFilter = document.getElementById('ratingFilter');
  const statusFilter = document.getElementById('statusFilter');
  const productFilter = document.getElementById('productFilter');
  const searchInput = document.getElementById('searchInput');
  
  if (ratingFilter) {
    ratingFilter.addEventListener('change', filterReviews);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterReviews);
  }
  
  if (productFilter) {
    productFilter.addEventListener('change', filterReviews);
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', filterReviews);
  }
}

// Load Product Filter
function loadProductFilter() {
  const productFilter = document.getElementById('productFilter');
  if (!productFilter) return;
  
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const uniqueProducts = [...new Set(reviews.map(r => r.productName))];
  
  uniqueProducts.forEach(productName => {
    const option = document.createElement('option');
    option.value = productName;
    option.textContent = productName;
    productFilter.appendChild(option);
  });
}

// Filter Reviews
function filterReviews() {
  const ratingFilter = document.getElementById('ratingFilter')?.value || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const productFilter = document.getElementById('productFilter')?.value || '';
  const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
  
  filteredReviews = reviews.filter(review => {
    if (ratingFilter && review.rating !== parseInt(ratingFilter)) return false;
    if (statusFilter && review.status !== statusFilter) return false;
    if (productFilter && review.productName !== productFilter) return false;
    if (searchInput && !review.customerName.toLowerCase().includes(searchInput) && 
        !review.productName.toLowerCase().includes(searchInput) &&
        !review.comment.toLowerCase().includes(searchInput)) return false;
    return true;
  });
  
  currentPage = 1;
  displayReviews();
}

// Reset Filters
function resetFilters() {
  document.getElementById('ratingFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('productFilter').value = '';
  document.getElementById('searchInput').value = '';
  filterReviews();
}

// Display Reviews
function displayReviews() {
  const reviewsList = document.getElementById('reviewsList');
  if (!reviewsList) return;
  
  if (filteredReviews.length === 0) {
    reviewsList.innerHTML = `
      <div class="empty-reviews">
        <i class="fa fa-star"></i>
        <h3>Chưa có đánh giá nào</h3>
        <p>Chưa có đánh giá nào phù hợp với bộ lọc của bạn.</p>
      </div>
    `;
    updatePagination();
    return;
  }
  
  // Pagination
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedReviews = filteredReviews.slice(start, end);
  
  reviewsList.innerHTML = paginatedReviews.map(review => `
    <div class="review-item ${review.status}">
      <div class="review-header">
        <div class="reviewer-avatar">
          ${review.customerName.charAt(0).toUpperCase()}
        </div>
        <div class="reviewer-info">
          <div class="reviewer-name">${review.customerName}</div>
          <div class="reviewer-meta">
            <span><i class="fa fa-calendar"></i> ${formatDate(review.createdAt)}</span>
            <span class="review-status-badge ${review.status}">
              <i class="fa fa-${getStatusIcon(review.status)}"></i>
              ${getStatusText(review.status)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="review-product">
        <img src="${review.productImage}" alt="${review.productName}" 
             onerror="this.src='../images/d53c7593-3c1b-437a-98bc-f71b44050b40.png'">
        <div class="review-product-info">
          <div class="review-product-name">${review.productName}</div>
          <div class="review-product-category">Mã đơn: ${review.orderId}</div>
        </div>
      </div>
      
      <div class="review-rating">
        <div class="stars">
          ${generateStars(review.rating)}
        </div>
        <span class="rating-value">${review.rating}.0</span>
      </div>
      
      <div class="review-text">"${review.comment}"</div>
      
      <div class="review-footer">
        <div class="review-date">
          Đánh giá vào ${formatDate(review.createdAt)}
        </div>
        <div class="review-actions">
          ${review.status !== 'approved' && review.status !== 'rejected' ? `
            <button class="btn-review btn-approve" onclick="approveReview('${review.id}')">
              <i class="fa fa-check"></i> Duyệt
            </button>
            <button class="btn-review btn-reject" onclick="rejectReview('${review.id}')">
              <i class="fa fa-times"></i> Từ chối
            </button>
          ` : ''}
          <button class="btn-review btn-delete-review" onclick="deleteReview('${review.id}')">
            <i class="fa fa-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  updatePagination();
}

// Generate Stars
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fa fa-star"></i>';
    } else {
      stars += '<i class="fa fa-star empty"></i>';
    }
  }
  return stars;
}

// Get Status Icon
function getStatusIcon(status) {
  const icons = {
    'approved': 'check-circle',
    'pending': 'clock',
    'rejected': 'times-circle'
  };
  return icons[status] || 'clock';
}

// Get Status Text
function getStatusText(status) {
  const texts = {
    'approved': 'Đã duyệt',
    'pending': 'Chờ duyệt',
    'rejected': 'Đã từ chối'
  };
  return texts[status] || 'Chờ duyệt';
}

// Update Statistics
function updateStatistics() {
  const total = reviews.length;
  const approved = reviews.filter(r => r.status === 'approved').length;
  const pending = reviews.filter(r => r.status === 'pending').length;
  const average = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  document.getElementById('totalReviews').textContent = total;
  document.getElementById('approvedReviews').textContent = approved;
  document.getElementById('pendingReviews').textContent = pending;
  document.getElementById('averageRating').textContent = average;
}

// Approve Review
function approveReview(reviewId) {
  console.log('Approving review:', reviewId);
  const review = reviews.find(r => String(r.id) === String(reviewId));
  if (!review) {
    console.error('Review not found:', reviewId);
    showNotification('Không tìm thấy đánh giá!', 'error');
    return;
  }
  
  review.status = 'approved';
  review.approvedAt = new Date().toISOString();
  
  localStorage.setItem('reviews', JSON.stringify(reviews));
  filterReviews();
  updateStatistics();
  showNotification('Đã duyệt đánh giá thành công!', 'success');
}

// Reject Review
function rejectReview(reviewId) {
  if (!confirm('Bạn có chắc muốn từ chối đánh giá này?')) return;
  
  const review = reviews.find(r => String(r.id) === String(reviewId));
  if (!review) {
    showNotification('Không tìm thấy đánh giá!', 'error');
    return;
  }
  
  review.status = 'rejected';
  
  localStorage.setItem('reviews', JSON.stringify(reviews));
  filterReviews();
  updateStatistics();
  showNotification('Đã từ chối đánh giá!', 'success');
}

// Delete Review
function deleteReview(reviewId) {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  
  reviews = reviews.filter(r => String(r.id) !== String(reviewId));
  localStorage.setItem('reviews', JSON.stringify(reviews));
  filterReviews();
  updateStatistics();
  showNotification('Đã xóa đánh giá!', 'success');
}

// Update Pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  const showingCount = document.getElementById('showingCount');
  const totalCount = document.getElementById('totalCount');
  
  if (showingCount) {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredReviews.length);
    showingCount.textContent = start === 0 ? 0 : `${start}-${end}`;
  }
  
  if (totalCount) {
    totalCount.textContent = filteredReviews.length;
  }
  
  if (!pagination) return;
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i class="fa fa-chevron-left"></i>
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
  }
  
  // Next button
  paginationHTML += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <i class="fa fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = paginationHTML;
}

// Change Page
function changePage(page) {
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  displayReviews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Export Reviews
function exportReviews() {
  let csv = 'Báo cáo Đánh giá - KAITO KID\n';
  csv += `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
  
  csv += 'STT,Tên khách hàng,Sản phẩm,Đánh giá,Nội dung,Trạng thái,Ngày đánh giá\n';
  filteredReviews.forEach((review, index) => {
    csv += `${index + 1},"${review.customerName}","${review.productName}",${review.rating} sao,"${review.comment}",${getStatusText(review.status)},${formatDate(review.createdAt)}\n`;
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `danh-gia-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Đã xuất báo cáo thành công!', 'success');
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}



// Show Notification
function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modal
function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('reviewModal');
  if (e.target === modal) {
    closeReviewModal();
  }
});
