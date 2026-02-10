/* ==========================================================================
   HOME PAGE LOGIC
   Ubicación: assets/js/pages/home.js
   ========================================================================== */

window.initHomePage = async function() {
    // 1. GRID ALEATORIO
    const grid = document.getElementById('art-grid');
    if (grid) {
        const obras = await DataLoader.getObras();
        
        // Función interna para actualizar
        const updateGrid = (categoria) => {
            const slots = grid.querySelectorAll('.art-slot');
            const filtradas = obras.filter(o => o.categoria === categoria);
            const seleccion = filtradas.sort(() => 0.5 - Math.random()).slice(0, 5);
            
            slots.forEach((slot, index) => {
                if (seleccion[index]) {
                    slot.innerHTML = `<img src="${seleccion[index].imagen}" style="width:100%; height:100%; object-fit:cover; opacity:0; transition: opacity 0.5s;">`;
                    setTimeout(() => { 
                        const img = slot.querySelector('img');
                        if(img) img.style.opacity = 1; 
                    }, 50);
                } else slot.innerHTML = '';
            });
        };

        // Eventos
        document.querySelectorAll('.cat-trigger').forEach(link => {
            link.addEventListener('mouseenter', () => updateGrid(link.getAttribute('data-cat')));
        });
        
        // Carga inicial
        updateGrid('moderno');
    }

    // 2. SECCIÓN VIRAL
    const viralContainer = document.getElementById('viral-container');
    if (viralContainer) {
        const virales = await DataLoader.getObrasDestacadas();
        viralContainer.innerHTML = virales.map(obra => `
            <article class="art-card">
                <div class="card-image"><img src="${obra.imagen}"><span class="badge">${obra.badge}</span></div>
                <div class="card-info"><h3>${obra.titulo}</h3><p>${obra.artista_nombre}</p></div>
                <a href="pages/catalogo/obra-detalle.html?id=${obra.id}" class="card-link"></a>
            </article>
        `).join('');
    }
};