/**
 * ====================================
 * PÁGINA DE RECETAS - CONTROLADOR
 * ====================================
 * 
 * Este archivo maneja la funcionalidad de la página de recetas, incluyendo:
 * - Carga dinámica de recetas desde la API
 * - Sistema de búsqueda y filtrado
 * - Visualización de recetas con animaciones
 */

/**
 * ====================================
 * 1. INICIALIZACIÓN Y VARIABLES GLOBALES
 * ====================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const recetasContainer = document.getElementById('recetasContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let recetasData = [];
    let categoriaActual = 'todas';

    /**
     * ====================================
     * 2. CARGA DE RECETAS
     * ====================================
     */
    async function cargarRecetas() {
        try {
            const response = await fetch('/api/recetas');
            recetasData = await response.json();
            mostrarRecetas(recetasData);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        }
    }

    /**
     * ====================================
     * 3. RENDERIZADO DE RECETAS
     * ====================================
     */
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

    /**
     * ====================================
     * 4. SISTEMA DE FILTRADO
     * ====================================
     */
    function filtrarRecetas() {
        const busqueda = searchInput.value.toLowerCase();
        const recetasFiltradas = recetasData.filter(receta => {
            return receta.nombre.toLowerCase().includes(busqueda) ||
                   receta.descripcion.toLowerCase().includes(busqueda);
        });
        mostrarRecetas(recetasFiltradas);
    }

    /**
     * ====================================
     * 5. EVENTOS Y LISTENERS
     * ====================================
     */
    // Búsqueda en tiempo real
    searchInput.addEventListener('input', filtrarRecetas);

    // Filtrado por categorías
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaActual = btn.dataset.category;
            filtrarRecetas();
        });
    });

    // Inicialización
    cargarRecetas();
});