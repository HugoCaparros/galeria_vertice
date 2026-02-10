/* ==========================================================================
   CATEGORY PAGE LOGIC
   Ubicación: assets/js/pages/category.js
   ========================================================================== */

window.initCatalogPage = async function() {
    const gridContainer = document.getElementById('category-grid-container');
    if (!gridContainer) return;

    try {
        // 1. Obtener datos (Usando tu DataLoader)
        // Asegúrate de que 'categorias' coincida con tu archivo categorias.json en assets/data/
        const categorias = await DataLoader.getData('categorias'); 
        
        // 2. Limpiar loader
        gridContainer.innerHTML = '';

        // 3. Renderizar Tarjetas
        categorias.forEach(cat => {
            const card = document.createElement('article');
            card.className = 'cat-card';
            
            // Generar HTML de las subcategorías (Badges)
            // Si tu JSON tiene un array 'subcategorias', lo mapeamos.
            const subHtml = cat.subcategorias 
                ? cat.subcategorias.map(sub => `<span class="sub-badge">${sub}</span>`).join('') 
                : '';

            // Imagen por defecto si no hay una específica
            const imgUrl = cat.imagen || '../../assets/img/default-art.jpg';

            card.innerHTML = `
                <div class="cat-image-wrapper">
                    <img src="${imgUrl}" alt="${cat.nombre}" loading="lazy">
                    <div class="cat-overlay">
                        <a href="obras.html?categoria=${cat.id}" class="btn-explore">VER OBRAS</a>
                    </div>
                </div>
                <div class="cat-content">
                    <h2 class="cat-title">${cat.nombre}</h2>
                    <p class="cat-desc">${cat.descripcion || 'Explora esta colección exclusiva.'}</p>
                    
                    <div class="cat-sub-list">
                        ${subHtml}
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando categorías:", error);
        gridContainer.innerHTML = '<p class="error-msg">No se pudieron cargar las categorías.</p>';
    }
};