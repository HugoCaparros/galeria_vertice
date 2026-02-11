/* ==========================================================================
   CATEGORY PAGE LOGIC (CORREGIDO Y BLINDADO)
   Ubicación: assets/js/pages/category.js
   ========================================================================== */

let currentData = [];

/**
 * Función Principal de Inicialización
 * @param {string} categoryFilter - Debe coincidir con 'categoria' en el JSON (ej: 'moderno')
 */
window.initCatalogPage = async function(categoryFilter) {
    
    // 1. BLOQUEO DE SEGURIDAD:
    // Si main.js llama a esta función sin filtro, la ignoramos silenciosamente
    // para que no borre el grid ni lance errores.
    if (!categoryFilter) {
        return; 
    }

    const gridContainer = document.getElementById('category-grid-container');
    const targetContainer = gridContainer || document.querySelector('.art-grid-5-col');

    // Inicializar botones de filtro visual
    initFilters(targetContainer); 

    if (!targetContainer) return;

    try {
        console.log(`🚀 Cargando colección exclusiva: "${categoryFilter}"`);

        // 2. VERIFICACIÓN DE DATALOADER
        if (typeof DataLoader === 'undefined' || !DataLoader.getObras) {
            console.error("DataLoader no está cargado.");
            return;
        }
        
        // 3. OBTENER OBRAS
        const todasLasObras = await DataLoader.getObras();
        
        // 4. FILTRADO ESTRICTO (Basado en tu JSON)
        // Normalizamos para evitar errores de mayúsculas
        const target = categoryFilter.toLowerCase().trim();

        const obrasFiltradas = todasLasObras.filter(obra => {
            // Tu JSON tiene la propiedad "categoria": "moderno", "clasico", etc.
            const catObra = (obra.categoria || '').toLowerCase();
            return catObra === target;
        });

        currentData = obrasFiltradas;
        console.log(`✅ Se encontraron ${currentData.length} obras para la categoría "${target}"`);

        // 5. ACTUALIZAR UI
        const countEl = document.getElementById('obraCount');
        if (countEl) countEl.textContent = `${currentData.length} OBRAS EN COLECCIÓN`;

        // 6. RENDERIZAR
        renderGrid(targetContainer, currentData);

    } catch (error) {
        console.error("🔥 Error cargando catálogo:", error);
    }
};

/**
 * Renderiza las tarjetas
 */
function renderGrid(container, items) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:50px; color:#888;">No hay obras disponibles en esta categoría.</div>';
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'cat-card cat-card-animated'; 
        card.style.animationDelay = `${index * 0.05}s`;

        // --- CORRECCIÓN DE RUTAS DE IMAGEN PARA TU JSON ---
        // Tu JSON dice: "assets/img/obras/clasico-1.webp"
        // Nosotros estamos en: "pages/catalogo/"
        // Necesitamos subir dos niveles: "../../" + ruta del JSON
        
        let rutaImg = item.imagen; 
        
        // Si la ruta no empieza con http y no tiene ya el ../../ se lo ponemos
        if (!rutaImg.startsWith('http') && !rutaImg.startsWith('../../')) {
             rutaImg = '../../' + rutaImg;
        }

        card.innerHTML = `
            <a href="obra-detalle.html?id=${item.id}" style="text-decoration:none; color:inherit; display:block; height:100%;">
                <div class="cat-card-img-wrapper">
                    <img src="${rutaImg}" alt="${item.titulo}" class="cat-card-img" loading="lazy">
                    ${item.badge ? `<span class="cat-card-badge">${item.badge}</span>` : ''}
                    <button class="card-like-btn" onclick="event.preventDefault(); this.classList.toggle('liked');">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>
                <div class="cat-card-info">
                    <h3 class="cat-card-title">${item.titulo}</h3>
                    <p class="cat-card-artist">${item.artista_nombre || item.artista}</p>
                    <div class="info-secondary">
                        <span class="info-price">${item.precio ? item.precio.toLocaleString('es-ES') + '€' : 'Consultar'}</span>
                    </div>
                </div>
            </a>
        `;
        container.appendChild(card);
    });
}

/**
 * Filtros (Cápsulas)
 */
function initFilters(container) {
    const buttons = document.querySelectorAll('.filter-pill');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applySorting(btn.getAttribute('data-sort'), container);
        });
    });
}

/**
 * Ordenación
 */
/**
 * Lógica de Ordenación (Actualizada con Populares y Antiguos)
 */
function applySorting(criteria, container) {
    if (!currentData.length) return;
    let sorted = [...currentData];

    switch (criteria) {
        case 'precio-asc': 
            sorted.sort((a, b) => (a.precio||0) - (b.precio||0)); 
            break;
        case 'precio-desc': 
            sorted.sort((a, b) => (b.precio||0) - (a.precio||0)); 
            break;
        case 'anio-desc': 
            // Más recientes primero
            sorted.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)); 
            break;
        case 'anio-asc': 
            // Más antiguos primero (NUEVO)
            sorted.sort((a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion)); 
            break;
        case 'likes-desc':
            // Más likes primero (Populares - NUEVO)
            // Asume que tu JSON tiene: "stats": { "likes": 120 }
            sorted.sort((a, b) => {
                const likesA = a.stats && a.stats.likes ? a.stats.likes : 0;
                const likesB = b.stats && b.stats.likes ? b.stats.likes : 0;
                return likesB - likesA;
            });
            break;
        default: 
            // Relevancia (ID original)
            sorted.sort((a, b) => a.id - b.id); 
            break;
    }
    renderGrid(container, sorted);
}