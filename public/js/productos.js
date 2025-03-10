/* ===== Datos de Productos ===== */
const productos = [
    {
        id: 1,
        nombre: "Orégano Premium",
        descripcion: "Orégano mediterráneo de la más alta calidad",
        precio: 5.99,
        categoria: "hierbas",
        imagen: "/img/productos/oregano.jpg"
    },
    {
        id: 2,
        nombre: "Pimentón Ahumado",
        descripcion: "Pimentón español con toque ahumado",
        precio: 6.99,
        categoria: "especias",
        imagen: "/img/productos/pimenton.jpg"
    },
    {
        id: 3,
        nombre: "Mix Italiano",
        descripcion: "Mezcla perfecta para pizzas y pastas",
        precio: 7.99,
        categoria: "mezclas",
        imagen: "/img/productos/mix-italiano.jpg"
    },
    {
        id: 4,
        nombre: "Albahaca Seca",
        descripcion: "Albahaca aromática secada naturalmente",
        precio: 4.99,
        categoria: "hierbas",
        imagen: "/img/productos/albahaca.jpg"
    }
];

/* ===== Inicialización y Eventos ===== */
document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productosContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let categoriaActual = 'todos';

    /* ===== Función para Mostrar Productos ===== */
    function mostrarProductos(productos) {
        productosContainer.innerHTML = '';
        productos.forEach((producto, index) => {
            const delay = index * 0.1;
            const card = `
                <div class="producto-card" style="animation-delay: ${delay}s">
                    <div class="producto-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="producto-info">
                        <span class="producto-categoria">${producto.categoria}</span>
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <span class="producto-precio">$${producto.precio}</span>
                    </div>
                </div>
            `;
            productosContainer.innerHTML += card;
        });
    }

    /* ===== Función para Filtrar Productos ===== */
    function filtrarProductos() {
        const busqueda = searchInput.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => {
            const coincideCategoria = categoriaActual === 'todos' || producto.categoria === categoriaActual;
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda) ||
                                   producto.descripcion.toLowerCase().includes(busqueda);
            return coincideCategoria && coincideBusqueda;
        });
        mostrarProductos(productosFiltrados);
    }

    /* ===== Event Listeners ===== */
    searchInput.addEventListener('input', filtrarProductos);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaActual = btn.dataset.category;
            filtrarProductos();
        });
    });

    // Mostrar todos los productos al cargar
    mostrarProductos(productos);
});