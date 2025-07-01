console.log("Home page loaded successfully!");

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');


window.addEventListener('scroll', highlightLinkOnScroll);


navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();  
    
    const targetSection = document.querySelector(link.getAttribute('href'));
    
    const sectionTop = targetSection.offsetTop;
    const sectionHeight = targetSection.clientHeight;
    const offset = sectionTop - (window.innerHeight / 2) + (sectionHeight / 2);

    
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });

    
    navLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');

    
    setTimeout(highlightLinkOnScroll, 300);
  });
});


function highlightLinkOnScroll() {
  let currentSection = "";

  
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    
    const sectionEnd = sectionTop + sectionHeight * 3 / 4;

    
    if (window.scrollY + window.innerHeight >= sectionEnd) {
      currentSection = section.getAttribute('id');
    }

    
    if (index === sections.length - 1 && window.scrollY + window.innerHeight >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  
  const activeLink = document.querySelector(`#link-${currentSection}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Ensure Home link is active on page load
document.addEventListener("DOMContentLoaded", function () {
  const homeLink = document.querySelector("#link-home");
  homeLink.classList.add('active');
});
