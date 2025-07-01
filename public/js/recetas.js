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
            const response = await fetch('/obtener-recetas');
            const data = await response.json();
            if (data.success && Array.isArray(data.recetas)) {
                recetasData = data.recetas;
                mostrarRecetas(recetasData);
            } else {
                recetasData = [];
                mostrarRecetas([]);
            }
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
            let tiempoTexto = '';
            const minutos = parseInt(receta.tiempo, 10);
            if (!isNaN(minutos)) {
                if (minutos >= 60) {
                    const horas = Math.floor(minutos / 60);
                    const mins = minutos % 60;
                    tiempoTexto = `${horas} hr${horas > 1 ? 's' : ''}${mins > 0 ? ' ' + mins + ' min' : ''}`;
                } else {
                    tiempoTexto = `${minutos} min`;
                }
            } else {
                tiempoTexto = receta.tiempo || '';
            }
            const delay = index * 0.1;
            const card = `
                <div class="receta-card" style="animation-delay: ${delay}s">
                    <div class="receta-imagen">
                        <img src="${receta.imagen}" alt="${receta.nombre}">
                        <div class="receta-tiempo">
                            <i class="far fa-clock"></i>
                            <span>${tiempoTexto}</span>
                        </div>
                    </div>
                    <div class="receta-contenido">
                        <h3>${receta.nombre}</h3>
                        <p>${receta.descripcion}</p>
                        <div class="receta-footer">
                            <span class="dificultad">Nivel: <strong>${receta.dificultad}</strong></span>
                            <a href="${receta.url}" class="ver-receta" target="_blank" >Ver Receta</a>
                        </div>
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

