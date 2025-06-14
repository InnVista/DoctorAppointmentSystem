console.log("Home page loaded successfully!");
// Get all the sections and links
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

// Add an event listener for scroll to highlight the active section
window.addEventListener('scroll', highlightLinkOnScroll);

// Add click event listeners for navigation links to scroll smoothly
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();  // Prevent default anchor behavior
    
    // Scroll smoothly to the section corresponding to the clicked link
    const targetSection = document.querySelector(link.getAttribute('href'));
    
    // Calculate the offset to center the section in the viewport
    const sectionTop = targetSection.offsetTop;
    const sectionHeight = targetSection.clientHeight;
    const offset = sectionTop - (window.innerHeight / 2) + (sectionHeight / 2);

    // Smoothly scroll to the adjusted position
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });

    // Highlight the clicked link immediately
    navLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');

    // Wait a bit before checking the active section (this ensures the scroll is complete)
    setTimeout(highlightLinkOnScroll, 300);
  });
});

// Function to add active class to the corresponding link when 3/4th of the section is in the viewport
function highlightLinkOnScroll() {
  let currentSection = "";

  // Loop through all sections and check the scroll position
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    // Get the scroll position and 3/4th of the section height
    const sectionEnd = sectionTop + sectionHeight * 3 / 4;

    // Check if the 3/4th of the section is in the viewport
    if (window.scrollY + window.innerHeight >= sectionEnd) {
      currentSection = section.getAttribute('id');
    }

    // If we are on the last section, make sure it stays active
    if (index === sections.length - 1 && window.scrollY + window.innerHeight >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  // Remove 'active' class from all links
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Add 'active' class to the link that corresponds to the current section
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
