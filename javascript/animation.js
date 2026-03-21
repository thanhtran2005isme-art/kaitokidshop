// Chuyển tự động -------------------------------
var n = 3; // Total number of slides
var i = 1; // Current slide index

// Function to move to the next slide
function next() {
  if (i == n) {
    i = 1; // If it's the last slide, go back to the first
  } else {
    i++;
  }
  document
    .querySelector(".slide-image")
    .setAttribute("src", "slide_" + i + ".jpg");
}

// Function to go to the previous slide
function com_back() {
  if (i == 1) {
    i = n; // If it's the first slide, go to the last
  } else {
    i--;
  }
  document
    .querySelector(".slide-image")
    .setAttribute("src", "slide_" + i + ".jpg");
}

// Function to automatically go to the next slide every 3 seconds
function auto() {
  setInterval(next, 3000); // Advance to the next slide every 3 seconds
}

// Start the auto slideshow when the page loads
auto();
// -----------------------------Cuộn trang
// Lắng nghe sự kiện click trên nút Back to Top
document.getElementById("back-to-top").addEventListener("click", function () {
  // Cuộn trang về đầu
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Cuộn mượt mà
  });
});



const search = document.querySelector('.search')
const btn = document.querySelector('.btn')
const input = document.querySelector('.input')

btn.addEventListener('click', () => {
    search.classList.toggle('active')
    input.focus()
})