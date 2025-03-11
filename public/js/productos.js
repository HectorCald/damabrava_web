document.addEventListener('DOMContentLoaded', async () => {
    const productosContainer = document.getElementById('productosContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let categoriaActual = 'todos';
    let productos = [];

    // Función para cargar productos desde la API
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos');
            productos = await response.json();
            filtrarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

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

        // Inicializar eventos de los botones de gramaje
        inicializarEventosProductos();
    }

    function inicializarEventosProductos() {
        document.querySelectorAll('.producto-card').forEach(card => {
            const gramajeBtns = card.querySelectorAll('.gramaje-btn');
            const precioElement = card.querySelector('.producto-precio');
            const quantityDisplay = card.querySelector('.quantity');
            const minusBtn = card.querySelector('.minus');
            const plusBtn = card.querySelector('.plus');
            let quantity = 1;

            gramajeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    gramajeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    precioElement.textContent = `Bs. ${btn.dataset.precio}`;
                });
            });

            // Manejadores de cantidad
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

    function filtrarProductos() {
        const busqueda = searchInput.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda);
            return coincideBusqueda;
        });
        mostrarProductos(productosFiltrados);
    }

    searchInput.addEventListener('input', filtrarProductos);

    // Cargar productos al iniciar
    await cargarProductos();
});