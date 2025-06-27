//looping through the text 
const text = "Hi, I am Oguz";
let i = 0;
function typeWriter() {
  if (i < text.length) {
    document.getElementById("intro-text").innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, 100); // Speed of typing
  }
}

window.onload = typeWriter;

//fade-in effect for sections
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  }, {
    threshold: 0.1
  });

  sections.forEach((section) => {
    section.classList.add("hidden");
    observer.observe(section);
  });
});

// Smooth scrolling for navigation links
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";

  document.querySelectorAll("section").forEach((section) => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});
