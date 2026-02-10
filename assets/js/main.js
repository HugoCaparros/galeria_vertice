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

    // 2. ENRUTAMIENTO Y LÓGICA DE PÁGINAS
    const path = window.location.pathname;

    // --- A. HOME ---
    if (document.getElementById('viral-container')) {
        if (window.initHomePage) window.initHomePage();
    }

    // --- B. CATEGORÍAS ÍNDICE (categorias.html) ---
    // Busca el ID específico que pusimos en categorias.html
    if (document.getElementById('category-grid-container')) {
        // Nota: Asegúrate de que category.js esté importado en el HTML
        if (window.initCatalogPage) window.initCatalogPage();
    }

    // --- C. DETALLE DE CATEGORÍA (abstracto.html, moderno.html...) ---
    // Busca la clase específica del CSS nuevo (.category-container)
    if (document.querySelector('.category-container')) {
        // Esta función viene de category_detail.js
        if (window.initCategoryDetail) window.initCategoryDetail();
    }

    // --- D. CATÁLOGO GENERAL (obras.html) ---
    // Solo se ejecuta si estamos en obras.html y NO es una categoría específica
    if (path.includes('obras.html')) {
        // Si tienes un script específico para el catálogo general (ej: catalog.js)
        if (window.initGeneralCatalog) window.initGeneralCatalog();
        // O si reúsas lógica anterior, asegúrate de que no choque con las anteriores
    }

    // --- E. DETALLES (Obra y Artista) ---
    if (path.includes('obra-detalle.html') && window.initObraDetalle) window.initObraDetalle();
    if (path.includes('artista-detalle.html') && window.initArtistaDetalle) window.initArtistaDetalle();
    
    // --- F. LISTA DE ARTISTAS ---
    if (path.includes('artistas.html') && window.initArtistsList) window.initArtistsList();

    // --- G. PERFIL DE USUARIO ---
    if (path.includes('perfil.html') && window.initUserProfile) window.initUserProfile();
});