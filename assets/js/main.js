/* ==========================================================================
   VÉRTICE MAIN ENGINE (Versión Final Integrada)
   Dependencia: assets/js/services/dataLoader.js (Debe cargarse antes)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. SEGURIDAD: Verificar acceso antes de nada
    authGuard();

    // 2. LAYOUT: Cargar Header y Footer dinámicamente
    await renderLayout();

    // 3. INTERACCIÓN: Iniciar modales globales
    initGlobalModals();

    // 4. RUTAS: Ejecutar lógica según la página actual
    const pageId = document.body.id || ''; // Puedes poner id="home" en el body del index

    // A. Lógica de la HOME (Grid Mágica)
    if (document.getElementById('art-grid') || document.getElementById('home-grid-container')) {
        initHomeInteraction();
    }

    // B. Lógica del CATÁLOGO (Filtros)
    if (document.getElementById('collection-grid-container')) {
        initCatalog();
    }

    // C. Lógica de ARTISTAS
    if (document.getElementById('artists-grid-container')) {
        initArtists();
    }
});

/* ==========================================================================
   1. GESTIÓN DE RUTAS Y PATHS (Tu lógica mejorada)
   ========================================================================== */
function getPaths() {
    const path = window.location.pathname;
    
    // Nivel 0: Raíz (index.html)
    if (path.endsWith('index.html') || path.endsWith('/') || path.length < 2) {
        return { partials: 'pages/partials/', data: 'assets/data/', assets: 'assets/', prefix: '' };
    }
    
    // Nivel 1: pages/auth, pages/catalogo (1 nivel dentro de pages)
    // Ajuste: Depende de tu estructura real. Si pages está en raíz:
    if (path.includes('/pages/')) {
        // Contamos cuántos niveles bajamos
        const depth = (path.match(/\//g) || []).length;
        // Si estamos en /pages/catalogo/moderno.html (profundidad 3 desde raíz relativa)
        // Ajuste simplificado para tu estructura estándar:
        if (path.includes('/auth/') || path.includes('/catalogo/')) {
            return { partials: '../partials/', data: '../../assets/data/', assets: '../../assets/', prefix: '../../' };
        }
    }

    // Fallback genérico
    return { partials: './partials/', data: '../assets/data/', assets: '../assets/', prefix: '../' };
}

/* ==========================================================================
   2. LAYOUT (HEADER Y FOOTER)
   ========================================================================== */
async function renderLayout() {
    const { partials, prefix } = getPaths();
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));

    // --- CARGAR NAVBAR ---
    if (navPlaceholder) {
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html';
        try {
            const resp = await fetch(partials + archivoMenu);
            if (resp.ok) {
                let html = await resp.text();
                navPlaceholder.innerHTML = html;
                fixLinks(navPlaceholder, prefix); // Corregir enlaces ../
                
                // Botón de Salir
                const logoutBtn = document.getElementById('logoutBtn');
                if(logoutBtn) logoutBtn.addEventListener('click', logout);
            }
        } catch (e) { console.error("Error Navbar:", e); }
    }

    // --- CARGAR FOOTER ---
    if (footerPlaceholder) {
        try {
            // Intentamos cargar el archivo footer.html
            const resp = await fetch(partials + 'footer.html');
            if (resp.ok) {
                let html = await resp.text();
                footerPlaceholder.innerHTML = html;
                fixLinks(footerPlaceholder, prefix);
                
                // Activar seguridad en enlaces del footer
                if (!usuario) setupLinkSecurity();
            }
        } catch (e) { console.error("Error Footer:", e); }
    }
}

// Ayudante para arreglar los href relativos
function fixLinks(container, prefix) {
    if (!prefix) return;
    container.querySelectorAll('a, img').forEach(el => {
        const attr = el.tagName === 'A' ? 'href' : 'src';
        const val = el.getAttribute(attr);
        // Si es ruta local (no http, no #), le pegamos el prefijo
        if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('mailto')) {
            el.setAttribute(attr, prefix + val);
        }
    });
}

/* ==========================================================================
   3. SEGURIDAD (AUTH GUARD)
   ========================================================================== */
function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    const restricted = ['artistas.html', 'obras.html', 'detalle.html', 'perfil.html'];

    // Si estamos en zona restringida y no hay usuario
    if (restricted.some(r => path.includes(r)) && !usuario) {
        const { prefix } = getPaths();
        window.location.href = prefix + 'pages/auth/login.html';
    }
}

function setupLinkSecurity() {
    // Busca enlaces con clase 'restricted-link' y bloquea el click
    document.querySelectorAll('.restricted-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal();
        });
    });
}

function logout() {
    localStorage.removeItem('usuario_logueado');
    window.location.reload();
}

/* ==========================================================================
   4. HOME: CUADRÍCULA MÁGICA (Integration)
   ========================================================================== */
