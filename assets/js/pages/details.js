/* ==========================================================================
    DETAILS PAGE LOGIC - VÉRTICE
    Ubicación: assets/js/pages/details.js
   ========================================================================== */

// Utilidad local
function safeText(elementId, text) { 
    const el = document.getElementById(elementId); 
    if (el) el.textContent = text; 
}

window.initObraDetalle = async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    if (typeof DataLoader === 'undefined') {
        console.error("DataLoader no definido. Revisa el orden de los scripts en el HTML.");
        return;
    }

    const obra = await DataLoader.getObraCompleta(id);
    
    if (obra) {
        const base = DataLoader.getBasePath();
        const nombreArtista = obra.artista_data ? obra.artista_data.nombre : "Artista Vértice";
        
        // 1. Información Principal e Identidad
        safeText('obra-titulo', obra.titulo);
        safeText('nombre-artista', nombreArtista); 
        safeText('obra-tecnica', obra.tecnica);
        safeText('obra-dimensiones', obra.dimensiones);
        
        const imgEl = document.getElementById('obra-imagen-full');
        if (imgEl) imgEl.src = obra.imagen;
        
        const commentsContainer = document.getElementById('lista-comentarios');
        if (commentsContainer && obra.lista_comentarios) {
            commentsContainer.innerHTML = obra.lista_comentarios.map(c => `
                <div class="comentario">
                    <img src="${base}${c.avatar}" class="user-avatar-small" alt="${c.handle}">
                    <div class="comentario-content">
                        <strong>${c.handle}</strong>
                        <p>${c.texto}</p>
                    </div>
                </div>
            `).join('');
        }
    }
};

window.initArtistaDetalle = async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const artista = await DataLoader.getArtistaCompleto(id);
    if (artista) {
         safeText('nombre-artista', artista.nombre);
         safeText('bio-artista', artista.bio);
         safeText('disciplina-artista', artista.disciplina);
         
         const img = document.getElementById('imagen-artista');
         if(img) img.src = artista.imagen;
         
         const banner = document.getElementById('banner-artista');
         if(banner) banner.src = artista.banner;
         
         const worksContainer = document.getElementById('obras-artista-grid');
         if(worksContainer && artista.lista_obras) {
             worksContainer.innerHTML = artista.lista_obras.map(o => `
                <div class="mini-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                    <img src="${base}${o.imagen}" alt="${o.titulo}">
                </div>
             `).join('');
         }
    }
};

window.initArtistsList = async function() {
    const container = document.getElementById('artists-grid-container');
    if (!container) return;
    const artistas = await DataLoader.getArtistas();
    container.innerHTML = artistas.map(a => `
        <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'">
            <div class="artist-image"><img src="${a.imagen}" alt="${a.nombre}"></div>
            <div class="artist-info"><h3>${a.nombre}</h3><p>${a.disciplina}</p></div>
        </article>
        `;
    }).join('');
};

/**
 * ENRUTADOR DE INICIALIZACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('obra-titulo')) {
        window.initObraDetalle();
    }
    
    if (document.getElementById('nombre-artista') && !document.getElementById('obra-titulo')) {
        window.initArtistaDetalle();
    }
    
    if (document.getElementById('artists-grid-container')) {
        window.initArtistsList();
    }
});