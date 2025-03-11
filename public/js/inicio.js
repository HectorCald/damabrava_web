document.getElementById('contactBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const footer = document.querySelector('.footer');
    footer.scrollIntoView({ behavior: 'smooth' });
});

// Efecto parallax en el fondo
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    cargarProductosPreview();
});

// Animación al hacer hover en los botones
const buttons = document.querySelectorAll('.hero-btn');
buttons.forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    button.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
    });
});

/* ===== Scripts de la sección de productos ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Animación de entrada para las tarjetas de productos
    const productCards = document.querySelectorAll('.producto-card');
    
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

    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});
/* ===== Scripts de la sección de recetas ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Animación de entrada para las tarjetas de recetas
    const recetaCards = document.querySelectorAll('.receta-card');
    
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

    recetaCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
});
/* ===== Scripts de la sección de nosotros ===== */
document.addEventListener('DOMContentLoaded', () => {
    const nosotrosContent = document.querySelector('.nosotros-content');
    const nosotrosImage = document.querySelector('.nosotros-image');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    if (nosotrosContent && nosotrosImage) {
        nosotrosContent.style.transition = 'all 0.8s ease';
        nosotrosImage.style.transition = 'all 0.8s ease';
        
        observer.observe(nosotrosContent);
        observer.observe(nosotrosImage);
    }
});
/* ===== Scripts de la sección de redes sociales ===== */
document.addEventListener('DOMContentLoaded', () => {
    const socialCards = document.querySelectorAll('.social-card');
    
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

    socialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
});
/* ===== Scripts de la sección de consejos de cocina ===== */
document.addEventListener('DOMContentLoaded', () => {
    const tips = [
        "Agrega las hierbas secas al principio de la cocción y las frescas al final para obtener el mejor sabor.",
        "Para realzar el sabor de las especias, tuéstalas ligeramente antes de usarlas.",
        "Guarda tus condimentos en un lugar fresco y oscuro para mantener su frescura.",
        "Usa una pizca de pimentón para dar color y sabor a tus sopas y guisos.",
        "Las hierbas frescas picadas pueden congelarse en cubitos de aceite de oliva.",
        "Mezcla diferentes tipos de pimientas para crear perfiles de sabor únicos.",
        "El orégano combina perfectamente con tomates y platos mediterráneos.",
        "Para un aroma más intenso, tritura las hierbas secas entre tus manos antes de usarlas."
    ];

    const tipText = document.getElementById('tipText');
    const tipCard = document.querySelector('.tip-card');
    let currentTip = 0;

    function changeTip() {
        tipCard.classList.remove('active');
        
        setTimeout(() => {
            tipText.textContent = tips[currentTip];
            currentTip = (currentTip + 1) % tips.length;
            tipCard.classList.add('active');
        }, 500);
    }

    // Cambiar el consejo cada 6 segundos
    setInterval(changeTip, 6000);
});
// Agregar esta función al inicio del archivo
async function cargarProductosPreview() {
    try {
        const response = await fetch('/api/productos/preview');
        const productos = await response.json();
        
        const productosGrid = document.getElementById('productos-preview-grid');
        productosGrid.innerHTML = '';

        productos.forEach(producto => {
            // Tomamos el primer gramaje para mostrar (si existe)
            const primerGramaje = producto.gramajes[0] || { peso: 'N/A', precio: '0' };
            
            const productoHTML = `
                <div class="producto-card">
                    <div class="producto-imagen">
                        <img src="${producto.imagen_url}" alt="${producto.nombre}">
                    </div>
                    <h3>${producto.nombre}</h3>
                    <p>${primerGramaje.peso}</p>
                    <span class="precio">Bs.${primerGramaje.precio}</span>
                </div>
            `;
            productosGrid.innerHTML += productoHTML;
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}
// Agregar esta función al inicio del archivo
async function cargarRecetasPreview() {
    try {
        const response = await fetch('/api/recetas/preview');
        const recetas = await response.json();
        
        const recetasSlider = document.getElementById('recetas-preview-slider');
        recetasSlider.innerHTML = '';

        recetas.forEach(receta => {
            const recetaHTML = `
                <div class="receta-card">
                    <div class="receta-imagen">
                        <img src="${receta.imagen}" alt="${receta.nombre}">
                        <div class="receta-tiempo">
                            <i class="far fa-clock"></i>
                            <span>45 min</span>
                        </div>
                    </div>
                    <div class="receta-contenido">
                        <h3>${receta.nombre}</h3>
                        <p>${receta.descripcion}</p>
                        <div class="receta-footer">
                            <span class="dificultad">Media</span>
                            <a href="${receta.url}" class="ver-receta">Ver Receta</a>
                        </div>
                    </div>
                </div>
            `;
            recetasSlider.innerHTML += recetaHTML;
        });
    } catch (error) {
        console.error('Error al cargar recetas:', error);
    }
}

// Agregar al evento DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', () => {
    cargarRecetasPreview();
    // ... resto del código existente ...
});