async function initHomeInteraction() {
    // ID del grid en el HTML (usamos 'art-grid' como definimos en el CSS final)
    const grid = document.getElementById('art-grid'); 
    if (!grid) return;

    // A. Obtener Datos
    let obras = [];
    if (typeof cargarObras === 'function') {
        obras = await cargarObras(); // Usa dataLoader.js
    } else {
        console.error("Falta dataLoader.js");
        return;
    }

    // B. Organizar por Categoría
    const db = { moderno: [], clasico: [], abstracto: [] };
    obras.forEach(o => {
        if (db[o.categoria]) db[o.categoria].push(o.imagen);
    });

    // C. Lógica Visual
    const images = grid.querySelectorAll('.art-img');
    const triggers = document.querySelectorAll('.cat-trigger'); // Los enlaces de texto

    const shuffle = arr => arr.sort(() => Math.random() - 0.5);

    const updateGrid = (cat) => {
        const pool = db[cat] || [];
        const selected = shuffle([...pool]).slice(0, 5); // Coger 5 al azar

        images.forEach((img, i) => {
            if (selected[i]) {
                img.classList.remove('visible'); // Fade out
                setTimeout(() => {
                    img.src = selected[i];
                    img.onload = () => img.classList.add('visible'); // Fade in
                }, 150);
            } else {
                img.classList.remove('visible');
                setTimeout(() => img.src = '', 150);
            }
        });
    };

    // D. Eventos Hover
    triggers.forEach(t => {
        t.addEventListener('mouseenter', () => {
            const cat = t.getAttribute('data-cat'); // "moderno", "clasico"...
            updateGrid(cat);
        });
    });

    // Carga inicial (opcional)
    // updateGrid('moderno');
}

/* ==========================================================================
   5. CATÁLOGO AVANZADO (Filtros y Búsqueda)
   ========================================================================== */
async function initCatalog() {
    let catalogo = await cargarObras(); // De dataLoader.js
    const container = document.getElementById('collection-grid-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Renderizar
    const render = (items) => {
        if (items.length === 0) {
            container.innerHTML = '<p class="no-results">No se encontraron obras.</p>';
            return;
        }
        container.innerHTML = items.map(o => `
            <div class="collection-item" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                <div class="img-wrapper">
                    <img src="${o.imagen}" alt="${o.titulo}" loading="lazy">
                </div>
                <div class="item-info">
                    <h3>${o.titulo}</h3>
                    <p>${o.artista_nombre}</p>
                    <span class="price">${o.precio}€</span>
                </div>
            </div>
        `).join('');
    };

    // Filtros
    const applyFilters = () => {
        let result = [...catalogo];
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const catBtn = document.querySelector('.filter-btn.active');
        const activeCat = catBtn ? catBtn.dataset.filter : 'all';
        const sortMode = sortSelect ? sortSelect.value : 'default';

        // 1. Texto
        if (term) {
            result = result.filter(o => 
                o.titulo.toLowerCase().includes(term) || 
                o.artista_nombre.toLowerCase().includes(term)
            );
        }

        // 2. Categoría
        if (activeCat !== 'all') {
            result = result.filter(o => o.categoria === activeCat);
        }

        // 3. Orden
        if (sortMode === 'precio-asc') result.sort((a, b) => a.precio - b.precio);
        if (sortMode === 'precio-desc') result.sort((a, b) => b.precio - a.precio);

        render(result);
    };

    // Listeners
    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(sortSelect) sortSelect.addEventListener('change', applyFilters);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    // Inicial
    render(catalogo);
}

/* ==========================================================================
   6. ARTISTAS (Lista Simple)
   ========================================================================== */
async function initArtists() {
    // Asumimos que dataLoader podría tener cargarArtistas(), si no, fetch manual
    // Por ahora usamos fetch manual para artistas.json si no está en dataLoader
    const { data } = getPaths();
    try {
        const r = await fetch(data + 'artistas.json');
        const artistas = await r.json();
        const container = document.getElementById('artists-grid-container');
        
        container.innerHTML = artistas.map(a => `
            <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'">
                <div class="artist-image"><img src="${a.imagen}" alt="${a.nombre}"></div>
                <div class="artist-info">
                    <h3>${a.nombre}</h3>
                    <p>${a.disciplina}</p>
                </div>
            </article>
        `).join('');
    } catch(e) { console.error("Error Artistas:", e); }
}

/* ==========================================================================
   7. MODALES Y UTILIDADES
   ========================================================================== */
function initGlobalModals() {
    window.openAuthModal = () => document.getElementById('auth-modal')?.classList.remove('hidden');
    window.closeAuthModal = () => document.getElementById('auth-modal')?.classList.add('hidden');
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.add('hidden');
        });
    });
}