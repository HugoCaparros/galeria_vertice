/* ==========================================================================
   VÉRTICE MAIN ENGINE
   Ubicación: assets/js/main.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 0. VERIFICACIÓN CRÍTICA
    if (typeof DataLoader === 'undefined') {
        console.error("⛔ DataLoader no encontrado.");
        return;
    }

    // 1. INICIALIZAR LAYOUT (Navbar, Footer)
    if (window.initLayout) await window.initLayout();

    // 2. ENRUTAMIENTO SENCILLO
    const path = window.location.pathname;
    
    // Home
    if (document.getElementById('art-grid') || document.getElementById('viral-container')) {
        if (window.initHomePage) window.initHomePage();
    }

    // Catálogo
    if (document.getElementById('category-grid') || path.includes('obras.html')) {
        if (window.initCatalogPage && !document.getElementById('category-grid')) {
            window.initCatalogPage();
        }
    }

    // Detalles
    if (path.includes('obra-detalle.html') && window.initObraDetalle) window.initObraDetalle();
    if (path.includes('artista-detalle.html') && window.initArtistaDetalle) window.initArtistaDetalle();
    if (path.includes('artistas.html') && window.initArtistsList) window.initArtistsList();

    // Perfil (Nota: Auth se autoinicia en auth.js, no necesitamos llamarlo aquí)
    if (path.includes('perfil.html') && window.initUserProfile) window.initUserProfile();
});