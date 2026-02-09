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

    // 2. LAYOUT (Carga Navbar y Footer)
    if (document.getElementById('navbar-placeholder')) { 
        await renderLayout(); 
    }

    // 3. RUTAS Y FUNCIONALIDADES
    const path = window.location.pathname;

    // A. Lógica de la HOME
    if (document.getElementById('art-grid') || document.getElementById('viral-container')) initHome();
    
    // B. Lógica del CATÁLOGO GENERAL
    if (path.includes('obras.html') || document.getElementById('collection-grid-container')) initCatalog();
    
    // C. Lógica de DETALLES
    if (path.includes('obra-detalle.html')) initObraDetalle();
    if (path.includes('artista-detalle.html')) initArtistaDetalle();
    if (path.includes('artistas.html')) initArtists();
    
    // D. Lógica de PERFIL USUARIO
    if (path.includes('perfil.html')) initUserProfile();

    // E. MODAL RECUPERACIÓN
    if (document.getElementById('forgotModal')) {
        initRecoveryModal();
    }
});

/* ==========================================================================
   1. LAYOUT & NAVEGACIÓN
   ========================================================================== */
async function renderLayout() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    // Calculamos la ruta base (ej: "" o "../../")
    const rootPath = DataLoader.getBasePath().replace('data/', ''); 

    // A. Cargar Navbar
    if (navPlaceholder) {
        const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html'; 
        const partialsPath = rootPath + 'pages/partials/';

        try {
            const resp = await fetch(partialsPath + archivoMenu);
            if (resp.ok) {
                navPlaceholder.innerHTML = await resp.text();
                initNavbarEvents(); // Inicializar eventos (Logout, Popups)
            }
        } catch (e) { console.error("Error Navbar:", e); }
    }

    // B. Cargar Footer
    if (footerPlaceholder) {
        try {
            const footerPath = rootPath + 'pages/partials/footer.html';
            const resp = await fetch(footerPath);
            if (resp.ok) footerPlaceholder.innerHTML = await resp.text();
        } catch (e) { console.error("Error Footer:", e); }
    }

    // C. ARREGLAR LOGOS Y RUTAS (Una vez cargado todo)
    fixLayoutPaths(rootPath);
}

/**
 * FUNCIÓN PARA PONER LOS LOGOS CORRECTOS Y ARREGLAR RUTAS
 */
function fixLayoutPaths(rootPath) {
    // 1. HEADER -> logo_letras.svg
    const navLogo = document.getElementById('dynamic-logo');
    if (navLogo) {
        navLogo.src = rootPath + 'assets/icons/logo_letras.svg';
    }

    // Enlace del logo del header al inicio
    const brandLink = document.querySelector('.brand-link');
    if (brandLink) {
        brandLink.href = rootPath + 'index.html';
    }

    // 2. FOOTER -> logo_blanco.svg
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        // Buscamos la primera imagen dentro del footer (Asumimos que es el logo)
        const footerLogo = footerPlaceholder.querySelector('img');
        if (footerLogo) {
            footerLogo.src = rootPath + 'assets/icons/logo_blanco.svg';
        }
    }
}

/* --- LÓGICA DE LOS POPUPS Y LOGOUT --- */
function initNavbarEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // LÓGICA ACCESO RESTRINGIDO
    const restrictedLinks = document.querySelectorAll('.restricted-link');
    const authModal = document.getElementById('authRequiredModal');
    const closeAuthBtn = document.getElementById('closeAuthModal');

    const closeAuth = () => { if (authModal) authModal.classList.remove('active'); };

    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuth);
    if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });

    restrictedLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const usuario = localStorage.getItem('usuario_logueado');
            if (!usuario) {
                e.preventDefault();
                if (authModal) {
                    authModal.classList.add('active');
                } else {
                    alert("⚠️ Debes iniciar sesión.");
                    const rootPath = DataLoader.getBasePath().replace('data/', '');
                    window.location.href = rootPath + 'pages/auth/login.html';
                }
            }
        });
    });
}

/* ==========================================================================
   2. SEGURIDAD
   ========================================================================== */
function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    const protectedPages = ['perfil.html', 'mis-colecciones.html', 'ajustes.html'];

    if (protectedPages.some(page => path.includes(page)) && !usuario) {
        const loginPath = DataLoader.getBasePath().replace('data/', 'pages/auth/login.html');
        window.location.href = loginPath;
    }
}

function logout() {
    localStorage.removeItem('usuario_logueado');
    const rootPath = DataLoader.getBasePath().replace('data/', '');
    window.location.href = rootPath + 'index.html';
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
                    setTimeout(() => { if(slot.querySelector('img')) slot.querySelector('img').style.opacity = 1; }, 50);
                } else slot.innerHTML = '';
            });
        };
        document.querySelectorAll('.cat-trigger').forEach(link => {
            link.addEventListener('mouseenter', () => window.updateHomeGrid(link.getAttribute('data-cat')));
        });
        window.updateHomeGrid('moderno');
    }

    const viralContainer = document.getElementById('viral-container');
    if (viralContainer) {
        const virales = await DataLoader.getObrasDestacadas();
        viralContainer.innerHTML = virales.map(obra => `
            <article class="art-card">
                <div class="card-image"><img src="${obra.imagen}"><span class="badge">${obra.badge}</span></div>
                <div class="card-info"><h3>${obra.titulo}</h3><p>${obra.artista_nombre}</p></div>
                <a href="pages/catalogo/obra-detalle.html?id=${obra.id}" class="card-link"></a>
            </article>
        `).join('');
    }
}

