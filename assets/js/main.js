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

    // 1. INICIALIZAR LAYOUT (Navbar, Footer, Auth Guard)
    if (window.initLayout) await window.initLayout();

    // 1.1 INICIALIZAR AUTH SERVICE (Añadido para procesar ?mode=register)
    // Esto permite que el enlace del navbar funcione correctamente.
    if (typeof AuthService !== 'undefined' && AuthService.init) {
        AuthService.init();
    }

    // 2. ENRUTAMIENTO Y LÓGICA DE PÁGINAS
    const path = window.location.pathname;

    // --- A. HOME ---
    if (document.getElementById('viral-container')) {
        if (window.initHomePage) window.initHomePage();
    }

    // --- B. CATEGORÍAS ÍNDICE (categorias.html) ---
    // CORRECCIÓN: Se añade validación para evitar llamadas sin filtro 'undefined'
    if (document.getElementById('category-grid-container')) {
        // Solo llamamos si el HTML no tiene su propia inicialización específica
        // para evitar el error de "filtro undefined" detectado en consola.
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('categoria');
        
        if (window.initCatalogPage && catParam) {
            window.initCatalogPage(catParam);
        }
    }

    // --- C. DETALLE DE CATEGORÍA (abstracto.html, moderno.html...) ---
    if (document.querySelector('.category-container')) {
        if (window.initCategoryDetail) window.initCategoryDetail();
    }

    // --- D. CATÁLOGO GENERAL (obras.html) ---
    if (path.includes('obras.html')) {
        if (window.initGeneralCatalog) window.initGeneralCatalog();
    }

    // --- E. DETALLES (Obra y Artista) ---
    if (path.includes('obra-detalle.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const obraId = urlParams.get('id');
        if (obraId && window.initObraDetalle) window.initObraDetalle(obraId);
    }
    
    if (path.includes('artista-detalle.html') && window.initArtistaDetalle) window.initArtistaDetalle();
    
    // --- F. LISTA DE ARTISTAS ---
    if (path.includes('artistas.html') && window.initArtistsList) window.initArtistsList();

    // --- G. PERFIL DE USUARIO ---
    if (path.includes('perfil.html') && window.initUserProfile) window.initUserProfile();
});