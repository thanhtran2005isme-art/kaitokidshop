// Mega Menu - Dynamic loader for all pages
// This ensures consistent menu across all pages

document.addEventListener('DOMContentLoaded', function() {
  initMegaMenu();
});

function initMegaMenu() {
  const menuList = document.getElementById('mainMenuList');
  if (!menuList) return;

  // Replace menu with full mega menu
  menuList.innerHTML = `
    <li class="has-mega-dropdown">
      <a href="sanphamnu.html">NỮ</a>
      <div class="mega-dropdown">
        <div class="mega-dropdown-content">
          <div class="mega-columns">
            <div class="mega-column">
              <h4>ÁO</h4>
              <ul>
                <li><a href="sanphamnu.html?cat=ao-thun">Áo thun</a></li>
                <li><a href="sanphamnu.html?cat=ao-so-mi">Áo sơ mi</a></li>
                <li><a href="sanphamnu.html?cat=ao-kieu">Áo kiểu</a></li>
                <li><a href="sanphamnu.html?cat=ao-len">Áo len</a></li>
                <li><a href="sanphamnu.html?cat=ao-polo">Áo polo</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>QUẦN</h4>
              <ul>
                <li><a href="sanphamnu.html?cat=quan-jeans">Quần jeans</a></li>
                <li><a href="sanphamnu.html?cat=quan-tay">Quần tây</a></li>
                <li><a href="sanphamnu.html?cat=quan-short">Quần short</a></li>
                <li><a href="sanphamnu.html?cat=quan-kaki">Quần kaki</a></li>
                <li><a href="sanphamnu.html?cat=quan-legging">Quần legging</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>VÁY & ĐẦM</h4>
              <ul>
                <li><a href="sanphamnu.html?cat=vay-midi">Váy midi</a></li>
                <li><a href="sanphamnu.html?cat=vay-maxi">Váy maxi</a></li>
                <li><a href="sanphamnu.html?cat=dam-cong-so">Đầm công sở</a></li>
                <li><a href="sanphamnu.html?cat=dam-du-tiec">Đầm dự tiệc</a></li>
                <li><a href="sanphamnu.html?cat=dam-suong">Đầm suông</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>OUTERWEAR</h4>
              <ul>
                <li><a href="sanphamnu.html?cat=ao-khoac-blazer">Áo khoác blazer</a></li>
                <li><a href="sanphamnu.html?cat=ao-khoac-da">Áo khoác dạ</a></li>
                <li><a href="sanphamnu.html?cat=ao-khoac-jean">Áo khoác jean</a></li>
                <li><a href="sanphamnu.html?cat=ao-khoac-bomber">Áo khoác bomber</a></li>
                <li><a href="sanphamnu.html?cat=ao-cardigan">Áo cardigan</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>PHONG CÁCH</h4>
              <ul>
                <li><a href="sanphamnu.html?cat=do-cong-so">Đồ công sở</a></li>
                <li><a href="sanphamnu.html?cat=do-basic">Đồ basic</a></li>
                <li><a href="sanphamnu.html?cat=do-du-tiec">Đồ dự tiệc</a></li>
                <li><a href="sanphamnu.html?cat=do-the-thao">Đồ thể thao</a></li>
                <li><a href="sanphamnu.html?cat=do-mac-nha">Đồ mặc nhà</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
    <li class="has-mega-dropdown">
      <a href="sanphamnam.html">NAM</a>
      <div class="mega-dropdown">
        <div class="mega-dropdown-content">
          <div class="mega-columns">
            <div class="mega-column">
              <h4>ÁO</h4>
              <ul>
                <li><a href="sanphamnam.html?cat=ao-thun">Áo thun</a></li>
                <li><a href="sanphamnam.html?cat=ao-so-mi">Áo sơ mi</a></li>
                <li><a href="sanphamnam.html?cat=ao-polo">Áo polo</a></li>
                <li><a href="sanphamnam.html?cat=ao-len">Áo len</a></li>
                <li><a href="sanphamnam.html?cat=ao-hoodie">Áo hoodie</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>QUẦN</h4>
              <ul>
                <li><a href="sanphamnam.html?cat=quan-jeans">Quần jeans</a></li>
                <li><a href="sanphamnam.html?cat=quan-tay">Quần tây</a></li>
                <li><a href="sanphamnam.html?cat=quan-short">Quần short</a></li>
                <li><a href="sanphamnam.html?cat=quan-kaki">Quần kaki</a></li>
                <li><a href="sanphamnam.html?cat=quan-jogger">Quần jogger</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>OUTERWEAR</h4>
              <ul>
                <li><a href="sanphamnam.html?cat=ao-khoac-blazer">Áo khoác blazer</a></li>
                <li><a href="sanphamnam.html?cat=ao-khoac-da">Áo khoác dạ</a></li>
                <li><a href="sanphamnam.html?cat=ao-khoac-jean">Áo khoác jean</a></li>
                <li><a href="sanphamnam.html?cat=ao-khoac-bomber">Áo khoác bomber</a></li>
                <li><a href="sanphamnam.html?cat=ao-khoac-gio">Áo khoác gió</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>PHỤ KIỆN</h4>
              <ul>
                <li><a href="sanphamnam.html?cat=ca-vat">Cà vạt</a></li>
                <li><a href="sanphamnam.html?cat=that-lung">Thắt lưng</a></li>
                <li><a href="sanphamnam.html?cat=vi">Ví</a></li>
                <li><a href="sanphamnam.html?cat=tui-xach">Túi xách</a></li>
                <li><a href="sanphamnam.html?cat=mu-non">Mũ nón</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>PHONG CÁCH</h4>
              <ul>
                <li><a href="sanphamnam.html?cat=do-cong-so">Đồ công sở</a></li>
                <li><a href="sanphamnam.html?cat=do-basic">Đồ basic</a></li>
                <li><a href="sanphamnam.html?cat=do-the-thao">Đồ thể thao</a></li>
                <li><a href="sanphamnam.html?cat=do-streetwear">Đồ streetwear</a></li>
                <li><a href="sanphamnam.html?cat=do-mac-nha">Đồ mặc nhà</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
    <li class="has-mega-dropdown">
      <a href="sanphamtreem.html">TRẺ EM</a>
      <div class="mega-dropdown">
        <div class="mega-dropdown-content">
          <div class="mega-columns">
            <div class="mega-column">
              <h4>BÉ GÁI</h4>
              <ul>
                <li><a href="sanphamtreem.html?cat=ao-be-gai">Áo bé gái</a></li>
                <li><a href="sanphamtreem.html?cat=quan-be-gai">Quần bé gái</a></li>
                <li><a href="sanphamtreem.html?cat=vay-dam">Váy đầm</a></li>
                <li><a href="sanphamtreem.html?cat=do-bo-be-gai">Đồ bộ</a></li>
                <li><a href="sanphamtreem.html?cat=ao-khoac-be-gai">Áo khoác</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>BÉ TRAI</h4>
              <ul>
                <li><a href="sanphamtreem.html?cat=ao-be-trai">Áo bé trai</a></li>
                <li><a href="sanphamtreem.html?cat=quan-be-trai">Quần bé trai</a></li>
                <li><a href="sanphamtreem.html?cat=do-bo-be-trai">Đồ bộ</a></li>
                <li><a href="sanphamtreem.html?cat=ao-khoac-be-trai">Áo khoác</a></li>
                <li><a href="sanphamtreem.html?cat=do-the-thao">Đồ thể thao</a></li>
              </ul>
            </div>
            <div class="mega-column">
              <h4>THEO ĐỘ TUỔI</h4>
              <ul>
                <li><a href="sanphamtreem.html?cat=0-2-tuoi">0-2 tuổi</a></li>
                <li><a href="sanphamtreem.html?cat=3-5-tuoi">3-5 tuổi</a></li>
                <li><a href="sanphamtreem.html?cat=6-8-tuoi">6-8 tuổi</a></li>
                <li><a href="sanphamtreem.html?cat=9-12-tuoi">9-12 tuổi</a></li>
                <li><a href="sanphamtreem.html?cat=13-16-tuoi">13-16 tuổi</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
    <li><a href="samphammoi.html">NEW IN</a></li>
    <li><a href="samphamsale.html">SALE</a></li>
    <li><a href="bosuutap.html">BỘ SƯU TẬP</a></li>
    <li><a href="lookbook.html">LOOKBOOK</a></li>
  `;

  console.log('✅ Mega menu initialized');
}
