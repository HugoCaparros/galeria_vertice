/* =========================================
   VÉRTICE MAIN JS - MOTOR CENTRAL (FINAL)
   ========================================= */

// Variables globales para datos (Cache)
let obrasGlobales = []; 
let catalogoCompleto = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURIDAD PRIMERO: Si intentan entrar a sitio privado sin permiso, fuera.
    authGuard();

    // 2. CONSTRUIR LA INTERFAZ (Header y Footer Dinámicos)
    renderLayout();

    // 3. CARGAR DATOS (Grid, Catálogo, Artistas según la página)
    initDataLoading();
});

/* ----------------------------------------------------------------
   A. DETECTOR DE RUTAS INTELIGENTE
   Calcula dónde estamos para arreglar los enlaces (../../)
   ---------------------------------------------------------------- */
function getPaths() {
    const path = window.location.pathname;
    
    // CASO 1: Estamos en el Inicio (root)
    if (path.endsWith('index.html') || path.endsWith('/')) {
        return {
            partials: 'pages/partials/', // Busca los HTMLs en pages/partials/
            data: './data/',             // Busca los JSONs en ./data/
            prefix: ''                   // Enlaces normales
        };
    }
    
    // CASO 2: Estamos en subcarpetas profundas (auth, catalogo, usuario)
    // Ejemplo: pages/catalogo/obras.html
    if (path.includes('/auth/') || path.includes('/catalogo/') || path.includes('/usuario/')) {
        return {
            partials: '../partials/',    // Sube un nivel para hallar partials
            data: '../../data/',         // Sube dos niveles para hallar data
            prefix: '../../'             // Sube dos niveles para ir a la raíz
        };
    }

    // CASO 3: Estamos directamente en pages/ (Poco común, pero por seguridad)
    return {
        partials: './partials/',
        data: '../data/',
        prefix: '../'
    };
}

/* ----------------------------------------------------------------
   B. GENERADOR DE LAYOUT (HEADER Y FOOTER)
   ---------------------------------------------------------------- */
