// Admin Layout JavaScript

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar Toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Restore sidebar state
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (sidebarCollapsed && sidebar) {
    sidebar.classList.add('collapsed');
  }

  // Submenu Toggle - FIX: Allow submenu links to work normally
  const navItems = document.querySelectorAll('.nav-item.has-submenu');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        // Check if click is on a submenu link - if so, let it navigate normally
        const clickedLink = e.target.closest('a');
        if (clickedLink && clickedLink.closest('.submenu')) {
          // This is a submenu link, don't prevent default
          return;
        }
        
        // Only prevent default for the parent link itself (icon/text area)
        if (e.target === link || link.contains(e.target)) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  // Close sidebar on mobile when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (sidebar && !sidebar.contains(e.target) && mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // Admin Info
  loadAdminInfo();
  
  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        alert('Đã đăng xuất thành công!');
        window.location.href = '../login.html';
      }
    });
  }
});

// Admin Info
function loadAdminInfo() {
  const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminUser = localStorage.getItem('adminUser') || localStorage.getItem('username');
  
  if (adminLoggedIn && adminUser) {
    const adminNameElements = document.querySelectorAll('#adminName, #topAdminName');
    adminNameElements.forEach(el => {
      if (el) el.textContent = adminUser;
    });
  } else {
    // Not logged in as admin, redirect to login
    alert('Vui lòng đăng nhập với tài khoản admin!');
    window.location.href = '../login.html';
  }
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto highlight active menu based on current page
function setActiveMenu() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const currentParams = window.location.search;
  
  // Remove all active classes first
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('.submenu a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Find and activate current page link
  const allLinks = document.querySelectorAll('.sidebar a');
  let foundMatch = false;
  
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Extract filename and params from href
    const linkPage = href.split('/').pop().split('?')[0];
    const linkParams = href.includes('?') ? href.split('?')[1] : '';
    
    // Check if this link matches current page
    let isMatch = false;
    if (currentParams && linkParams) {
      // If both have params, match exactly
      isMatch = (linkPage === currentPage && linkParams === currentParams.substring(1));
    } else {
      // Otherwise just match the page
      isMatch = (linkPage === currentPage);
    }
    
    if (isMatch && !foundMatch) {
      foundMatch = true;
      
      // Add active class to the link
      link.classList.add('active');
      
      // If it's in a submenu, open the parent and mark it active
      const submenu = link.closest('.submenu');
      if (submenu) {
        const parentItem = submenu.closest('.has-submenu');
        if (parentItem) {
          parentItem.classList.add('open', 'active');
        }
      } else {
        // If it's a top-level link, mark the nav-item as active
        const navItem = link.closest('.nav-item');
        if (navItem) {
          navItem.classList.add('active');
        }
      }
    }
  });
}

// Call setActiveMenu when page loads
document.addEventListener('DOMContentLoaded', setActiveMenu);
