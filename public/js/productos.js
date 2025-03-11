/**
 * ====================================
 * PÁGINA DE PRODUCTOS - CONTROLADOR
 * ====================================
 * 
 * Este archivo maneja la funcionalidad de la página de productos, incluyendo:
 * - Carga dinámica de productos desde la API
 * - Sistema de filtrado y búsqueda
 * - Gestión de cantidades y gramajes
 * - Interacción con el carrito de compras
 */

/**
 * ====================================
 * 1. INICIALIZACIÓN Y VARIABLES GLOBALES
 * ====================================
 */
document.addEventListener('DOMContentLoaded', async () => {
    const productosContainer = document.getElementById('productosContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let categoriaActual = 'todos';
    let productos = [];

    /**
     * ====================================
     * 2. CARGA DE PRODUCTOS
     * ====================================
     */
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos');
            productos = await response.json();
            filtrarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    /**
     * ====================================
     * 3. RENDERIZADO DE PRODUCTOS
     * ====================================
     */
    function mostrarProductos(productos) {
        productosContainer.innerHTML = '';
        productos.forEach((producto, index) => {
            const delay = index * 0.1;
            const primerGramaje = producto.gramajes[0];
            
            const gramajeBotones = producto.gramajes.map((gramaje, idx) => `
                <button class="gramaje-btn ${idx === 0 ? 'active' : ''}" 
                        data-precio="${gramaje.precio}" 
                        data-peso="${gramaje.peso}">
                    ${gramaje.peso}
                </button>
            `).join('');
            const imagenSrc = producto.imagen_url || '/img/productos/default.jpg';

            const card = `
                <div class="producto-card" style="animation-delay: ${delay}s">
                    <div class="producto-imagen">
                        <img src="${imagenSrc}" 
                            alt="${producto.nombre}" 
                            onerror="this.src='/img/productos/default.jpg'"
                            loading="lazy">
                    </div>
                    <h2 class="producto-titulo">${producto.nombre}</h2>
                    <p class="producto-precio">Bs. ${primerGramaje.precio}</p>
                    
                    <div class="gramaje-options">
                        ${gramajeBotones}
                    </div>

                    <div class="quantity-selector">
                        <button class="quantity-btn minus">−</button>
                        <span class="quantity">1</span>
                        <button class="quantity-btn plus">+</button>
                    </div>

                    <button class="add-to-cart">Agregar al Carrito</button>
                </div>
            `;
            productosContainer.innerHTML += card;
        });

        inicializarEventosProductos();
    }

    /**
     * ====================================
     * 4. GESTIÓN DE EVENTOS
     * ====================================
     */
    function inicializarEventosProductos() {
        document.querySelectorAll('.producto-card').forEach(card => {
            const gramajeBtns = card.querySelectorAll('.gramaje-btn');
            const precioElement = card.querySelector('.producto-precio');
            const quantityDisplay = card.querySelector('.quantity');
            const minusBtn = card.querySelector('.minus');
            const plusBtn = card.querySelector('.plus');
            let quantity = 1;

            // Eventos de gramaje
            gramajeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    gramajeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    precioElement.textContent = `Bs. ${btn.dataset.precio}`;
                });
            });

            // Eventos de cantidad
            minusBtn.addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                }
            });

            plusBtn.addEventListener('click', () => {
                if (quantity < 10) {
                    quantity++;
                    quantityDisplay.textContent = quantity;
                }
            });
        });
    }

    /**
     * ====================================
     * 5. SISTEMA DE FILTRADO
     * ====================================
     */
    function filtrarProductos() {
        const busqueda = searchInput.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda);
            return coincideBusqueda;
        });
        mostrarProductos(productosFiltrados);
    }

    // Eventos de búsqueda
    searchInput.addEventListener('input', filtrarProductos);

    // Inicialización
    await cargarProductos();
});