async function renderLayout() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const { partials, prefix } = getPaths(); // Obtenemos las rutas calculadas

    // --- 1. CARGAR HEADER (NAVBAR) ---
    if (navPlaceholder) {
        // Elegir archivo según si hay usuario logueado o no
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html';
        
        try {
            const response = await fetch(partials + archivoMenu);
            if (!response.ok) throw new Error(`No se encontró ${partials + archivoMenu}`);
            
            const html = await response.text();
            navPlaceholder.innerHTML = html;

            // MAGIA: CORREGIR ENLACES DEL MENÚ IMPORTADO
            // Si estamos en una subcarpeta, añadimos ../../ a los enlaces automáticamente
            if (prefix !== '') {
                navPlaceholder.querySelectorAll('a').forEach(link => {
                    const href = link.getAttribute('href');
                    // Solo corregimos rutas relativas locales (no http, no #)
                    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
                        link.setAttribute('href', prefix + href);
                    }
                });
            }

            // CASO ESPECIAL: Si estamos en Categorías (Moderno/Clásico/Abstracto)
            // Cambiamos el menú de la izquierda por "← Inicio"
            if (window.location.pathname.match(/(moderno|clasico|abstracto)\.html/)) {
                const navLeft = navPlaceholder.querySelector('.nav-left');
                if(navLeft) navLeft.innerHTML = `<a href="${prefix}index.html" style="font-weight:500;">← Inicio</a>`;
            }

            // Reactivar el popup de seguridad para los nuevos enlaces cargados
            if (!usuario) setupNavigationSecurity();

        } catch (error) {
            console.error('🔴 Error cargando el Header:', error);
            navPlaceholder.innerHTML = `<p style="text-align:center; padding:1rem; color:red;">Error cargando menú. Revisa la consola.</p>`;
        }
    }

    // --- 2. CARGAR FOOTER (DISEÑO OSCURO) ---
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>ARTE DESDE OTRO<br>ÁNGULO</h3>
                    <div class="footer-logo-box">
                        <div class="templo-icon"><span></span><span></span><span></span><span></span></div>
                        <span class="brand-name">VÉRTICE</span>
                    </div>
                </div>
                <div class="footer-links">
                    <div class="col">
                        <h4>EXPLORA</h4>
                        <a href="${prefix}pages/catalogo/artistas.html" class="${!usuario ? 'restricted-link' : ''}">ARTISTAS DESTACADOS</a>
                        <a href="${prefix}pages/catalogo/obras.html" class="${!usuario ? 'restricted-link' : ''}">OBRAS TRENDING</a>
                    </div>
                    <div class="col">
                        <h4>SOBRE NOSOTROS</h4>
                        <a href="#">QUIENES SOMOS</a>
                        <a href="#">PARTNERS</a>
                        <a href="#">MANIFIESTO</a>
                    </div>
                    <div class="col">
                        <h4>COMUNIDAD</h4>
                        <a href="#">DROPS</a>
                        <a href="#">NOTICIAS</a>
                    </div>
                    <div class="col">
                        <h4>CONTACTO</h4>
                        <a href="#">FAQ</a>
                        <a href="#">SOPORTE</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="legal-links">
                    <a href="#">TÉRMINOS DE USO</a>
                    <a href="#">POLÍTICA DE PRIVACIDAD</a>
                    <a href="#">POLÍTICA DE COOKIES</a>
                </div>
                <div class="social-icons">
                    <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-linkedin-in"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>
        </footer>`;
        
        // Activamos seguridad en los links del footer también
        if (!usuario) setupNavigationSecurity();
    }
}

/* ----------------------------------------------------------------
   C. SEGURIDAD (AUTH GUARD & MODAL)
   ---------------------------------------------------------------- */
function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;

    // Páginas prohibidas para invitados
    const zonasRestringidas = [
        'artistas.html', 
        'artista-detalle.html', 
        'obras.html', 
        'obra-detalle.html', 
        'perfil.html',
        'perfil-usuario.html'
    ];
    
    // Si la URL contiene una zona restringida y NO hay usuario...
    if (zonasRestringidas.some(zona => path.includes(zona)) && !usuario) {
        console.warn("⛔ Acceso denegado. Redirigiendo...");
        const { prefix } = getPaths();
        window.location.href = prefix + 'pages/auth/login.html';
    }
}

function setupNavigationSecurity() {
    // Esperamos un poco para asegurar que el DOM inyectado (Header/Footer) existe
    setTimeout(() => {
        const protectedLinks = document.querySelectorAll('.restricted-link');
        
        protectedLinks.forEach(link => {
            // Clonamos el nodo para eliminar listeners anteriores duplicados
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', (e) => {
                e.preventDefault(); // Bloquear navegación
                openAuthModal();    // Abrir popup
            });
        });
    }, 200);
}

// Control global del Modal (Popup)
window.openAuthModal = function() { document.getElementById('auth-modal')?.classList.remove('hidden'); }
window.closeAuthModal = function() { document.getElementById('auth-modal')?.classList.add('hidden'); }

/* ----------------------------------------------------------------
   D. CARGA DE DATOS (Catálogo, Home, etc.)
   ---------------------------------------------------------------- */
function initDataLoading() {
    const { data } = getPaths(); // Obtenemos ruta correcta a los JSON (./data o ../../data)

    // 1. HOME (Grid + Hover)
    if (document.getElementById('home-grid-container')) {
        loadHomeData(data + 'obras.json');
    }

    // 2. ARTISTAS (Lista)
    if (document.getElementById('artists-grid-container')) {
        loadJSON(data + 'artistas.json', renderArtists);
    }

    // 3. OBRAS (Catálogo Completo con Filtros)
    if (document.getElementById('collection-grid-container')) {
        setupAdvancedCatalog(data + 'obras.json');
    }
}

// --- LÓGICA HOME ---
async function loadHomeData(url) {
    try {
        const r = await fetch(url); 
        obrasGlobales = await r.json();
        
        // Carga inicial (5 primeras)
        renderHomeGrid(obrasGlobales.slice(0, 5));
        
        // Configurar Hover en Categorías
        setupHomeHover();
    } catch(e){ console.error("Error Home:", e); }
}

function renderHomeGrid(items) {
    const container = document.getElementById('home-grid-container');
    if(!container) return;
    container.innerHTML = items.map(item => `
        <div class="grid-item fade-in">
            <img src="${item.imagen}" alt="${item.titulo}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
        </div>
    `).join('');
}

function setupHomeHover() {
    const links = document.querySelectorAll('.cat-link');
    const menu = document.getElementById('category-menu');

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const cat = link.getAttribute('data-cat');
            // Filtrar y mostrar máximo 5
            const filtradas = obrasGlobales.filter(o => o.categoria === cat).slice(0, 5);
            renderHomeGrid(filtradas);
        });
    });

    // Al salir, volver al mix original (opcional)
    if(menu) {
        menu.addEventListener('mouseleave', () => {
            renderHomeGrid(obrasGlobales.slice(0, 5));
        });
    }
}

// --- LÓGICA CATÁLOGO AVANZADO (Filtros) ---
async function setupAdvancedCatalog(url) {
    try {
        const response = await fetch(url);
        catalogoCompleto = await response.json();
        
        // Render inicial
        renderCollection(catalogoCompleto);
        
        // Listeners
        const search = document.getElementById('searchInput');
        const sort = document.getElementById('sortSelect');
        const btns = document.querySelectorAll('.filter-btn');

        if(search) search.addEventListener('input', aplicarFiltros);
        if(sort) sort.addEventListener('change', aplicarFiltros);
        
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Toggle clase active
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                aplicarFiltros();
            });
        });

    } catch(e) { console.error("Error Catálogo:", e); }
}

function aplicarFiltros() {
    const texto = document.getElementById('searchInput').value.toLowerCase();
    const catBtn = document.querySelector('.filter-btn.active');
    const categoria = catBtn ? catBtn.dataset.filter : 'all';
    const orden = document.getElementById('sortSelect').value;
    
    // 1. Filtrar
    let resultados = catalogoCompleto.filter(obra => {
        const matchTexto = obra.titulo.toLowerCase().includes(texto) || 
                           obra.artista_nombre.toLowerCase().includes(texto);
        const matchCat = categoria === 'all' || obra.categoria === categoria;
        return matchTexto && matchCat;
    });
    
    // 2. Ordenar
    if (orden === 'precio-asc') resultados.sort((a,b) => a.precio - b.precio);
    if (orden === 'precio-desc') resultados.sort((a,b) => b.precio - a.precio);
    
    // 3. Renderizar
    renderCollection(resultados);
}

function renderCollection(obras) {
    const container = document.getElementById('collection-grid-container');
    if(!container) return;
    
    if(obras.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem;">No se encontraron obras.</p>';
        return;
    }

    container.innerHTML = obras.map(o => `
        <div class="collection-item" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
            <img src="${o.imagen}" alt="${o.titulo}">
            <div class="item-overlay">
                <p>${o.titulo}</p>
                <span>${o.precio}€</span>
            </div>
        </div>
    `).join('');
}

// --- HELPERS GENERALES ---
async function loadJSON(url, callback) { 
    try { 
        const r = await fetch(url); 
        callback(await r.json()); 
    } catch(e){ console.error(e); } 
}

function renderArtists(artistas) {
    const container = document.getElementById('artists-grid-container');
    if(!container) return;
    container.innerHTML = artistas.map(a => `
        <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'" style="cursor:pointer;">
            <div class="artist-image"><img src="${a.imagen}" alt="${a.nombre}"></div>
            <div class="artist-info">
                <h3>${a.nombre}</h3>
                <p>${a.disciplina}</p>
            </div>
        </article>
    `).join('');
}