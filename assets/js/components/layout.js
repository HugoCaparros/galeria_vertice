/* ==========================================================================
   LAYOUT & SECURITY MODULE (VERSIÓN UNIFICADA)
   Ubicación: assets/js/components/layout.js
   ========================================================================== */

window.initLayout = async function() {
    // 1. SEGURIDAD
    if (typeof authGuard === 'function') authGuard();

    // 2. RENDERIZADO (NAVBAR & FOOTER)
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    // Corrección de ruta raíz
    const basePath = DataLoader.getBasePath(); 
    let rootPath = basePath.replace('assets/data/', '');
    if (rootPath === basePath) rootPath = basePath.replace('data/', '').replace('assets/', '');

    // --- CARGAR NAVBAR ---
    if (navPlaceholder) {
        const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
        
        // LÓGICA SIMPLIFICADA: Solo existen dos estados (Logueado o No Logueado)
        // Ya no buscamos 'menu_artista.html', usamos 'sesion_iniciada.html' para todos.
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html'; 
        
        const fullUrl = rootPath + 'pages/partials/' + archivoMenu;

        try {
            const resp = await fetch(fullUrl);
            if (resp.ok) {
                navPlaceholder.innerHTML = await resp.text();
                
                // Inicializar eventos (Logout)
                if (typeof initNavbarEvents === 'function') initNavbarEvents(rootPath);
                
                // PERSONALIZAR EL MENÚ SEGÚN EL ROL (Aquí ocurre la magia)
                if (usuario) updateUserInfo(usuario);
            } else {
                console.error(`❌ Error 404: No se encuentra ${fullUrl}`);
            }
        } catch (e) { console.error("Error Navbar:", e); }
    }

    // --- CARGAR FOOTER ---
    if (footerPlaceholder) {
        try {
            const resp = await fetch(rootPath + 'pages/partials/footer.html');
            if (resp.ok) footerPlaceholder.innerHTML = await resp.text();
        } catch (e) { console.error("Error Footer:", e); }
    }

    // 3. ARREGLAR RUTAS DE IMÁGENES
    if (typeof fixLayoutPaths === 'function') fixLayoutPaths(rootPath);
};

/* ==========================================================================
   FUNCIONES AUXILIARES
   ========================================================================== */

function updateUserInfo(usuario) {
    // 1. Rellenar Nombre
    const nameEl = document.querySelector('.user-name-display');
    if (nameEl && usuario.nombre) {
        nameEl.textContent = usuario.nombre.split(' ')[0];
    }

    // 2. Lógica de Roles (Artista vs Usuario)
    const roleEl = document.querySelector('.user-role-badge');
    
    // Seleccionamos TODOS los elementos que sean exclusivos de artista
    // (Asegúrate de poner la clase 'artist-only-link' a cualquier enlace que solo el artista deba ver)
    const artistLinks = document.querySelectorAll('.artist-only-link');
    
    if (roleEl) {
        const rol = usuario.rol || 'Usuario';
        roleEl.textContent = rol;

        if (rol === 'Artista') {
            // ES ARTISTA:
            roleEl.classList.add('is-artist'); // Pone el badge en negro/blanco
            
            // Mostramos los enlaces exclusivos
            artistLinks.forEach(link => {
                link.style.display = 'inline-flex'; 
            });
        } else {
            // NO ES ARTISTA:
            roleEl.classList.remove('is-artist');
            
            // Ocultamos los enlaces exclusivos
            artistLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }
}

// ... (Mantén authGuard, fixLayoutPaths e initNavbarEvents igual que antes) ...
function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    const protectedPages = ['perfil.html', 'mis-colecciones.html', 'ajustes.html']; 
    if (protectedPages.some(page => path.includes(page)) && !usuario) {
        const basePath = DataLoader.getBasePath();
        let rootPath = basePath.replace('assets/data/', '');
        window.location.href = rootPath + 'pages/auth/login.html';
    }
}

function fixLayoutPaths(rootPath) {
    const navLogo = document.getElementById('dynamic-logo');
    if (navLogo) navLogo.src = rootPath + 'assets/icons/logo_letras.svg';
    const brandLink = document.querySelector('.brand-link');
    if (brandLink) brandLink.href = rootPath + 'index.html';
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const footerLogo = footerPlaceholder.querySelector('img');
        if (footerLogo) footerLogo.src = rootPath + 'assets/icons/logo_blanco.svg';
    }
}

function initNavbarEvents(rootPath) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuario_logueado');
            window.location.href = rootPath + 'index.html';
        });
    }
}