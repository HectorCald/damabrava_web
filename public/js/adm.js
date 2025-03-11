document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.nav-item a');
    const sections = document.querySelectorAll('.content-section');

    // Función para mostrar una sección específica
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // En dispositivos móviles, cerrar el sidebar después de seleccionar una sección
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }

    // Manejador del menú toggle para dispositivos móviles
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Manejador de eventos para los items de navegación
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los items
            navItems.forEach(navItem => {
                navItem.parentElement.classList.remove('active');
            });
            
            // Agregar clase active al item seleccionado
            item.parentElement.classList.add('active');
            
            // Mostrar la sección correspondiente
            const sectionId = item.getAttribute('href');
            showSection(sectionId);
        });
    });

    // Cerrar el sidebar cuando se hace clic fuera de él en dispositivos móviles
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnMenuToggle = menuToggle.contains(e.target);

            if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });

    initializeProductManagement();
});

// Gestión de Productos
// Gestión de Productos
function initializeProductManagement() {
    const productForm = {
        form: document.getElementById("productForm"),
        nombreInput: document.getElementById("nombre"),
        precioInput: document.getElementById("precio"),
        gramajeInput: document.getElementById("gramaje"),
        listaUl: document.getElementById("listaGramajes"),
        addGramajeBtn: document.getElementById("addGramaje"),
        listaGramajes: []
    };

    if (productForm.form && productForm.addGramajeBtn) {
        productForm.addGramajeBtn.addEventListener("click", () => agregarGramaje(productForm));
        productForm.form.addEventListener("submit", (e) => guardarProducto(e, productForm));
    }

    // Cargar productos existentes al iniciar
    cargarProductos();
    actualizarContadores();
}

// Modificar la función cargarProductos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();
        
        const tbody = document.querySelector('.dataProduct table tbody');
        if (!tbody) {
            console.error('No se encontró la tabla de productos');
            return;
        }
        
        tbody.innerHTML = '';

        productos.forEach(producto => {
            try {
                const gramajes = typeof producto.gramajes === 'string' 
                    ? JSON.parse(producto.gramajes) 
                    : producto.gramajes || [];

                gramajes.forEach(gramaje => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${producto.nombre}</td>
                        <td>${gramaje.gramaje}g</td>
                        <td>Bs.${gramaje.precio}</td>
                        <td>
                            <button class="edit" data-id="${producto.id}">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="delete" data-id="${producto.id}">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (parseError) {
                console.error('Error al procesar producto:', parseError);
            }
        });

        initializeProductButtons();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarMensaje('error', 'Error al cargar los productos');
    }
}
async function actualizarContadores() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();
        
        // Actualizar contador de productos
        const totalProductos = productos.length;
        document.querySelector('#totalProductos').textContent = totalProductos;
    } catch (error) {
        console.error('Error al cargar contadores:', error);
    }
}

// Función para agregar gramaje
function agregarGramaje(productForm) {
    const gramaje = productForm.gramajeInput.value.trim();
    const precio = productForm.precioInput.value.trim();

    if (gramaje === "" || precio === "") {
        mostrarMensaje('error', 'Por favor, completa el gramaje y el precio.');
        return;
    }

    agregarGramajeALista({ gramaje, precio });

    productForm.gramajeInput.value = "";
    productForm.precioInput.value = "";
}

// Función para guardar producto
async function guardarProducto(event, productForm) {
    event.preventDefault();

    const nombre = productForm.nombreInput.value.trim();
    const imagenInput = document.getElementById('imagen');
    const id = document.getElementById('productoId').value;
    
    if (!nombre || currentGramajes.length === 0) {
        mostrarMensaje('error', 'Por favor, completa el nombre y agrega al menos un gramaje.');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('gramajes', JSON.stringify(currentGramajes));
        
        if (imagenInput && imagenInput.files[0]) {
            formData.append('imagen', imagenInput.files[0]);
        } else if (!id) { // Solo requerir imagen para nuevos productos
            mostrarMensaje('error', 'Por favor, selecciona una imagen para el producto.');
            return;
        }

        const url = id ? `/api/productos/${id}` : '/api/productos';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensaje('success', `Producto ${id ? 'actualizado' : 'guardado'} correctamente`);
            resetearFormulario(productForm);
            await cargarProductos();
            await actualizarContadores();
        } else {
            throw new Error(data.mensaje || `Error al ${id ? 'actualizar' : 'guardar'} el producto`);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', error.message);
    }
}


