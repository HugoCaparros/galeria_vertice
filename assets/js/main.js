/* ==========================================================================
   VÉRTICE MAIN ENGINE
   Ubicación: assets/js/main.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 0. VERIFICACIÓN
    if (typeof DataLoader === 'undefined') {
        console.error("⛔ CRÍTICO: DataLoader no encontrado.");
        return;
    }

    // 1. SEGURIDAD
    authGuard();

    // 2. LAYOUT
    if (document.getElementById('navbar-placeholder')) { 
        await renderLayout(); 
    }

    // 3. RUTAS
    const path = window.location.pathname;

    if (document.getElementById('art-grid') || document.getElementById('viral-container')) initHome();
    if (path.includes('obras.html') || document.getElementById('collection-grid-container')) initCatalog();
    if (path.includes('obra-detalle.html')) initObraDetalle();
    if (path.includes('artista-detalle.html')) initArtistaDetalle();
    if (path.includes('artistas.html')) initArtists();
    if (path.includes('perfil.html')) initUserProfile();
});

/* ==========================================================================
   1. LAYOUT & NAVEGACIÓN
   ========================================================================== */
async function renderLayout() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    // TRUCO DE RUTAS:
    // DataLoader nos da la ruta a 'data/' (ej: "data/" o "../../data/")
    // Nosotros queremos ir a 'pages/partials/', que está justo al lado de 'data'.
    // Así que simplemente reemplazamos la palabra.
    const basePath = DataLoader.getBasePath().replace('data/', 'pages/partials/'); 

    // A. Cargar Navbar
    if (navPlaceholder) {
        const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
        // Usamos tus nombres de archivo reales
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html'; 

        try {
            const resp = await fetch(basePath + archivoMenu);
            if (resp.ok) {
                navPlaceholder.innerHTML = await resp.text();
                initNavbarEvents();
            } else {
                console.error(`Error 404: No encuentro ${archivoMenu} en ${basePath}`);
            }
        } catch (e) { console.error("Error Navbar:", e); }
    }

    // B. Cargar Footer
    if (footerPlaceholder) {
        try {
            const resp = await fetch(basePath + 'footer.html');
            if (resp.ok) {
                footerPlaceholder.innerHTML = await resp.text();
            }
        } catch (e) { console.error("Error Footer:", e); }
    }
}

function initNavbarEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuario_logueado');
            window.location.reload();
        });
    }
}

/* ==========================================================================
   2. SEGURIDAD
   ========================================================================== */
function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    const protectedPages = ['perfil.html', 'mis-colecciones.html', 'ajustes.html'];

    if (protectedPages.some(page => path.includes(page)) && !usuario) {
        // Usamos la misma lógica para encontrar el login
        const loginPath = DataLoader.getBasePath().replace('data/', 'pages/auth/login.html');
        window.location.href = loginPath;
    }
}

function logout() {
    localStorage.removeItem('usuario_logueado');
    // Para volver al index, si estamos en pages subimos 2 niveles
    const isSubPage = window.location.pathname.includes('/pages/');
    window.location.href = isSubPage ? '../../index.html' : 'index.html';
}

/* ==========================================================================
   3. HOME
   ========================================================================== */
async function initHome() {
    const grid = document.getElementById('art-grid');
    if (grid) {
        const obras = await DataLoader.getObras();
        
        window.updateHomeGrid = (categoria) => {
            const slots = grid.querySelectorAll('.art-slot');
            const filtradas = obras.filter(o => o.categoria === categoria);
            const seleccion = filtradas.sort(() => 0.5 - Math.random()).slice(0, 5);
            
            slots.forEach((slot, index) => {
                if (seleccion[index]) {
                    slot.innerHTML = `<img src="${seleccion[index].imagen}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition: opacity 0.5s;">`;
                    setTimeout(() => {
                        const img = slot.querySelector('img');
                        if(img) img.style.opacity = 1;
                    }, 50);
                } else {
                    slot.innerHTML = '';
                }
            });
        };

        document.querySelectorAll('.cat-trigger').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const cat = link.getAttribute('data-cat');
                window.updateHomeGrid(cat);
            });
        });
        
        window.updateHomeGrid('moderno');
    }

    const viralContainer = document.getElementById('viral-container');
    if (viralContainer) {
        const virales = await DataLoader.getObrasDestacadas();
        viralContainer.innerHTML = virales.map(obra => `
            <article class="art-card">
                <div class="card-image">
                    <img src="${obra.imagen}" alt="${obra.titulo}">
                    <span class="badge">${obra.badge}</span>
                </div>
                <div class="card-info">
                    <h3>${obra.titulo}</h3>
                    <p>${obra.artista_nombre}</p>
                </div>
                <a href="pages/catalogo/obra-detalle.html?id=${obra.id}" class="card-link"></a>
            </article>
        `).join('');
    }
}

