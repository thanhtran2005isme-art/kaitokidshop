// Mobile Menu Handler
document.addEventListener('DOMContentLoaded', function() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const menu = document.querySelector('.menu-1');
  
  // Toggle mobile menu
  if (mobileToggle && menu) {
    mobileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.classList.toggle('active');
      
      // Change hamburger icon
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (menu.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && !mobileToggle.contains(e.target)) {
        menu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }
  
  // Handle dropdown on mobile
  const dropdowns = document.querySelectorAll('.menu-1 .dropdown');
  
  dropdowns.forEach(dropdown => {
    const dropdownLink = dropdown.querySelector('> a');
    
    if (dropdownLink) {
      dropdownLink.addEventListener('click', function(e) {
        // Only handle on mobile
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          
          // Close other dropdowns
          dropdowns.forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
              otherDropdown.classList.remove('active');
            }
          });
          
          // Toggle current dropdown
          dropdown.classList.toggle('active');
        }
      });
    }
  });
  
  // Close menu when clicking on link
  const menuLinks = document.querySelectorAll('.menu-1 a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Only close menu if not a dropdown link
      if (!this.closest('.dropdown > a')) {
        setTimeout(() => {
          menu.classList.remove('active');
          const icon = mobileToggle?.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }, 200);
      }
    });
  });
});