// Función auxiliar para resetear el formulario
function resetearFormulario(productForm) {
    productForm.form.reset();
    document.getElementById('productoId').value = '';
    document.getElementById('formTitle').textContent = 'Nuevo producto';
    document.getElementById('submitBtn').textContent = 'Agregar';
    currentGramajes = [];
    document.getElementById('listaGramajes').innerHTML = '';
    toggleDiv('.formProduct');
}

// Función para cargar productos
// Función para cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();
        
        const tbody = document.querySelector('.dataProduct table tbody');
        tbody.innerHTML = '';

        productos.forEach(producto => {
            if (producto.gramajes) {
                producto.gramajes.forEach(gramaje => {
                    if (gramaje) { // Verificar que el gramaje existe
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${producto.nombre}</td>
                            <td>${gramaje.peso || 'N/A'}</td>
                            <td>Bs.${gramaje.precio || '0'}</td>
                            <td>
                                <button class="edit" data-id="${producto.id}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="delete" data-id="${producto.id}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    }
                });
            }
        });

        initializeProductButtons();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarMensaje('error', 'Error al cargar los productos');
    }
}

// Inicializar botones de productos
function initializeProductButtons() {
    document.querySelectorAll('.dataProduct .delete').forEach(button => {
        button.addEventListener('click', eliminarProducto);
    });
    document.querySelectorAll('.dataProduct .edit').forEach(button => {
        button.addEventListener('click', editarProducto);
    });
}

// Función para eliminar producto
async function eliminarProducto(e) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        const id = e.currentTarget.dataset.id;
        try {
            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                mostrarMensaje('success', 'Producto eliminado correctamente');
                // Eliminar todas las filas que corresponden al mismo producto
                const productRows = document.querySelectorAll(`[data-id="${id}"]`);
                productRows.forEach(row => row.closest('tr').remove());
                cargarProductos(); // Recargar la lista completa
                actualizarContadores(); // Actualizar contadores
            } else {
                const error = await response.json();
                mostrarMensaje('error', error.mensaje || 'Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error al eliminar el producto');
        }
    }
}

// Función para mostrar mensajes
function mostrarMensaje(tipo, texto) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-${tipo}`;
    mensajeDiv.textContent = texto;
    
    const contenedor = document.querySelector('.content-wrapper');
    contenedor.insertBefore(mensajeDiv, contenedor.firstChild);
    
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

// ... resto del código existente (toggleDiv, etc.) ...
function toggleDiv(item) {
    let div = document.querySelector(item);
    let container = document.querySelector('.admin-container');

    if (!div) {
        console.error("Elemento no encontrado:", item);
        return;
    }

    let computedStyle = window.getComputedStyle(div);

    if (computedStyle.display === "none") {
        div.style.display = "flex";
        container.classList.add("blur-active"); // Activar blur
    } else {
        div.style.display = "none";
        container.classList.remove("blur-active"); // Desactivar blur
    }
}
// Función para editar producto
async function editarProducto(e) {
    const id = e.currentTarget.dataset.id;
    try {
        const response = await fetch(`/api/productos/${id}`);
        const producto = await response.json();
        
        document.getElementById('formTitle').textContent = 'Editar producto';
        document.getElementById('submitBtn').textContent = 'Actualizar';
        
        const productForm = document.getElementById('productForm');
        productForm.productoId.value = id;
        productForm.nombre.value = producto.nombre;
        
        const listaGramajes = document.getElementById('listaGramajes');
        listaGramajes.innerHTML = '';
        currentGramajes = []; // Resetear gramajes actuales
        
        producto.gramajes.forEach(gramaje => {
            agregarGramajeALista({
                gramaje: gramaje.gramaje || (gramaje.peso ? gramaje.peso.replace('g', '') : ''),
                precio: gramaje.precio
            });
        });
        
        toggleDiv('.formProduct');
        
    } catch (error) {
        console.error('Error al cargar producto:', error);
        mostrarMensaje('error', 'Error al cargar el producto');
    }
}

// Modificar la función agregarGramaje
function agregarGramaje(productForm) {
    const gramaje = productForm.gramajeInput.value.trim();
    const precio = productForm.precioInput.value.trim();

    if (gramaje === "" || precio === "") {
        mostrarMensaje('error', 'Por favor, completa el gramaje y el precio.');
        return;
    }

    agregarGramajeALista({ gramaje, precio });

    productForm.gramajeInput.value = "";
    productForm.precioInput.value = "";
}

// Nueva función para agregar gramaje a la lista
let currentGramajes = [];

// Modificar la función agregarGramajeALista
function agregarGramajeALista(gramaje) {
    const listaUl = document.getElementById("listaGramajes");
    
    // Validar que los valores sean números
    const gramajeNum = parseFloat(gramaje.gramaje);
    const precioNum = parseFloat(gramaje.precio);
    
    if (isNaN(gramajeNum) || isNaN(precioNum)) {
        mostrarMensaje('error', 'El gramaje y precio deben ser números válidos');
        return;
    }
    
    currentGramajes.push({
        gramaje: gramajeNum,
        precio: precioNum
    });
    
    const li = document.createElement("li");
    li.innerHTML = `
        <span>${gramajeNum}g - Bs.${precioNum}</span>
        <button type="button" onclick="eliminarGramaje(this, ${currentGramajes.length - 1})">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    listaUl.appendChild(li);
}

