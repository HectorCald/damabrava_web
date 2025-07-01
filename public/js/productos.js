const DB_NAME = 'damabrava_web';
const PRODUCTOS_STORE = 'productos_cache-web';
const IMAGENES_STORE = 'imagenes_cache-web';

function initDB() {
    return new Promise((resolve, reject) => {
        const checkRequest = indexedDB.open(DB_NAME);
        checkRequest.onerror = () => reject(checkRequest.error);
        checkRequest.onsuccess = () => {
            const db = checkRequest.result;
            // Si el store no existe, actualiza la versión y créalo
            if (!db.objectStoreNames.contains(PRODUCTOS_STORE)) {
                db.close();
                const newVersion = db.version + 1;
                const upgradeRequest = indexedDB.open(DB_NAME, newVersion);
                upgradeRequest.onupgradeneeded = (event) => {
                    const upgradeDb = event.target.result;
                    if (!upgradeDb.objectStoreNames.contains(PRODUCTOS_STORE)) {
                        upgradeDb.createObjectStore(PRODUCTOS_STORE, { keyPath: 'id' });
                    }
                };
                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = () => reject(upgradeRequest.error);
            } else {
                resolve(db);
            }
        };
    });
}

async function obtenerProductosLocal() {
    const db = await initDB();
    const tx = db.transaction(PRODUCTOS_STORE, 'readonly');
    const store = tx.objectStore(PRODUCTOS_STORE);
    return new Promise((resolve) => {
        const productos = [];
        store.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                productos.push(cursor.value.data);
                cursor.continue();
            } else {
                resolve(productos);
            }
        };
    });
}

async function obtenerImagenLocal(id) {
    const db = await initDB();
    if (!db.objectStoreNames.contains(IMAGENES_STORE)) return null;
    const tx = db.transaction(IMAGENES_STORE, 'readonly');
    const store = tx.objectStore(IMAGENES_STORE);
    return new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}

function necesitaActualizacion(imagenCache, url) {
    if (!imagenCache) return true;
    const unDia = 24 * 60 * 60 * 1000;
    return (Date.now() - imagenCache.timestamp) > unDia;
}

