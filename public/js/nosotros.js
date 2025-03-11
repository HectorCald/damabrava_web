/**
 * ====================================
 * PÁGINA NOSOTROS - CONTROLADOR
 * ====================================
 * 
 * Este archivo maneja las animaciones y efectos visuales de la página "Nosotros",
 * incluyendo efectos de scroll, parallax y animaciones de hover.
 */

/**
 * ====================================
 * 1. ANIMACIONES DE SCROLL
 * ====================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animaciones
    const elementos = document.querySelectorAll('.content-container, .valor-card, .historia-imagenes');
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(20px)';
        elemento.style.transition = 'all 0.8s ease';
        elemento.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(elemento);
    });
});

/**
 * ====================================
 * 2. EFECTO PARALLAX
 * ====================================
 */
window.addEventListener('scroll', () => {
    const header = document.querySelector('.nosotros-header');
    const scrolled = window.pageYOffset;
    header.style.backgroundPositionY = scrolled * 0.5 + 'px';
});

/**
 * ====================================
 * 3. ANIMACIONES DE VALORES
 * ====================================
 */
document.querySelectorAll('.valor-card').forEach(card => {
    // Efecto de hover en entrada
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
        }
    });

    // Efecto de hover en salida
    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1)';
        }
    });
});