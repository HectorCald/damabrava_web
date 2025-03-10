/* ===== Datos de Recetas ===== */
const recetas = [
    {
        id: 1,
        nombre: "Pollo a las Hierbas",
        descripcion: "Delicioso pollo marinado con nuestro mix de hierbas especiales",
        categoria: "carnes",
        tiempo: "45 min",
        imagen: "/img/recetas/pollo-hierbas.jpg",
        videoUrl: "https://youtube.com/watch?v=example1"
    },
    {
        id: 2,
        nombre: "Pasta Mediterránea",
        descripcion: "Pasta al dente con nuestra mezcla de especias mediterráneas",
        categoria: "pastas",
        tiempo: "30 min",
        imagen: "/img/recetas/pasta-mediterranea.jpg",
        videoUrl: "https://youtube.com/watch?v=example2"
    },
    {
        id: 3,
        nombre: "Salmón al Pimentón",
        descripcion: "Salmón fresco realzado con nuestro pimentón ahumado",
        categoria: "pescados",
        tiempo: "35 min",
        imagen: "/img/recetas/salmon-pimenton.jpg",
        videoUrl: "https://youtube.com/watch?v=example3"
    }
];

/* ===== Inicialización y Eventos ===== */
document.addEventListener('DOMContentLoaded', () => {
    const recetasContainer = document.getElementById('recetasContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let categoriaActual = 'todas';

    /* ===== Función para Mostrar Recetas ===== */
    function mostrarRecetas(recetas) {
        recetasContainer.innerHTML = '';
        recetas.forEach((receta, index) => {
            const delay = index * 0.1;
            const card = `
                <div class="receta-card" style="animation-delay: ${delay}s">
                    <div class="receta-imagen">
                        <img src="${receta.imagen}" alt="${receta.nombre}">
                        <div class="receta-tiempo">
                            <i class="far fa-clock"></i> ${receta.tiempo}
                        </div>
                    </div>
                    <div class="receta-info">
                        <h3>${receta.nombre}</h3>
                        <p>${receta.descripcion}</p>
                    </div>
                    <div class="receta-footer">
                        <span class="categoria">${receta.categoria}</span>
                        <a href="${receta.videoUrl}" target="_blank" class="ver-video-btn">
                            <i class="fab fa-youtube"></i>
                            Ver Video
                        </a>
                    </div>
                </div>
            `;
            recetasContainer.innerHTML += card;
        });
    }

    /* ===== Función para Filtrar Recetas ===== */
    function filtrarRecetas() {
        const busqueda = searchInput.value.toLowerCase();
        const recetasFiltradas = recetas.filter(receta => {
            const coincideCategoria = categoriaActual === 'todas' || receta.categoria === categoriaActual;
            const coincideBusqueda = receta.nombre.toLowerCase().includes(busqueda) ||
                                   receta.descripcion.toLowerCase().includes(busqueda);
            return coincideCategoria && coincideBusqueda;
        });
        mostrarRecetas(recetasFiltradas);
    }

    /* ===== Event Listeners ===== */
    searchInput.addEventListener('input', filtrarRecetas);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaActual = btn.dataset.category;
            filtrarRecetas();
        });
    });

    // Mostrar todas las recetas al cargar
    mostrarRecetas(recetas);
});