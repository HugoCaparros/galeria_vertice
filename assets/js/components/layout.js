/* ==========================================================================
   LAYOUT & SECURITY MODULE (VERSIÓN UNIFICADA CON MODAL)
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
        const archivoMenu = usuario ? 'sesion_iniciada.html' : 'iniciar_sesion.html'; 
        
        const fullUrl = rootPath + 'pages/partials/' + archivoMenu;

        try {
            const resp = await fetch(fullUrl);
            if (resp.ok) {
                navPlaceholder.innerHTML = await resp.text();
                
                // Inicializar eventos (Logout)
                if (typeof initNavbarEvents === 'function') initNavbarEvents(rootPath);
                
                // PERSONALIZAR EL MENÚ SEGÚN EL ROL
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
   FUNCIONES AUXILIARES (LOGIN / UI)
   ========================================================================== */

function updateUserInfo(usuario) {
    // 1. Rellenar Nombre
    const nameEl = document.querySelector('.user-name-display');
    if (nameEl && usuario.nombre) {
        nameEl.textContent = usuario.nombre.split(' ')[0];
    }

    // 2. Lógica de Roles (Artista vs Usuario)
    const roleEl = document.querySelector('.user-role-badge');
    const artistLinks = document.querySelectorAll('.artist-only-link');
    
    if (roleEl) {
        const rol = usuario.rol || 'Usuario';
        roleEl.textContent = rol;

        if (rol === 'Artista') {
            roleEl.classList.add('is-artist'); 
            artistLinks.forEach(link => { link.style.display = 'inline-flex'; });
        } else {
            roleEl.classList.remove('is-artist');
            artistLinks.forEach(link => { link.style.display = 'none'; });
        }
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

/* ==========================================================================
   GUARDIA DE SEGURIDAD (Protección de Rutas con Modal)
   ========================================================================== */

function authGuard() {
    const usuario = JSON.parse(localStorage.getItem('usuario_logueado'));
    const path = window.location.pathname;
    
    // LISTA NEGRA: Páginas que requieren estar logueado
    const protectedPages = [
        'perfil.html', 
        'mis-colecciones.html', 
        'ajustes.html', 
        'dashboard.html', 
        'subir-obra.html', 
        'mis-obras.html',
        'artistas.html', 
        'obras.html', 
        'categorias.html',
        'obra-detalle.html',
        'artista-detalle.html',
    ];
    
    // LÓGICA: Si es protegida y NO hay usuario...
    if (protectedPages.some(page => path.includes(page)) && !usuario) {
        
        // Calculamos la ruta raíz para cargar imágenes/links correctamente
        const basePath = DataLoader.getBasePath();
        let rootPath = basePath.replace('assets/data/', '');
        if (rootPath === basePath) {
            rootPath = basePath.replace('data/', '').replace('assets/', '');
        }

        // CAMBIO PRINCIPAL: En lugar de redirigir, mostramos el MODAL
        showAuthModal(rootPath);
        
        // Bloqueamos el scroll para que no bajen a ver el contenido borroso
        document.body.style.overflow = 'hidden';
    }
}

/* --- NUEVA FUNCIÓN: INYECTAR Y MOSTRAR MODAL --- */
function showAuthModal(rootPath) {
    // 1. Verificar si el modal ya existe
    let modal = document.getElementById('authRequiredModal');

    // 2. Si no existe, lo creamos dinámicamente
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'authRequiredModal';
        modal.className = 'modal-overlay'; 
        
        // HTML interno del Popup
        modal.innerHTML = `
            <div class="modal-content modal-exclusive">
                <button class="modal-close" id="closeAuthModal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                
                <div class="modal-header-logo">
                    <img src="${rootPath}assets/icons/logo_letras.svg" alt="VÉRTICE">
                </div>
                
                <h2 class="modal-title">Contenido Exclusivo</h2>
                <p class="modal-description">
                    Únete a nuestra comunidad para acceder a la colección completa.
                </p>
                
                <div class="modal-buttons">
                    <a href="${rootPath}pages/auth/login.html" class="btn-modal-solid">INICIAR SESIÓN</a>
                    <a href="${rootPath}pages/auth/login.html?mode=register" class="btn-modal-outline">CREAR CUENTA</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Lógica de cierre seguro
        const closeBtn = modal.querySelector('#closeAuthModal');
        
        // Si cierran el modal, DEBEN salir de la página protegida
        const safeExit = () => {
            document.body.style.overflow = ''; // Restaurar scroll
            window.location.href = rootPath + 'index.html'; // Redirigir al Home
        };

        closeBtn.onclick = safeExit;
        
        // Clic fuera del modal también saca al usuario
        modal.onclick = (e) => {
            if (e.target === modal) safeExit();
        }
    }

    // 3. Mostrar con pequeña pausa para animación CSS
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}