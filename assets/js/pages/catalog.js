/* ==========================================================================
   CATALOG & CATEGORY LOGIC
   Ubicación: assets/js/pages/catalog.js
   ========================================================================== */

let currentCategoryObras = [];

// A. PÁGINA DE CATEGORÍA ESPECÍFICA (Moderno, etc.)
window.initCategoryPage = async function(categoriaFiltro) {
    const grid = document.getElementById('category-grid');
    const sortSelect = document.getElementById('sortSelect');
    const countLabel = document.getElementById('obras-count');

    if (!grid) return;

    try {
        const obras = await DataLoader.getObras();
        currentCategoryObras = obras.filter(o => o.categoria.toLowerCase() === categoriaFiltro.toLowerCase());

        if (countLabel) countLabel.textContent = `${currentCategoryObras.length} OBRAS DISPONIBLES`;

        if (currentCategoryObras.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay obras en esta categoría.</p>';
            return;
        }

        renderGrid(currentCategoryObras, grid);

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                sortAndRender(e.target.value, grid);
            });
        }
    } catch (error) { console.error("Error cargando categoría:", error); }
};

// B. CATÁLOGO GENERAL (obras.html)
window.initCatalogPage = async function() {
    const container = document.getElementById('collection-grid-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (!container) return;
    let todasLasObras = await DataLoader.getObras();
    
    const applyFilters = () => {
        let resultados = [...todasLasObras];
        const texto = searchInput ? searchInput.value.toLowerCase() : '';
        const orden = sortSelect ? sortSelect.value : 'default';

        if (texto) resultados = resultados.filter(o => o.titulo.toLowerCase().includes(texto) || o.artista_nombre.toLowerCase().includes(texto));
        
        // Reutilizamos la lógica de ordenación
        resultados = sortObras(resultados, orden);
        renderGrid(resultados, container);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    renderGrid(todasLasObras, container);
};

/* --- UTILIDADES DE CATÁLOGO --- */

function sortObras(obras, criterio) {
    switch (criterio) {
        case 'precio-asc': return obras.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        case 'precio-desc': return obras.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        case 'anio-desc': return obras.sort((a, b) => (b.anio || 0) - (a.anio || 0));
        case 'anio-asc': return obras.sort((a, b) => (a.anio || 0) - (b.anio || 0));
        case 'recent': return obras.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        case 'popular': return obras.sort((a, b) => b.stats.likes - a.stats.likes);
        default: return obras.sort((a, b) => a.id - b.id);
    }
}

function sortAndRender(criterio, gridContainer) {
    const obrasOrdenadas = sortObras([...currentCategoryObras], criterio);
    renderGrid(obrasOrdenadas, gridContainer);
}

function renderGrid(obras, container) {
    container.innerHTML = '';
    const html = obras.map((obra, index) => {
        const delay = index * 100; 
        return `
            <div class="cat-card-wrapper" style="position: relative;">
                <a href="obra-detalle.html?id=${obra.id}" class="cat-card cat-card-animated" style="animation-delay: ${delay}ms">
                    <div class="cat-card-img-wrapper">
                        <img src="${obra.imagen}" alt="${obra.titulo}" class="cat-card-img" loading="lazy">
                        ${obra.badge ? `<span class="cat-card-badge">${obra.badge}</span>` : ''}
                        <button class="card-like-btn" onclick="toggleLike(event, '${obra.id}')">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                    <div class="cat-card-info">
                        <div class="info-primary">
                            <span class="cat-card-title">${obra.titulo}</span>
                            <span class="cat-card-artist">${obra.artista_nombre}</span>
                        </div>
                        <div class="info-secondary">
                            <span class="info-meta">${obra.tecnica || 'Técnica Mixta'}</span>
                            <span class="info-separator">•</span>
                            <span class="info-meta">${obra.anio || '2024'}</span>
                        </div>
                        <div class="info-tertiary">
                             <span class="info-price">${obra.precio ? formatPrice(obra.precio) : 'Consultar'}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

// Global para que se pueda llamar desde el HTML (onclick)
window.toggleLike = function(event, id) {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const icon = btn.querySelector('i');
    btn.classList.toggle('liked');
    
    if (btn.classList.contains('liked')) {
        icon.classList.remove('fa-regular'); icon.classList.add('fa-solid');
        console.log(`❤️ Like: ${id}`);
    } else {
        icon.classList.remove('fa-solid'); icon.classList.add('fa-regular');
        console.log(`💔 Dislike: ${id}`);
    }
};