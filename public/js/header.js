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
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.querySelector('.login-modal');
    const closeModal = document.querySelector('.close-modal');

    initializeHamburgerMenu(hamburger, navMenu);
    initializeLoginModal(loginBtn, loginModal, closeModal);
    initializeScrollAnimation();
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

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

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

/**
 * ====================================
 * 3. AUTENTICACIÓN DE USUARIOS
 * ====================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const loginModal = document.querySelector('.login-modal');

    initializeLoginForm(loginForm, loginMessage);
});

// Manejo del formulario de login
function initializeLoginForm(loginForm, loginMessage) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                window.location.href = '/adm';
            } else {
                loginMessage.textContent = 'Credenciales inválidas';
                loginMessage.style.color = '#e31837';
            }
        } catch (error) {
            loginMessage.textContent = 'Error de conexión';
            loginMessage.style.color = '#e31837';
        }
    });
}