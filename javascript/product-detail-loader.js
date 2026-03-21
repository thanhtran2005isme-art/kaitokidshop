// Script để load chi tiết sản phẩm từ localStorage
// Sử dụng cho trang chitietsanpham.html

function formatCurrency(value) {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
}

function loadProductDetail() {
    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        // Nếu không có ID, giữ nguyên HTML hiện tại
        return;
    }
    
    // Load sản phẩm từ localStorage
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const product = adminProducts.find(p => p.id === productId);
    
    if (!product) {
        // Nếu không tìm thấy, giữ nguyên HTML hiện tại
        return;
    }
    
    // Cập nhật hình ảnh
    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
        mainImage.src = product.image || '/images/ChiTietSanPham/1.webp';
        mainImage.alt = product.name;
    }
    
    // Cập nhật tên sản phẩm
    const productName = document.querySelector('.product-details h1');
    if (productName) {
        productName.textContent = product.name;
    }
    
    // Cập nhật giá
    const salePrice = document.querySelector('.sale-price');
    if (salePrice) {
        salePrice.textContent = formatCurrency(product.price);
    }
    
    const oldPrice = document.querySelector('.old-price');
    if (oldPrice) {
        if (product.oldPrice && product.oldPrice > product.price) {
            oldPrice.textContent = formatCurrency(product.oldPrice);
            oldPrice.style.display = 'inline';
        } else {
            oldPrice.style.display = 'none';
        }
    }
    
    // Cập nhật discount
    const discount = document.querySelector('.discount');
    if (discount && product.oldPrice && product.oldPrice > product.price) {
        const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        discount.textContent = `-${discountPercent}%`;
        discount.style.display = 'inline';
    } else if (discount) {
        discount.style.display = 'none';
    }
    
    // Cập nhật trạng thái
    const status = document.querySelector('.status strong');
    if (status) {
        status.textContent = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';
    }
    
    // Cập nhật mô tả
    const highlight = document.querySelector('.highlight ul');
    if (highlight) {
        let html = '';
        if (product.specs) {
            html += `<li>${product.specs}</li>`;
        }
        if (product.description) {
            html += `<li>${product.description}</li>`;
        }
        if (product.category) {
            html += `<li>Danh mục: ${product.category}</li>`;
        }
        if (html) {
            highlight.innerHTML = html;
        }
    }
    
    // Cập nhật nút thêm vào giỏ hàng
    const addToCartBtn = document.querySelector('.a-them');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-id', product.id);
        addToCartBtn.setAttribute('data-name', product.name);
        addToCartBtn.setAttribute('data-price', product.price);
        addToCartBtn.setAttribute('data-img', product.image || '/images/ChiTietSanPham/1.webp');
    }
    
    // Cập nhật breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb span');
    if (breadcrumb) {
        breadcrumb.textContent = product.name;
    }
}

// Tự động load khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetail();
});
