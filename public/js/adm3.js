document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    

    // Función para mostrar una sección específica
    

    // Manejador del menú toggle para dispositivos móviles


    initializeProductManagement();
});

// Gestión de Productos
// Gestión de Productos


// Modificar la función cargarProductos



// Función para agregar gramaje


// Función para guardar producto



// Función auxiliar para resetear el formulario


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


// Función para eliminar producto


// Función para mostrar mensajes


// ... resto del código existente (toggleDiv, etc.) ...

// Función para editar producto


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


// Nueva función para eliminar gramaje


// Modificar la función guardarProducto

// Agregar la función de logout

// Gestión de Recetas







// Inicializar formulario de recetas

// Modificar la función actualizarContadores

// Modificar el DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    initializeRecipeForm();
    cargarRecetas();
});
// Add this to your existing code







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





