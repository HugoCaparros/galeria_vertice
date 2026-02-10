/* ==========================================================================
   LAYOUT & SECURITY MODULE
   Ubicación: assets/js/components/layout.js
   ========================================================================== */

window.initLayout = async function() {
    // 1. SEGURIDAD (Auth Guard)
    authGuard();

    // 2. RENDERIZADO DE PARTIALS
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const rootPath = DataLoader.getBasePath().replace('data/', ''); 

    // Cargar Navbar
    if (navPlaceholder) {
        const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html'; 
        const partialsPath = rootPath + 'pages/partials/';
        try {
            const resp = await fetch(partialsPath + archivoMenu);
            if (resp.ok) {
                navPlaceholder.innerHTML = await resp.text();
                initNavbarEvents(rootPath); // Pasamos rootPath para redirecciones
            }
        } catch (e) { console.error("Error Navbar:", e); }
    }

    // Cargar Footer
    if (footerPlaceholder) {
        try {
            const resp = await fetch(rootPath + 'pages/partials/footer.html');
            if (resp.ok) footerPlaceholder.innerHTML = await resp.text();
        } catch (e) { console.error("Error Footer:", e); }
    }

    // 3. ARREGLAR RUTAS DE IMÁGENES
    fixLayoutPaths(rootPath);
};

/* --- FUNCIONES PRIVADAS DEL MÓDULO --- */

function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    const protectedPages = ['perfil.html', 'mis-colecciones.html', 'ajustes.html'];
    if (protectedPages.some(page => path.includes(page)) && !usuario) {
        const rootPath = DataLoader.getBasePath().replace('data/', '');
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
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuario_logueado');
            window.location.href = rootPath + 'index.html';
        });
    }

    // Modal de Acceso Restringido
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
                if (authModal) authModal.classList.add('active');
                else window.location.href = rootPath + 'pages/auth/login.html';
            }
        });
    });
}