// Nueva función para eliminar gramaje
function eliminarGramaje(button, index) {
    const li = button.parentElement;
    const ul = li.parentElement;
    ul.removeChild(li);
    
    currentGramajes.splice(index, 1);
}

// Modificar la función guardarProducto

// Agregar la función de logout
async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Limpiar datos locales
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir al inicio
            window.location.href = '/';
        } else {
            mostrarMensaje('error', 'Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al cerrar sesión');
    }
}
// Gestión de Recetas
async function cargarRecetas() {
    try {
        const response = await fetch('/api/recetas');
        const recetas = await response.json();
        
        const tbody = document.querySelector('.dataRecipe table tbody');
        tbody.innerHTML = '';

        recetas.forEach(receta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${receta.nombre}</td>
                <td>${receta.descripcion}</td>
                <td><a href="${receta.url}" target="_blank">Ver video</a></td>
                <td>
                    <button class="edit" data-id="${receta.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete" data-id="${receta.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        initializeRecipeButtons();
        actualizarContadores();

    } catch (error) {
        console.error('Error al cargar recetas:', error);
        mostrarMensaje('error', 'Error al cargar las recetas');
    }
}

function initializeRecipeButtons() {
    document.querySelectorAll('.dataRecipe .delete').forEach(button => {
        button.addEventListener('click', eliminarReceta);
    });
    document.querySelectorAll('.dataRecipe .edit').forEach(button => {
        button.addEventListener('click', editarReceta);
    });
}
async function eliminarReceta(e) {
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
        const id = e.currentTarget.dataset.id;
        try {
            const response = await fetch(`/api/recetas/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                mostrarMensaje('success', 'Receta eliminada correctamente');
                cargarRecetas();
            } else {
                mostrarMensaje('error', 'Error al eliminar la receta');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error al eliminar la receta');
        }
    }
}

async function editarReceta(e) {
    const id = e.currentTarget.dataset.id;
    try {
        const response = await fetch(`/api/recetas/${id}`);
        const receta = await response.json();
        
        document.querySelector('.formRecipe h1').textContent = 'Editar receta';
        const form = document.getElementById('recipeForm');
        form.dataset.id = id;
        form.nombre.value = receta.nombre;
        form.descripcion.value = receta.descripcion;
        form.linkVideo.value = receta.url || '';
        
        toggleDiv('.formRecipe');
        
    } catch (error) {
        console.error('Error al cargar receta:', error);
        mostrarMensaje('error', 'Error al cargar la receta');
    }
}

// Inicializar formulario de recetas
function initializeRecipeForm() {
    const form = document.getElementById('recipeForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recetaData = {
            nombre: form.nombre.value.trim(),
            descripcion: form.descripcion.value.trim(),
            url: form.linkVideo.value.trim(),
            imagen: '' // Aquí puedes manejar la subida de imágenes si lo necesitas
        };

        const id = form.dataset.id;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/recetas/${id}` : '/api/recetas';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recetaData)
            });

            if (response.ok) {
                mostrarMensaje('success', `Receta ${id ? 'actualizada' : 'creada'} correctamente`);
                form.reset();
                form.dataset.id = '';
                document.querySelector('.formRecipe h1').textContent = 'Nueva receta';
                toggleDiv('.formRecipe');
                cargarRecetas();
            } else {
                mostrarMensaje('error', `Error al ${id ? 'actualizar' : 'crear'} la receta`);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', `Error al ${id ? 'actualizar' : 'crear'} la receta`);
        }
    });
}
// Modificar la función actualizarContadores
async function actualizarContadores() {
    try {
        const [productosResponse, recetasResponse] = await Promise.all([
            fetch('/api/productos'),
            fetch('/api/recetas')
        ]);
        
        const productos = await productosResponse.json();
        const recetas = await recetasResponse.json();
        
        document.querySelector('#totalProductos').textContent = productos.length;
        document.querySelector('#totalRecetas').textContent = recetas.length;
    } catch (error) {
        console.error('Error al cargar contadores:', error);
    }
}
// Modificar el DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    initializeRecipeForm();
    cargarRecetas();
});
// Add this to your existing code
function initializeRecipeManagement() {
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
        recipeForm.addEventListener('submit', handleRecipeSubmit);
    }
    cargarRecetas();
}

