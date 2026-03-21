document.addEventListener("DOMContentLoaded", function () {
    const addToCartBtns = document.querySelectorAll(".a-them");
  
    addToCartBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
  
        const productCard = btn.closest(".bg_sp");
        const id = Date.now().toString(); // tạo ID ngẫu nhiên
        const imgSrc = productCard.querySelector("img").src;
        const name = productCard.querySelector(".text-sp").innerText;
        const price = productCard.querySelector(".price b").innerText;
  
        const newItem = {
          id: id,
          imgSrc: imgSrc,
          name: name,
          price: price,
          quantity: 1,
        };
  
        // Lấy giỏ hàng hiện tại từ localStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
        // Kiểm tra trùng tên sản phẩm
        const existing = cart.find((item) => item.name === newItem.name);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push(newItem);
        }
  
        // Cập nhật localStorage
        localStorage.setItem("cart", JSON.stringify(cart));
  
        alert("Đã thêm sản phẩm vào giỏ hàng!");
      });
    });
  });
  