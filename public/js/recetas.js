document.addEventListener('DOMContentLoaded', () => {
    const recetasContainer = document.getElementById('recetasContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let recetasData = [];
    let categoriaActual = 'todas';

    // Función para cargar recetas desde la base de datos
    async function cargarRecetas() {
        try {
            const response = await fetch('/api/recetas');
            recetasData = await response.json();
            mostrarRecetas(recetasData);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        }
    }

    function mostrarRecetas(recetas) {
        recetasContainer.innerHTML = '';
        recetas.forEach((receta, index) => {
            const delay = index * 0.1;
            const card = `
                <div class="receta-card" style="animation-delay: ${delay}s">
                    <div class="receta-imagen">
                        <img src="${receta.imagen}" alt="${receta.nombre}">
                        <div class="receta-tiempo">
                            <i class="far fa-clock"></i> 45 min
                        </div>
                    </div>
                    <div class="receta-info">
                        <h3>${receta.nombre}</h3>
                        <p>${receta.descripcion}</p>
                    </div>
                    <div class="receta-footer">
                        <span class="categoria">Receta</span>
                        <a href="${receta.url}" target="_blank" class="ver-video-btn">
                            <i class="fab fa-youtube"></i>
                            Ver Video
                        </a>
                    </div>
                </div>
            `;
            recetasContainer.innerHTML += card;
        });
    }

    function filtrarRecetas() {
        const busqueda = searchInput.value.toLowerCase();
        const recetasFiltradas = recetasData.filter(receta => {
            return receta.nombre.toLowerCase().includes(busqueda) ||
                   receta.descripcion.toLowerCase().includes(busqueda);
        });
        mostrarRecetas(recetasFiltradas);
    }

    // Event Listeners
    searchInput.addEventListener('input', filtrarRecetas);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaActual = btn.dataset.category;
            filtrarRecetas();
        });
    });

    // Cargar recetas al iniciar
    cargarRecetas();
});