async function handleRecipeSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const recetaId = document.getElementById('recetaId').value;
    
    formData.append('nombre', document.getElementById('nombreReceta').value);
    formData.append('descripcion', document.getElementById('descripcionReceta').value);
    formData.append('url', document.getElementById('urlReceta').value);
    
    const imagenInput = document.getElementById('imagenReceta');
    if (imagenInput.files[0]) {
        formData.append('imagen', imagenInput.files[0]);
    }

    try {
        const url = recetaId ? `/api/recetas/${recetaId}` : '/api/recetas';
        const method = recetaId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al guardar la receta');
        }

        mostrarMensaje('success', `Receta ${recetaId ? 'actualizada' : 'creada'} correctamente`);
        resetearFormularioReceta();
        await cargarRecetas();
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', error.message);
    }
}

function resetearFormularioReceta() {
    const recipeForm = document.getElementById('recipeForm');
    recipeForm.reset();
    document.getElementById('recetaId').value = '';
    document.getElementById('recipeFormTitle').textContent = 'Nueva Receta';
    document.getElementById('submitRecipeBtn').textContent = 'Agregar';
    toggleDiv('.formRecipe');
}


// Función para eliminar receta
async function eliminarReceta(e) {
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
        const id = e.currentTarget.dataset.id;
        try {
            const response = await fetch(`/api/recetas/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                mostrarMensaje('success', 'Receta eliminada correctamente');
                await cargarRecetas();
                actualizarContadores();
            } else {
                const error = await response.json();
                mostrarMensaje('error', error.mensaje || 'Error al eliminar la receta');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error al eliminar la receta');
        }
    }
}

// Función para editar receta
async function editarReceta(e) {
    const id = e.currentTarget.dataset.id;
    try {
        const response = await fetch(`/api/recetas/${id}`);
        const receta = await response.json();

        // Rellenar el formulario con los datos de la receta
        document.getElementById('recetaId').value = receta.id;
        document.getElementById('nombreReceta').value = receta.nombre;
        document.getElementById('descripcionReceta').value = receta.descripcion;
        document.getElementById('urlReceta').value = receta.url;
        
        // Cambiar el título y el texto del botón
        document.getElementById('recipeFormTitle').textContent = 'Editar Receta';
        document.getElementById('submitRecipeBtn').textContent = 'Actualizar';
        
        // Mostrar el formulario
        toggleDiv('.formRecipe');
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al cargar la receta');
    }
}

// Función para inicializar los botones de las recetas
function initializeRecipeButtons() {
    document.querySelectorAll('.dataRecipe .delete').forEach(button => {
        button.addEventListener('click', eliminarReceta);
    });
    document.querySelectorAll('.dataRecipe .edit').forEach(button => {
        button.addEventListener('click', editarReceta);
    });
}



// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    initializeRecipeManagement();
});





