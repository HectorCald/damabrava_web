document.getElementById('contactBtn').addEventListener('click', function (e) {
    e.preventDefault();
    const footer = document.querySelector('.footer');
    footer.scrollIntoView({ behavior: 'smooth' });
});

// Efecto parallax en el hero
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
});
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    const fullText = heroTitle.getAttribute('data-fulltext') || heroTitle.textContent;
    // Si es móvil, muestra el texto completo sin animación
    if (window.innerWidth <= 480) {
        heroTitle.textContent = fullText;
        return;
    }
    heroTitle.textContent = '';
    let i = 0;
    function typeWriter() {
        if (i < fullText.length) {
            heroTitle.textContent += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 20);
        }
    }
    typeWriter();
});
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.producto-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const recetaCards = document.querySelectorAll('.receta-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    recetaCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const nosotrosContent = document.querySelector('.nosotros-content');
    const nosotrosImage = document.querySelector('.nosotros-image');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    if (nosotrosContent && nosotrosImage) {
        nosotrosContent.style.transition = 'all 0.8s ease';
        nosotrosImage.style.transition = 'all 0.8s ease';

        observer.observe(nosotrosContent);
        observer.observe(nosotrosImage);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const socialCards = document.querySelectorAll('.social-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    socialCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const tips = [
        "Agrega las hierbas secas al principio de la cocción y las frescas al final para obtener el mejor sabor.",
        "Para realzar el sabor de las especias, tuéstalas ligeramente antes de usarlas.",
        "Guarda tus condimentos en un lugar fresco y oscuro para mantener su frescura.",
        "Usa una pizca de pimentón para dar color y sabor a tus sopas y guisos.",
        "Las hierbas frescas picadas pueden congelarse en cubitos de aceite de oliva.",
        "Mezcla diferentes tipos de pimientas para crear perfiles de sabor únicos.",
        "El orégano combina perfectamente con tomates y platos mediterráneos.",
        "Para un aroma más intenso, tritura las hierbas secas entre tus manos antes de usarlas."
    ];

    const tipText = document.getElementById('tipText');
    const tipCard = document.querySelector('.tip-card');
    let currentTip = 0;

    function changeTip() {
        tipCard.classList.remove('active');

        setTimeout(() => {
            tipText.textContent = tips[currentTip];
            currentTip = (currentTip + 1) % tips.length;
            tipCard.classList.add('active');
        }, 500);
    }

    setInterval(changeTip, 6000);
});
const DB_NAME = 'damabrava_web'; // O el nombre que prefieras para tu base de datos

const PRODUCTOS_STORE = 'productos_cache-web';

const IMAGENES_STORE = 'imagenes_cache-web';
let productosWeb = []; // Variable global para almacenar los productos

// Modifica tu initDB para crear el store de imágenes si no existe
function initDB() {
    return new Promise((resolve, reject) => {
        const checkRequest = indexedDB.open(DB_NAME);
        checkRequest.onerror = () => reject(checkRequest.error);
        checkRequest.onsuccess = () => {
            const db = checkRequest.result;
            if (db.objectStoreNames.contains(PRODUCTOS_STORE) && db.objectStoreNames.contains(IMAGENES_STORE)) {
                resolve(db);
            } else {
                const newVersion = db.version + 1;
                db.close();
                const upgradeRequest = indexedDB.open(DB_NAME, newVersion);
                upgradeRequest.onerror = () => reject(upgradeRequest.error);
                upgradeRequest.onupgradeneeded = (event) => {
                    const upgradeDb = event.target.result;
                    if (!upgradeDb.objectStoreNames.contains(PRODUCTOS_STORE)) {
                        upgradeDb.createObjectStore(PRODUCTOS_STORE, { keyPath: 'id' });
                    }
                    if (!upgradeDb.objectStoreNames.contains(IMAGENES_STORE)) {
                        upgradeDb.createObjectStore(IMAGENES_STORE, { keyPath: 'id' });
                    }
                };
                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
            }
        };
    });
}
async function guardarImagenLocal(id, url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const db = await initDB();
                const tx = db.transaction(IMAGENES_STORE, 'readwrite');
                const store = tx.objectStore(IMAGENES_STORE);
                await store.put({
                    id,
                    data: reader.result,
                    timestamp: Date.now()
                });
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error guardando imagen local:', error);
    }
}
async function obtenerImagenLocal(id) {
    const db = await initDB();
    const tx = db.transaction(IMAGENES_STORE, 'readonly');
    const store = tx.objectStore(IMAGENES_STORE);
    return new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}
