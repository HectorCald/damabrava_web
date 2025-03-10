/* ===== Animaciones de Scroll ===== */
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

/* ===== Efecto Parallax en Header ===== */
window.addEventListener('scroll', () => {
    const header = document.querySelector('.nosotros-header');
    const scrolled = window.pageYOffset;
    header.style.backgroundPositionY = scrolled * 0.5 + 'px';
});

/* ===== Animaciones de Hover en Valores ===== */
document.querySelectorAll('.valor-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const icon = card.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
        }
    });

    card.addEventListener('mouseleave', () => {
        const icon = card.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1)';
        }
    });
});
