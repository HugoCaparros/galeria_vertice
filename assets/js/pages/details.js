/* ==========================================================================
   DETAILS PAGE LOGIC
   Ubicación: assets/js/pages/details.js
   ========================================================================== */

// Utilidad local
function safeText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}

window.initObraDetalle = async function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const obra = await DataLoader.getObraCompleta(id);
    if (obra) {
        safeText('obra-titulo', obra.titulo);
        safeText('obra-artista', obra.artista_nombre);
        safeText('obra-descripcion', obra.descripcion);
        safeText('obra-tecnica', obra.tecnica);
        safeText('obra-dimensiones', obra.dimensiones);

        const imgEl = document.getElementById('obra-imagen-full');
        if (imgEl) imgEl.src = obra.imagen;

        const commentsContainer = document.getElementById('lista-comentarios');
        if (commentsContainer && obra.lista_comentarios) {
            commentsContainer.innerHTML = obra.lista_comentarios.map(c => `
                <div class="comentario">
                    <img src="${c.avatar}" class="user-avatar-small">
                    <div class="comentario-content"><strong>${c.handle}</strong><p>${c.texto}</p></div>
                </div>
            `).join('');
        }
    }
};

window.initArtistaDetalle = async function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const artista = await DataLoader.getArtistaCompleto(id);
    if (artista) {
        safeText('nombre-artista', artista.nombre);
        safeText('bio-artista', artista.bio);
        safeText('disciplina-artista', artista.disciplina);

        const img = document.getElementById('imagen-artista');
        if (img) img.src = artista.imagen;

        const banner = document.getElementById('banner-artista');
        if (banner) banner.src = artista.banner;

        const worksContainer = document.getElementById('obras-artista-grid');
        if (worksContainer && artista.lista_obras) {
            worksContainer.innerHTML = artista.lista_obras.map(o => `
                <div class="mini-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                    <img src="${o.imagen}">
                </div>
             `).join('');
        }
    }
};

window.initArtistsPage = async function () {
    const container = document.getElementById('artists-grid-container');
    if (!container) return;

    const artistas = await DataLoader.getArtistas();

    // Detectar si estamos en una subcarpeta para ajustar la ruta de las imágenes
    const isSubPage = window.location.pathname.includes('/pages/');
    const pathPrefix = isSubPage ? '../../' : '';

    container.innerHTML = artistas.map(a => {
        // Ajuste específico para Sofia (o cualquier lógica futura)
        const imgStyle = (a.nombre === "Sofia Klein") ? 'style="object-position: top;"' : '';

        // Corregir ruta de imagen
        const imagePath = `${pathPrefix}${a.imagen}`;

        return `
        <article class="artist-card" onclick="window.location.href='artista-detalle.html?id=${a.id}'">
            <div class="artist-image">
                <img src="${imagePath}" alt="${a.nombre}" loading="lazy" ${imgStyle}>
            </div>
            <div class="artist-info">
                <h3>${a.nombre}</h3>
                <p class="user-role-mini">${a.disciplina}</p>
            </div>
        </article>
        `;
    }).join('');
};