function necesitaActualizacion(imagenCache, url) {
    // Siempre actualiza si la imagen no existe o si han pasado más de 1 día
    if (!imagenCache) return true;
    const unDia = 24 * 60 * 60 * 1000;
    return (Date.now() - imagenCache.timestamp) > unDia;
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
async function cargarProductosPreview() {
    // 1. Mostrar productos desde cache si existen
    const productosCache = await obtenerProductosLocal();
    if (productosCache.length > 0) {
        renderProductosPreview(productosCache);
    }

    // 2. Pedir productos al servidor y actualizar cache si hay cambios
    try {
        const response = await fetch('/obtener-productos');
        const data = await response.json();
        productosWeb = data.productos.filter(producto => {
            const etiquetasArray = producto.etiquetas.split(';').map(e => e.trim());
            return etiquetasArray.includes('Web');
        });

        // Si hay cambios, renderiza y actualiza cache
        if (JSON.stringify(productosCache) !== JSON.stringify(productosWeb)) {
            renderProductosPreview(productosWeb);
            await guardarProductosLocal(productosWeb);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}


async function renderProductosPreview(productos) {
    const productosGrid = document.getElementById('productos-preview-grid');
    productosGrid.innerHTML = '';

    // Barajar el array para que sean random
    const productosRandom = productos
        .slice() // copia para no mutar el original
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    for (const producto of productosRandom) {
        let imagenMostrar = `<i class='bx bx-package'></i>`;
        if (producto.imagen && producto.imagen.includes('https://res.cloudinary.com')) {
            const imagenCache = await obtenerImagenLocal(producto.id);
            if (imagenCache && !necesitaActualizacion(imagenCache, producto.imagen)) {
                imagenMostrar = `<img class="imagen" src="${imagenCache.data}" alt="${producto.producto}" onerror="this.parentElement.innerHTML='<i class=\\'bx bx-package\\'></i>'" style="filter: saturate(150%);">`;
            } else {
                guardarImagenLocal(producto.id, producto.imagen);
                imagenMostrar = `<img class="imagen" src="${producto.imagen}" alt="${producto.producto}" onerror="this.parentElement.innerHTML='<i class=\\'bx bx-package\\'></i>'" style="filter: saturate(150%);">`;
            }
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
        
    `;
        } else {
            cantidadBtnsHTML = `<div class="cantidad-label">1 unidad</div>`;
        }
        productosGrid.innerHTML += `
            <div class="producto-card">
                ${producto.promociones && producto.promociones.trim() !== '' ? `
                    <div class="cinta-descuento">${producto.promociones}</div>
                ` : ''}
                <div class="producto-imagen">
                    ${imagenMostrar}
                </div>
                <h3>${producto.producto} ${producto.gramos}gr.</h3>
                ${cantidadBtnsHTML}
                ${precioHTML}
                <p>${producto.cantidadxgrupo !== '1' ? producto.cantidadxgrupo + ' unidades por tira' : ''} </p>
                <a href="/productos" class="ver-producto">Ver Producto</a>
            </div>
        `;
    }
    document.querySelectorAll('.cantidad-btns').forEach(btnGroup => {
        const id = btnGroup.getAttribute('data-id');
        const precioBase = parseFloat(btnGroup.getAttribute('data-precio'));
        const cantidad = parseInt(btnGroup.getAttribute('data-cantidad'), 10);

        btnGroup.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', function () {
                btnGroup.querySelectorAll('.btn-cantidad').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const tipo = this.getAttribute('data-tipo');
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
            });
        });
    });
}






async function cargarRecetasPreview() {
    try {
        const response = await fetch('/obtener-recetas');
        const data = await response.json();
        let recetas = data.recetas;

        // Mezclar el array recetas (algoritmo Fisher-Yates)
        for (let i = recetas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [recetas[i], recetas[j]] = [recetas[j], recetas[i]];
        }

        // Tomar solo las primeras 3 recetas
        recetas = recetas.slice(0, 3);

        const recetasSlider = document.getElementById('recetas-preview-slider');
        recetasSlider.innerHTML = '';

        recetas.forEach(receta => {
            // Formatea el tiempo
            let tiempoTexto = '';
            const minutos = parseInt(receta.tiempo, 10);
            if (minutos >= 60) {
                const horas = Math.floor(minutos / 60);
                const mins = minutos % 60;
                tiempoTexto = `${horas} hr${horas > 1 ? 's' : ''}${mins > 0 ? ' ' + mins + ' min' : ''}`;
            } else {
                tiempoTexto = `${minutos} min`;
            }

            const recetaHTML = `
                <div class="receta-card">
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
                            <a href="${receta.url}" class="ver-receta" target="_blank">Ver Receta</a>
                        </div>
                    </div>
                </div>
            `;
            recetasSlider.innerHTML += recetaHTML;
        });
    } catch (error) {
        console.error('Error al cargar recetas:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosPreview();
    cargarRecetasPreview();
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('ver-producto')) {
            window.location.href = '/productos';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const catalogoBtn = document.getElementById('catalogoBtn');
    if (catalogoBtn) {
        catalogoBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch('/obtener-catalogo');
                const data = await res.json();
                if (data.success && data.url) {
                    window.open(data.url, '_blank');
                } else {
                    alert('No se encontró el catálogo.');
                }
            } catch (err) {
                alert('Error al obtener el catálogo.');
            }
        });
    }
});