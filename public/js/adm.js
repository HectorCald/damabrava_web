document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('logout')) {
                handleLogout();
                return;
            }

            const targetSection = btn.dataset.section;
            
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Modal Management
    const modal = document.getElementById('itemModal');
    const closeModal = document.querySelector('.close-modal');
    const addProductBtn = document.getElementById('addProductBtn');
    const addRecetaBtn = document.getElementById('addRecetaBtn');

    function showModal(type) {
        modal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 
            type === 'producto' ? 'Nuevo Producto' : 'Nueva Receta';
        
        // Show/hide specific fields
        document.getElementById('priceGroup').style.display = 
            type === 'producto' ? 'block' : 'none';
        document.getElementById('videoGroup').style.display = 
            type === 'producto' ? 'none' : 'block';
    }

    addProductBtn.addEventListener('click', () => showModal('producto'));
    addRecetaBtn.addEventListener('click', () => showModal('receta'));
    closeModal.addEventListener('click', () => modal.style.display = 'none');

    // Search Functionality
    function setupSearch(inputId, gridId, items) {
        const searchInput = document.getElementById(inputId);
        const grid = document.getElementById(gridId);

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredItems = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
            renderItems(filteredItems, grid);
        });
    }

    // File Upload for Catalog
    const uploadArea = document.getElementById('uploadArea');
    const catalogFile = document.getElementById('catalogFile');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handleCatalogUpload(file);
        }
    });

    catalogFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleCatalogUpload(file);
        }
    });

    // Password Change
        // Password Change
    const passwordForm = document.getElementById('passwordForm');
    
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (response.ok) {
                showNotification('Contraseña actualizada exitosamente', 'success');
                passwordForm.reset();
            } else {
                showNotification('Error al actualizar la contraseña', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión', 'error');
        }
    });

    // Item Management (Products and Recipes)
    const itemForm = document.getElementById('itemForm');

    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const itemType = document.getElementById('modalTitle').textContent.includes('Producto') ? 'producto' : 'receta';

        formData.append('name', document.getElementById('itemName').value);
        formData.append('description', document.getElementById('itemDescription').value);
        formData.append('image', document.getElementById('itemImage').files[0]);

        if (itemType === 'producto') {
            formData.append('price', document.getElementById('itemPrice').value);
        } else {
            formData.append('videoUrl', document.getElementById('itemVideo').value);
        }

        try {
            const response = await fetch(`/api/${itemType}s`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showNotification(`${itemType} creado exitosamente`, 'success');
                modal.style.display = 'none';
                itemForm.reset();
                loadItems(itemType);
            } else {
                showNotification(`Error al crear ${itemType}`, 'error');
            }
        } catch (error) {
            showNotification('Error de conexión', 'error');
        }
    });

    // Catalog Upload Handler
    async function handleCatalogUpload(file) {
        const formData = new FormData();
        formData.append('catalog', file);

        try {
            const response = await fetch('/api/upload-catalog', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showNotification('Catálogo actualizado exitosamente', 'success');
            } else {
                showNotification('Error al actualizar el catálogo', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión', 'error');
        }
    }

    // Notification System
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Logout Handler
    async function handleLogout() {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                window.location.href = '/';
            } else {
                throw new Error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
        }
    }

    // Initial Load
    function loadItems(type) {
        fetch(`/api/${type}s`)
            .then(response => response.json())
            .then(items => {
                const grid = document.getElementById(`${type}sGrid`);
                renderItems(items, grid, type);
            })
            .catch(() => {
                showNotification(`Error al cargar ${type}s`, 'error');
            });
    }

    // Render Items in Grid
    function renderItems(items, grid, type) {
        grid.innerHTML = items.map(item => `
            <div class="item-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    ${type === 'producto' ? 
                        `<span class="price">$${item.price}</span>` : 
                        `<a href="${item.videoUrl}" target="_blank">Ver Video</a>`
                    }
                </div>
                <div class="item-actions">
                    <button onclick="editItem('${item.id}', '${type}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}', '${type}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Initial Setup
    loadItems('producto');
    loadItems('receta');
});