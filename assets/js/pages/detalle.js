/**
 * Abre la obra seleccionada en el popup del index
 */
window.openObraModal = async function(obraId) {
    const modal = document.getElementById('obra-modal');
    const content = document.getElementById('modal-body-content');
    
    if (!modal || !content) return;

    modal.classList.add('active');
    content.innerHTML = `<div class="loader-v">Abriendo Galería...</div>`;

    try {
        // Obtenemos la obra completa (datos cruzados con artista)
        const obra = await DataLoader.getObraCompleta(obraId);
        const root = DataLoader.getAssetPath();

        // Limpiamos la ruta de imagen para evitar errores de consola
        const cleanPath = obra.imagen.replace(/^(\.\/|\/|\.\.\/)+/, '');
        const finalImgUrl = root + cleanPath;

        // Inyectamos el contenido basado en tu referencia
        content.innerHTML = `
            <section class="obra-view modal-view">
                <div class="obra-media">
                    <img src="${finalImgUrl}" class="main-img" alt="${obra.titulo}">
                </div>
                <div class="obra-info-panel">
                    <header class="info-header">
                        <span class="categoria-label">${obra.categoria_id.toUpperCase()}</span>
                        <h1 class="obra-titulo">${obra.titulo}</h1>
                        <p class="obra-artista">Por: <strong>${obra.artista_data?.nombre || 'Artista Vértice'}</strong></p>
                    </header>
                    
                    <div class="tab-header">
                        <button class="tab-btn active" onclick="switchTab(event, 'desc')">DESCRIPCIÓN</button>
                        <button class="tab-btn" onclick="switchTab(event, 'tech')">FICHA TÉCNICA</button>
                    </div>

                    <div id="desc" class="tab-content" style="display:block">
                        <p class="obra-descripcion">${obra.descripcion}</p>
                    </div>
                    <div id="tech" class="tab-content" style="display:none">
                        <p><strong>Técnica:</strong> ${obra.tecnica}</p>
                        <p><strong>Año:</strong> ${obra.anio}</p>
                    </div>

                    <p class="obra-precio">${obra.precio.toLocaleString()} €</p>
                    <div class="obra-actions">
                        <button class="btn-primary">SOLICITAR ADQUISICIÓN</button>
                    </div>
                </div>
            </section>
        `;
    } catch (e) {
        console.error("Error cargando obra:", e);
    }
};

// Función para cambiar pestañas dentro del modal
window.switchTab = (e, tabId) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    e.target.classList.add('active');
};

// Cerrar modal
document.getElementById('close-obra-modal')?.addEventListener('click', () => {
    document.getElementById('obra-modal').classList.remove('active');
});