/* ==========================================================================
   4. CATÁLOGO
   ========================================================================== */
async function initCatalog() {
    const container = document.getElementById('collection-grid-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (!container) return;

    let todasLasObras = await DataLoader.getObras();
    
    const render = (obras) => {
        if (obras.length === 0) {
            container.innerHTML = '<p class="no-results">No se encontraron obras.</p>';
            return;
        }

        container.innerHTML = obras.map(o => `
            <article class="art-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                <div class="card-image">
                    <img src="${o.imagen}" alt="${o.titulo}" loading="lazy">
                    ${o.badge ? `<span class="badge">${o.badge}</span>` : ''}
                </div>
                <div class="card-info">
                    <h3>${o.titulo}</h3>
                    <p>${o.artista_nombre}</p>
                </div>
            </article>
        `).join('');
    };

    const applyFilters = () => {
        let resultados = [...todasLasObras];
        const texto = searchInput ? searchInput.value.toLowerCase() : '';
        const orden = sortSelect ? sortSelect.value : 'default';

        if (texto) {
            resultados = resultados.filter(o => 
                o.titulo.toLowerCase().includes(texto) || 
                o.artista_nombre.toLowerCase().includes(texto)
            );
        }

        if (orden === 'recent') {
            resultados.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        } else if (orden === 'popular') {
            resultados.sort((a, b) => b.stats.likes - a.stats.likes);
        }

        render(resultados);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    render(todasLasObras);
}

/* ==========================================================================
   5. DETALLES
   ========================================================================== */
async function initObraDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const obra = await DataLoader.getObraCompleta(id);
    if (obra) {
        safeText('obra-titulo', obra.titulo);
        safeText('obra-artista', obra.artista_nombre);
        safeText('obra-descripcion', obra.descripcion);
        safeText('obra-tecnica', obra.tecnica);
        safeText('obra-dimensiones', obra.dimensiones);
        
        const imgEl = document.getElementById('obra-imagen-full');
        if (imgEl) imgEl.src = obra.imagen;

        const commentsContainer = document.getElementById('lista-comentarios');
        if (commentsContainer && obra.lista_comentarios) {
            commentsContainer.innerHTML = obra.lista_comentarios.map(c => `
                <div class="comentario">
                    <img src="${c.avatar}" class="user-avatar-small">
                    <div class="comentario-content">
                        <strong>${c.handle}</strong>
                        <p>${c.texto}</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

async function initArtistaDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const artista = await DataLoader.getArtistaCompleto(id);
    if (artista) {
         safeText('nombre-artista', artista.nombre);
         safeText('bio-artista', artista.bio);
         safeText('disciplina-artista', artista.disciplina);

         const img = document.getElementById('imagen-artista');
         if(img) img.src = artista.imagen;
         
         const banner = document.getElementById('banner-artista');
         if(banner) banner.src = artista.banner;

         const worksContainer = document.getElementById('obras-artista-grid');
         if(worksContainer && artista.lista_obras) {
             worksContainer.innerHTML = artista.lista_obras.map(o => `
                 <div class="mini-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                    <img src="${o.imagen}">
                 </div>
             `).join('');
         }
    }
}

async function initArtists() {
    const container = document.getElementById('artists-grid-container');
    if (!container) return;

    const artistas = await DataLoader.getArtistas();
    container.innerHTML = artistas.map(a => `
        <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'">
            <div class="artist-image">
                <img src="${a.imagen}" alt="${a.nombre}">
            </div>
            <div class="artist-info">
                <h3>${a.nombre}</h3>
                <p>${a.disciplina}</p>
            </div>
        </article>
    `).join('');
}

async function initUserProfile() {
    const usuario = await DataLoader.getUsuarioActual();
    if (usuario) {
        safeText('user-name', usuario.nombre);
        safeText('user-handle', usuario.handle);
        safeText('user-bio', usuario.bio);
        safeText('stats-followers', usuario.seguidores);
        safeText('stats-following', usuario.siguiendo);

        const avatarEl = document.getElementById('user-avatar-img');
        if (avatarEl) avatarEl.src = usuario.avatar;
    }
}

function safeText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}