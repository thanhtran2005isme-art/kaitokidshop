
  const swiper = new Swiper('.blog-swiper', {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      768: {
        slidesPerView: 2
      },
      480: {
        slidesPerView: 1
      }
    }
  });

