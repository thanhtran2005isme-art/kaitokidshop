// Common admin functions

// Kiểm tra đăng nhập
function checkAdminAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = '../login.html';
    }
}

// Logout function
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userType');
                localStorage.removeItem('username');
                window.location.href = '../login.html';
            }
        });
    }
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupLogout();
});
