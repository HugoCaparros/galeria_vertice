/* ==========================================================================
   VÉRTICE MAIN ENGINE
   Ubicación: assets/js/main.js
   Descripción: Punto de entrada que orquesta la carga de módulos.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 0. VERIFICACIÓN CRÍTICA
    if (typeof DataLoader === 'undefined') {
        console.error("⛔ CRÍTICO: DataLoader no encontrado. Asegúrate de cargarlo antes de main.js");
        return;
    }

    // 1. INICIALIZAR LAYOUT GLOBAL (Navbar, Footer, Auth, Logos)
    // Esta función estará en components/layout.js
    if (window.initLayout) {
        await window.initLayout();
    }

    // 2. ENRUTADOR BÁSICO (Detectar página y ejecutar lógica)
    const path = window.location.pathname;
    
    // A. HOME
    if (document.getElementById('art-grid') || document.getElementById('viral-container')) {
        if (window.initHomePage) window.initHomePage();
    }

    // B. CATÁLOGO Y CATEGORÍAS (Moderno, Clásico, etc.)
    // Detectamos si hay un grid de categoría o es la página general de obras
    if (document.getElementById('category-grid') || path.includes('obras.html') || document.getElementById('collection-grid-container')) {
        // Si hay una función específica de categoría definida en el HTML (como en moderno.html), se ejecutará allí.
        // Si es el catálogo general:
        if (window.initCatalogPage && !document.getElementById('category-grid')) {
            window.initCatalogPage();
        }
    }

    // C. DETALLES (Obra y Artista)
    if (path.includes('obra-detalle.html') && window.initObraDetalle) window.initObraDetalle();
    if (path.includes('artista-detalle.html') && window.initArtistaDetalle) window.initArtistaDetalle();
    if (path.includes('artistas.html') && window.initArtistsList) window.initArtistsList();

    // D. PERFIL Y AUTH
    if (path.includes('perfil.html') && window.initUserProfile) window.initUserProfile();
    if (document.getElementById('forgotModal') && window.initRecoveryModal) window.initRecoveryModal();
});