/* ==========================================================================
   4. CATÁLOGO Y CATEGORÍAS
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
                <div class="card-image"><img src="${o.imagen}" loading="lazy">${o.badge ? `<span class="badge">${o.badge}</span>` : ''}</div>
                <div class="card-info"><h3>${o.titulo}</h3><p>${o.artista_nombre}</p></div>
            </article>
        `).join('');
    };

    const applyFilters = () => {
        let resultados = [...todasLasObras];
        const texto = searchInput ? searchInput.value.toLowerCase() : '';
        const orden = sortSelect ? sortSelect.value : 'default';

        if (texto) resultados = resultados.filter(o => o.titulo.toLowerCase().includes(texto) || o.artista_nombre.toLowerCase().includes(texto));
        if (orden === 'recent') resultados.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        else if (orden === 'popular') resultados.sort((a, b) => b.stats.likes - a.stats.likes);

        render(resultados);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    render(todasLasObras);
}

// PÁGINAS DE CATEGORÍA ESPECÍFICA (Moderno, Clásico...)
window.initCategoryPage = async function(categoriaFiltro) {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    try {
        const obras = await DataLoader.getObras();
        const filtradas = obras.filter(o => o.categoria.toLowerCase() === categoriaFiltro.toLowerCase());

        if (filtradas.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay obras en esta categoría.</p>';
            return;
        }

        // Renderizamos las tarjetas con enlaces corregidos (../catalogo/...)
        // ASUMIMOS que estás en pages/catalogo/moderno.html, así que el enlace es local
        grid.innerHTML = filtradas.map(obra => `
            <a href="obra-detalle.html?id=${obra.id}" class="cat-card">
                <div class="cat-card-img-wrapper">
                    <img src="${obra.imagen}" alt="${obra.titulo}" class="cat-card-img" loading="lazy">
                </div>
                <div class="cat-card-info">
                    <span class="cat-card-title">${obra.titulo}</span>
                    <span class="cat-card-artist">${obra.artista_nombre}</span>
                </div>
            </a>
        `).join('');

    } catch (error) { console.error("Error cargando categoría:", error); }
};

/* ==========================================================================
   5. DETALLES (Obras y Artistas)
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
                    <div class="comentario-content"><strong>${c.handle}</strong><p>${c.texto}</p></div>
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
             worksContainer.innerHTML = artista.lista_obras.map(o => `<div class="mini-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'"><img src="${o.imagen}"></div>`).join('');
         }
    }
}

async function initArtists() {
    const container = document.getElementById('artists-grid-container');
    if (!container) return;
    const artistas = await DataLoader.getArtistas();
    container.innerHTML = artistas.map(a => `
        <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'">
            <div class="artist-image"><img src="${a.imagen}" alt="${a.nombre}"></div>
            <div class="artist-info"><h3>${a.nombre}</h3><p>${a.disciplina}</p></div>
        </article>
    `).join('');
}

/* ==========================================================================
   6. PERFIL USUARIO
   ========================================================================== */
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

/* ==========================================================================
   7. MODAL DE RECUPERACIÓN (LOGIN)
   ========================================================================== */
function initRecoveryModal() {
    const modal = document.getElementById('forgotModal');
    const openBtn = document.getElementById('forgotLink'); 
    const closeBtn = document.getElementById('closeModal');
    const form = document.getElementById('recoveryForm');
    
    // Inputs
    const pass1 = document.getElementById('newPassword');
    const pass2 = document.getElementById('confirmPassword');
    const errorMsg = document.getElementById('passwordError');
    const successMsg = document.getElementById('recoverySuccess');
    
    // Toggles
    const toggle1 = document.getElementById('toggleNewPass');
    const toggle2 = document.getElementById('toggleConfirmPass');

    // Abrir
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            if(form) { form.reset(); form.style.display = 'block'; }
            if(successMsg) successMsg.style.display = 'none';
            if(errorMsg) errorMsg.textContent = '';
        });
    }

    // Cerrar
    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Ojitos
    const toggleVisibility = (input, icon) => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    };
    if(toggle1 && pass1) toggle1.addEventListener('click', () => toggleVisibility(pass1, toggle1));
    if(toggle2 && pass2) toggle2.addEventListener('click', () => toggleVisibility(pass2, toggle2));

    // Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (pass1.value !== pass2.value) {
                errorMsg.textContent = "❌ Las contraseñas no coinciden.";
                return;
            }
            if (pass1.value.length < 6) {
                errorMsg.textContent = "⚠️ Mínimo 6 caracteres.";
                return;
            }
            errorMsg.textContent = "";
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = "Procesando...";
            btn.disabled = true;

            setTimeout(() => {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                setTimeout(() => {
                    closeModal();
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */
function safeText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}