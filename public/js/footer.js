/**
 * ====================================
 * FOOTER ANIMATION CONTROLLER
 * ====================================
 * 
 * This script handles the animation of the footer section when it becomes visible 
 * in the viewport. It uses the Intersection Observer API to detect when the footer
 * enters the visible area and triggers a fade-in animation.
 * 
 * The animation helps create a smooth transition effect as users scroll to the
 * bottom of the page, enhancing the overall user experience.
 */

// Animación de entrada al hacer scroll
const footer = document.querySelector('.footer');
        
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

observer.observe(footer);