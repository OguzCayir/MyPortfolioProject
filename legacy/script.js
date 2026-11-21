const introText = "Hi, I am Oguz";
let charIndex = 0;

function typeWriter() {
  const el = document.getElementById("intro-text");
  if (charIndex < introText.length) {
    el.textContent += introText.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 100);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typeWriter();

  const sections = document.querySelectorAll("section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  }, { threshold: 0.1 });

  sections.forEach((section) => {
    section.classList.add("hidden");
    observer.observe(section);
  });
});

const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";

  document.querySelectorAll("section").forEach((section) => {
    if (window.scrollY >= section.offsetTop - 100) {
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