document.addEventListener('DOMContentLoaded', async () => {
    const productosGrid = document.getElementById('productosContainer');
    const searchInput = document.getElementById('searchInput');
    const customSelect = document.getElementById('customSelectEtiquetas');
    const customSelectSelected = customSelect.querySelector('.custom-select-selected');
    const customSelectOptions = customSelect.querySelector('.custom-select-options');

    let productos = [];
    let etiquetasUnicas = [];
    let etiquetaSeleccionada = 'Todo';
    let productosMostrados = [];
    let productosRenderizados = 0;
    const CANTIDAD_POR_BLOQUE = 30;
    let modoFiltrado = false;
    function normalizarTexto(texto) {
        return texto
            .toLowerCase() // convierte todo a minúsculas
            .normalize("NFD") // separa acentos del carácter base
            .replace(/[\u0300-\u036f]/g, "") // elimina los signos diacríticos (acentos)
            .replace(/[\s\-_]+/g, ""); // elimina espacios, guiones y guiones bajos
    }

    const sugerenciasDiv = document.getElementById('sugerenciasProductos');

    searchInput.addEventListener('input', function () {
        filtrarProductos();
        mostrarSugerencias();
        // Mostrar la X solo si hay texto
        if (searchInput.value.length > 0) {
            clearSearch.style.display = 'block';
        } else {
            clearSearch.style.display = 'none';
        }
    });
    clearSearch.addEventListener('click', function () {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        filtrarProductos();
        mostrarSugerencias();
        searchInput.focus();
    });
    function mostrarSugerencias() {
        const valor = normalizarTexto(searchInput.value);
        if (!valor) {
            sugerenciasDiv.innerHTML = '';
            sugerenciasDiv.style.display = 'none';
            return;
        }
        // Busca productos cuyo nombre coincida con el input normalizado
        // Solo muestra un nombre único aunque haya varios productos con el mismo nombre
        const nombresUnicos = new Set();
        const sugerencias = productos
            .filter(prod => {
                const nombre = normalizarTexto(prod.producto || prod.nombre || '');
                if (nombre.includes(valor) && !nombresUnicos.has(prod.producto || prod.nombre)) {
                    nombresUnicos.add(prod.producto || prod.nombre);
                    return true;
                }
                return false;
            })
            .slice(0, 8); // máximo 8 sugerencias

        if (sugerencias.length === 0) {
            sugerenciasDiv.innerHTML = '';
            sugerenciasDiv.style.display = 'none';
            return;
        }

        sugerenciasDiv.innerHTML = sugerencias.map(prod =>
            `<div class="sugerencia-item">${prod.producto || prod.nombre}</div>`
        ).join('');
        sugerenciasDiv.style.display = 'block';

        // Al hacer click en una sugerencia, rellena el input y filtra
        sugerenciasDiv.querySelectorAll('.sugerencia-item').forEach((item, idx) => {
            item.addEventListener('click', () => {
                searchInput.value = sugerencias[idx].producto || sugerencias[idx].nombre;
                sugerenciasDiv.innerHTML = '';
                sugerenciasDiv.style.display = 'none';
                filtrarProductos();
            });
        });
    }

    // Opcional: Ocultar sugerencias al perder foco
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            sugerenciasDiv.innerHTML = '';
            sugerenciasDiv.style.display = 'none';
        }, 200);
    });

    // Carga progresiva/infinita
    function renderizarBloqueProductos() {
        if (modoFiltrado) return; // No usar en modo filtrado
        const siguienteBloque = productos.slice(productosRenderizados, productosRenderizados + CANTIDAD_POR_BLOQUE);
        productosRenderizados += siguienteBloque.length;
        siguienteBloque.forEach((producto, index) => {
            // Reutiliza la lógica de renderProductos para una sola card
            // (esto es un extracto, puedes factorizar si quieres)
            let imagenMostrar = `<i class='bx bx-package'></i>`;
            if (producto.imagen && producto.imagen.includes('https://res.cloudinary.com')) {
                // No usar await aquí, solo carga directa
                imagenMostrar = `<img class="imagen" src="${producto.imagen}" alt="${producto.producto}" style="filter: saturate(150%);">`;
            }
            const precioB2C = (() => {
                const preciosArray = producto.precios.split(';');
                const precioB2C = preciosArray.find(p => p.trim().startsWith('B2C,'));
                if (!precioB2C) return '';
                const valor = precioB2C.split(',')[1] || '';
                return valor ? Number(valor).toFixed(2) : '';
            })();
            let precioPromo = '';
            if (producto.precio_promo && producto.precio_promo.trim() !== '') {
                precioPromo = Number(producto.precio_promo).toFixed(2);
            }
            let precioHTML = '';
            if (precioPromo) {
                precioHTML = `
                    <span class="precio promo">Bs.${precioPromo}</span>
                    <span class="precio original"><s>Bs.${precioB2C}</s></span>
                `;
            } else {
                precioHTML = `<span class="precio">Bs.${precioB2C}</span>`;
            }
            let cantidadBtnsHTML = '';
            if (producto.cantidadxgrupo !== '1') {
                cantidadBtnsHTML = `
                    <div class="cantidad-btns" data-id="${producto.id}" data-precio="${precioPromo || precioB2C}" data-cantidad="${producto.cantidadxgrupo}">
                        <button class="btn-cantidad active" data-tipo="unidad">Unidad</button>
                        <button class="btn-cantidad" data-tipo="tira">Tira</button>
                    </div>
                    <div class="cantidad-label">${producto.cantidadxgrupo} unidades por tira</div>
                `;
            } else {
                cantidadBtnsHTML = `<div class="cantidad-label">1 unidad</div>`;
            }
            productosGrid.innerHTML += `
                <div class="producto-card" data-nombre="${(producto.nombre || producto.producto || '').toLowerCase()}" data-etiquetas="${producto.etiquetas || ''}">
                    ${producto.promociones && producto.promociones.trim() !== '' ? `
                        <div class="cinta-descuento">${producto.promociones}</div>
                    ` : ''}
                    <div class="producto-imagen">
                        ${imagenMostrar}
                    </div>
                    <h3>${producto.producto} ${producto.gramos}gr.</h3>
                    ${cantidadBtnsHTML}
                    ${precioHTML}
                    <div class="cantidad">
                        <button class="btn-cantidad-carrito btn-cantidad-minus">-</button>
                        <input type="number" class="cantidad-value" value="1" min="1" max="99">
                        <button class="btn-cantidad-carrito btn-cantidad-plus">+</button>
                    </div>
                    <a class="ver-producto">Agregar al Carrito</a>
                </div>
            `;
        });
    }

    function limpiarProductosGrid() {
        productosGrid.innerHTML = '';
        productosRenderizados = 0;
    }

    async function renderProductos(productosArr) {
        limpiarProductosGrid();
        productosArr = productosArr.slice().sort((a, b) => {
            const nombreA = (a.nombre || a.producto || '').toLowerCase();
            const nombreB = (b.nombre || b.producto || '').toLowerCase();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });
        productos = productosArr;
        productosMostrados = productosArr;
        productosRenderizados = 0;
        modoFiltrado = false;
        renderizarBloqueProductos();
        // Espera a que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 0));
        customSelect.classList.remove('oculto');
    }

    // Scroll infinito
    window.addEventListener('scroll', function () {
        if (modoFiltrado) return;
        if (productosRenderizados >= productos.length) return;
        // Si el usuario está cerca del final de la página
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
            renderizarBloqueProductos();
        }
    });

    // Filtrado: muestra todos los productos que coincidan
    function filtrarProductos() {
        const cards = Array.from(document.querySelectorAll('.producto-card'));
        const mensajeNoHay = document.querySelector('.no-hay');
        const busqueda = normalizarTexto(searchInput.value.toLowerCase());
        let productosFiltrados = productosMostrados.filter(prod => {
            const nombre = normalizarTexto(prod.nombre || prod.producto || '');
            const etiquetas = (prod.etiquetas || '').split(/[,;]/).map(e => e.trim().toLowerCase());
            const tienePromocion = prod.promociones && prod.promociones.trim() !== '';
            const coincideBusqueda = nombre.includes(busqueda);
            let coincideEtiqueta = true;
            if (etiquetaSeleccionada && etiquetaSeleccionada !== 'Todo') {
                if (etiquetaSeleccionada === 'Promoción') {
                    coincideEtiqueta = tienePromocion;
                } else {
                    coincideEtiqueta = etiquetas.includes(etiquetaSeleccionada.toLowerCase());
                }
            }
            return coincideBusqueda && coincideEtiqueta;
        });
        // Si hay filtro o búsqueda, renderiza todos los que coincidan
        if (busqueda.length > 0 || (etiquetaSeleccionada && etiquetaSeleccionada !== 'Todo')) {
            modoFiltrado = true;
            limpiarProductosGrid();
            productosFiltrados.forEach((producto, index) => {
                // Reutiliza la lógica de renderizarBloqueProductos para una sola card
                let imagenMostrar = `<i class='bx bx-package'></i>`;
                if (producto.imagen && producto.imagen.includes('https://res.cloudinary.com')) {
                    imagenMostrar = `<img class="imagen" src="${producto.imagen}" alt="${producto.producto}" style="filter: saturate(150%);">`;
                }
                const precioB2C = (() => {
                    const preciosArray = producto.precios.split(';');
                    const precioB2C = preciosArray.find(p => p.trim().startsWith('B2C,'));
                    if (!precioB2C) return '';
                    const valor = precioB2C.split(',')[1] || '';
                    return valor ? Number(valor).toFixed(2) : '';
                })();
                let precioPromo = '';
                if (producto.precio_promo && producto.precio_promo.trim() !== '') {
                    precioPromo = Number(producto.precio_promo).toFixed(2);
                }
                let precioHTML = '';
                if (precioPromo) {
                    precioHTML = `
                        <span class="precio promo">Bs.${precioPromo}</span>
                        <span class="precio original"><s>Bs.${precioB2C}</s></span>
                    `;
                } else {
                    precioHTML = `<span class="precio">Bs.${precioB2C}</span>`;
                }
                let cantidadBtnsHTML = '';
                if (producto.cantidadxgrupo !== '1') {
                    cantidadBtnsHTML = `
                        <div class="cantidad-btns" data-id="${producto.id}" data-precio="${precioPromo || precioB2C}" data-cantidad="${producto.cantidadxgrupo}">
                            <button class="btn-cantidad active" data-tipo="unidad">Unidad</button>
                            <button class="btn-cantidad" data-tipo="tira">Tira</button>
                        </div>
                        <div class="cantidad-label">${producto.cantidadxgrupo} unidades por tira</div>
                    `;
                } else {
                    cantidadBtnsHTML = `<div class="cantidad-label">1 unidad</div>`;
                }
                productosGrid.innerHTML += `
                    <div class="producto-card" data-nombre="${(producto.nombre || producto.producto || '').toLowerCase()}" data-etiquetas="${producto.etiquetas || ''}">
                        ${producto.promociones && producto.promociones.trim() !== '' ? `
                            <div class="cinta-descuento">${producto.promociones}</div>
                        ` : ''}
                        <div class="producto-imagen">
                            ${imagenMostrar}
                        </div>
                        <h3>${producto.producto} ${producto.gramos}gr.</h3>
                        ${cantidadBtnsHTML}
                        ${precioHTML}
                        <div class="cantidad">
                            <button class="btn-cantidad-carrito btn-cantidad-minus">-</button>
                            <input type="number" class="cantidad-value" value="1" min="1" max="99">
                            <button class="btn-cantidad-carrito btn-cantidad-plus">+</button>
                        </div>
                        <a class="ver-producto">Agregar al Carrito</a>
                    </div>
                `;
            });
            if (productosFiltrados.length === 0) {
                if (mensajeNoHay) mensajeNoHay.style.display = 'flex';
            } else {
                if (mensajeNoHay) mensajeNoHay.style.display = 'none';
            }
        } else {
            modoFiltrado = false;
            limpiarProductosGrid();
            productosRenderizados = 0;
            renderizarBloqueProductos();
            if (mensajeNoHay) mensajeNoHay.style.display = 'none';
        }
    }

    async function guardarProductosLocal(productos) {
        const db = await initDB();
        const tx = db.transaction(PRODUCTOS_STORE, 'readwrite');
        const store = tx.objectStore(PRODUCTOS_STORE);
        await store.clear();
        for (const producto of productos) {
            await store.put({
                id: producto.id,
                data: producto,
                timestamp: Date.now()
            });
        }
    }

    async function cargarProductosPreview() {
        // 1. Obtener productos desde cache
        let productosCache = await obtenerProductosLocal();
        productosCache = productosCache.slice().sort((a, b) => {
            const nombreA = (a.nombre || a.producto || '').toLowerCase();
            const nombreB = (b.nombre || b.producto || '').toLowerCase();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });
        let productosMostrados = productosCache;

        // 2. Pedir productos al servidor y actualizar cache si hay cambios
        try {
            const response = await fetch('/obtener-productos');
            const data = await response.json();
            let productosWeb = data.productos.filter(producto => {
                const etiquetasArray = producto.etiquetas.split(';').map(e => e.trim());
                return etiquetasArray.includes('Web');
            });
            productosWeb = productosWeb.slice().sort((a, b) => {
                const nombreA = (a.nombre || a.producto || '').toLowerCase();
                const nombreB = (b.nombre || b.producto || '').toLowerCase();
                return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
            });
            // Si hay cambios, renderiza y actualiza cache
            if (JSON.stringify(productosCache) !== JSON.stringify(productosWeb)) {
                console.log('Hay cambios en los productos, renderizando y actualizando cache');
                await renderProductos(productosWeb);
                await guardarProductosLocal(productosWeb);
                productosMostrados = productosWeb;
            } else {
                await renderProductos(productosCache);
                productosMostrados = productosCache;
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            await renderProductos(productosCache);
            productosMostrados = productosCache;
        }
        filtrarProductos(); // Solo una vez, después de renderizar los definitivos
        return productosMostrados;
    }
    async function cargarProductos() {
        try {
            const productosMostrados = await cargarProductosPreview();
            productos = productosMostrados || [];
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    function renderEtiquetas() {
        customSelectOptions.innerHTML = '';
        etiquetasUnicas.forEach(etiqueta => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-select-option' + (etiqueta === etiquetaSeleccionada ? ' active' : '');
            optionDiv.textContent = etiqueta;
            optionDiv.dataset.value = etiqueta;
            optionDiv.addEventListener('click', function () {
                etiquetaSeleccionada = this.dataset.value;
                customSelectSelected.textContent = etiquetaSeleccionada;
                customSelectOptions.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                customSelect.classList.remove('open');
                filtrarProductos();
            });
            customSelectOptions.appendChild(optionDiv);
        });
        customSelectSelected.textContent = etiquetaSeleccionada;
    }

    // Solo abrir/cerrar el select
    customSelectSelected.addEventListener('click', function () {
        customSelect.classList.toggle('open');
    });
    // Cerrar si se hace click fuera
    document.addEventListener('click', function (e) {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });



    // --- NUEVO: Cargar etiquetas desde la API antes de cargar productos ---
    async function cargarEtiquetas() {
        try {
            const response = await fetch('/obtener-etiquetas');
            const data = await response.json();
            if (data.success && Array.isArray(data.etiquetas)) {
                etiquetasUnicas = ['Todo', ...data.etiquetas.map(e => e.etiqueta.charAt(0).toUpperCase() + e.etiqueta.slice(1)), 'Promoción'];
                etiquetaSeleccionada = 'Todo';
            } else {
                etiquetasUnicas = ['Todo', 'Promoción'];
                etiquetaSeleccionada = 'Todo';
            }
        } catch (error) {
            etiquetasUnicas = ['Todo', 'Promoción'];
            etiquetaSeleccionada = 'Todo';
            console.error('Error al cargar etiquetas:', error);
        }
    }

    searchInput.addEventListener('input', filtrarProductos);
    function guardarCarritoLocal() {
        localStorage.setItem('carrito-damabrava-web', JSON.stringify(carrito));
    }

    function cargarCarritoLocal() {
        const data = localStorage.getItem('carrito-damabrava-web');
        return data ? JSON.parse(data) : [];
    }
    let carrito = cargarCarritoLocal();
    actualizarContadorCarrito();

    // Actualiza el contador del carrito
    function actualizarContadorCarrito() {
        const contador = document.getElementById('carritoContador');
        contador.textContent = carrito.length;
        contador.style.display = carrito.length > 0 ? 'inline-block' : 'none';
    }

    function mostrarCarrito() {
        const modal = document.getElementById('carritoModal');
        const itemsDiv = document.getElementById('carritoItems');
        const totalDiv = document.getElementById('carritoTotal');
        itemsDiv.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            itemsDiv.innerHTML = `
                <div class="carrito-vacio">
                    <i class="fas fa-shopping-cart"></i>
                    <p>El carrito está vacío.<br>Agrega algún producto.</p>
                </div>
            `;
            totalDiv.textContent = '';
            modal.style.display = 'flex';
            return;
        }

        carrito.forEach((item, idx) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            itemsDiv.innerHTML += `
                <div class="carrito-item" data-idx="${idx}">
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="carrito-item-info">
                        <div class="carrito-item-nombre">${item.nombre}</div>
                        <div class="carrito-item-tipo">
                            ${item.tipo === 'tira' ? `${item.cantidad} tira(s)` : `${item.cantidad} unidad(es)`}
                        </div>
                    </div>
                    <div class="carrito-item-subtotal">Bs.${subtotal.toFixed(2)}</div>
                    <button class="eliminar-item-carrito" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
        totalDiv.textContent = `Total: Bs.${total.toFixed(2)}`;
        modal.style.display = 'flex';

        // Listener para eliminar
        itemsDiv.querySelectorAll('.eliminar-item-carrito').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.closest('.carrito-item').getAttribute('data-idx'), 10);
                carrito.splice(idx, 1);
                actualizarContadorCarrito();
                guardarCarritoLocal();
                mostrarCarrito();
            };
        });
    }
    // Cierra el modal del carrito
    document.getElementById('carritoIcono').onclick = function () {
        mostrarCarrito();
        document.body.style.overflow = 'hidden';
    };

    // Cierra el modal del carrito
    document.getElementById('cerrarCarrito').onclick = function () {
        document.getElementById('carritoModal').style.display = 'none';
        document.body.style.overflow = '';
    };
    document.getElementById('carritoModal').onclick = function (e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Botón de WhatsApp
    document.getElementById('hacerPedido').onclick = () => {
        if (carrito.length === 0) return;
        let mensaje = '¡Hola! Quiero hacer el pedido de:\n';
        carrito.forEach(item => {
            mensaje += `- ${item.nombre} (${item.tipo === 'tira' ? 'Tira' : 'Unidad'}): ${item.cantidad} x Bs.${item.precio.toFixed(2)} = Bs.${(item.precio * item.cantidad).toFixed(2)}\n`;
        });
        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        mensaje += `Total: Bs.${total.toFixed(2)}`;
        const numero = '59170325449'; // <-- Cambia por tu número de WhatsApp
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    // Delegación de eventos para todos los botones de productos
    productosGrid.addEventListener('click', function (e) {
        // Botones de Unidad/Tira
        if (e.target.classList.contains('btn-cantidad')) {
            const btn = e.target;
            const btnGroup = btn.closest('.cantidad-btns');
            if (!btnGroup) return;
            btnGroup.querySelectorAll('.btn-cantidad').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tipo = btn.getAttribute('data-tipo');
            const precioBase = parseFloat(btnGroup.getAttribute('data-precio'));
            const cantidad = parseInt(btnGroup.getAttribute('data-cantidad'), 10);
            let nuevoPrecio = precioBase;
            if (tipo === 'tira') {
                nuevoPrecio = precioBase * cantidad;
            }
            // Actualiza el precio en la card
            const card = btnGroup.closest('.producto-card');
            const precioPromoEl = card.querySelector('.precio.promo');
            const precioNormalEl = card.querySelector('.precio:not(.promo):not(.original)');
            if (precioPromoEl) {
                precioPromoEl.textContent = `Bs.${nuevoPrecio.toFixed(2)}`;
            }
            if (precioNormalEl) {
                precioNormalEl.textContent = `Bs.${nuevoPrecio.toFixed(2)}`;
            }
        }

        // Botones de cantidad (+/-)
        if (e.target.classList.contains('btn-cantidad-plus') || e.target.classList.contains('btn-cantidad-minus')) {
            const cantidadInput = e.target.parentElement.querySelector('.cantidad-value');
            let cantidad = parseInt(cantidadInput.value, 10);
            if (e.target.classList.contains('btn-cantidad-plus')) {
                cantidad++;
            } else if (e.target.classList.contains('btn-cantidad-minus') && cantidad > 1) {
                cantidad--;
            }
            cantidadInput.value = cantidad;
        }

        // Validación del input de cantidad manual
        if (e.target.classList.contains('cantidad-value')) {
            const input = e.target;
            input.addEventListener('input', function() {
                let valor = parseInt(this.value, 10);
                if (isNaN(valor) || valor < 1) {
                    this.value = 1;
                } else if (valor > 99) {
                    this.value = 99;
                }
            });
        }

        // Botón de Agregar al Carrito
        if (e.target.classList.contains('ver-producto')) {
            e.preventDefault();
            const card = e.target.closest('.producto-card');
            const nombre = card.querySelector('h3').textContent.trim();
            const imagen = card.querySelector('.producto-imagen img')?.src || '';
            const cantidad = parseInt(card.querySelector('.cantidad-value').value, 10);
            // Detectar si está activa tira o unidad
            let tipo = 'unidad';
            let precio = 0;
            const btns = card.querySelectorAll('.btn-cantidad');
            btns.forEach(btn => {
                if (btn.classList.contains('active')) {
                    tipo = btn.getAttribute('data-tipo');
                }
            });
            if (tipo === 'tira') {
                // El precio mostrado ya es por tira
                const precioPromoEl = card.querySelector('.precio.promo');
                const precioNormalEl = card.querySelector('.precio:not(.promo):not(.original)');
                precio = precioPromoEl ? parseFloat(precioPromoEl.textContent.replace('Bs.', '')) : parseFloat(precioNormalEl.textContent.replace('Bs.', ''));
            } else {
                const precioPromoEl = card.querySelector('.precio.promo');
                const precioNormalEl = card.querySelector('.precio:not(.promo):not(.original)');
                precio = precioPromoEl ? parseFloat(precioPromoEl.textContent.replace('Bs.', '')) : parseFloat(precioNormalEl.textContent.replace('Bs.', ''));
            }
            // Si ya existe el producto con mismo tipo, suma cantidad
            const idx = carrito.findIndex(item => item.nombre === nombre && item.tipo === tipo);
            if (idx > -1) {
                carrito[idx].cantidad += cantidad;
            } else {
                carrito.push({ nombre, imagen, cantidad, tipo, precio });
            }
            guardarCarritoLocal();
            // Feedback visual opcional
            e.target.textContent = '¡Agregado!';
            card.querySelector('.cantidad-value').value = '1';
            setTimeout(() => { e.target.textContent = 'Agregar al Carrito'; }, 1000);

            const pepper = document.createElement('i');
            pepper.className = 'fas fa-pepper-hot pepper-anim';
            document.body.appendChild(pepper);

            // Posición inicial: centro del botón
            const btnRect = e.target.getBoundingClientRect();
            pepper.style.position = 'fixed';
            pepper.style.left = (btnRect.left + btnRect.width / 2) + 'px';
            pepper.style.top = (btnRect.top + btnRect.height / 100) + 'px';
            pepper.style.zIndex = 99999;
            pepper.style.pointerEvents = 'none';
            pepper.style.fontSize = '2rem';
            pepper.style.color = '#e31837';

            // Posición final: centro del icono del carrito
            const carritoIcono = document.getElementById('carritoIcono');
            const carritoRect = carritoIcono.getBoundingClientRect();
            const endX = carritoRect.left + carritoRect.width / 2;
            const endY = carritoRect.top + carritoRect.height / 2;

            // Forzar reflow para animar
            pepper.offsetWidth;

            // Animación con transición
            pepper.style.transition = 'all 1s cubic-bezier(.68,-0.55,.27,1.55)';
            pepper.style.left = endX + 'px';
            pepper.style.top = endY + 'px';
            pepper.style.transform = 'scale(0.5) rotate(-30deg)';
            pepper.style.opacity = '0.7';

            setTimeout(() => {
                pepper.remove();
                actualizarContadorCarrito();
            }, 700);
        }
    });

    // --- Cambia el flujo de inicialización ---
    await cargarEtiquetas();
    renderEtiquetas();
    await cargarProductos();
});
