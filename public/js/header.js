/**
 * ====================================
 * HEADER AND NAVIGATION CONTROLLER
 * ====================================
 * 
 * Este archivo maneja toda la funcionalidad del header y la navegación, incluyendo:
 * - Menú hamburguesa para dispositivos móviles
 * - Modal de inicio de sesión
 * - Animaciones de scroll del header
 * - Autenticación de usuarios
 */

/**
 * ====================================
 * 1. INICIALIZACIÓN Y NAVEGACIÓN
 * ====================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    initializeHamburgerMenu(hamburger, navMenu);
    initializeScrollAnimation();
});
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-link');
    const path = window.location.pathname.replace(/\/$/, ''); // sin slash final

    links.forEach(link => {
        // Obtén el href relativo (sin dominio)
        const href = link.getAttribute('href').replace(/\/$/, '');
        // Marca como activo si coincide la ruta
        if (href === path || (href === '' && path === '')) {
            link.classList.add('active');
        }
    });
});
/**
 * ====================================
 * 2. FUNCIONES DE NAVEGACIÓN
 * ====================================
 */

// Inicialización del menú hamburguesa
function initializeHamburgerMenu(hamburger, navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Inicialización del modal de login
function initializeLoginModal(loginBtn, loginModal, closeModal) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
}

// Inicialización de la animación de scroll
function initializeScrollAnimation() {
    let lastScroll = 0;
    const header = document.querySelector('.header');
    // Detecta si NO es inicio
    const noEsInicio = !window.location.pathname.endsWith('/') &&
        !window.location.pathname.endsWith('/inicio') &&
        !window.location.pathname.endsWith('/inicio/');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const productosPreview = document.querySelector('.productos-preview');
        const productosRect = productosPreview?.getBoundingClientRect();

        if (noEsInicio) {
            header.style.backgroundColor = '#1a1a1a'; // Siempre oscuro fuera de inicio
        } else if (productosRect && header.getBoundingClientRect().bottom >= productosRect.top) {
            header.style.backgroundColor = '#1a1a1a'; // Oscuro cuando toca productos-preview
        } else {
            header.style.backgroundColor = ''; // Vuelve al color original solo en inicio
        }

        if (currentScroll <= 0) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            return;
        }

        if (currentScroll > lastScroll) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    // Si la URL no es la de inicio, aplica color oscuro al header
    if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('/inicio') && !window.location.pathname.endsWith('/inicio/')) {
        header.style.backgroundColor = '#1a1a1a';
    }
});