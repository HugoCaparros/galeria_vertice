/* ==========================================================================
    DETAILS PAGE LOGIC - VÉRTICE
    Ubicación: assets/js/pages/details.js
   ========================================================================== */

/**
 * Utilidad para inyectar texto de forma segura
 */
function safeText(elementId, text) { 
    const el = document.getElementById(elementId); 
    if (el) el.textContent = text; 
}

/**
 * Lanza una notificación flotante en la pantalla (Toast)
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-mensaje ${tipo}`;
    
    const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icono}"></i> ${mensaje}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * LÓGICA PARA LA PÁGINA DE DETALLE DE OBRA
 */
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
        safeText('obra-anio', obra.anio || 's/f');

        // 2. Narrativa y Contexto
        safeText('obra-descripcion-texto', obra.descripcion);
        safeText('obra-curaduria', obra.curaduria || "Esta obra es una pieza central de nuestra colección actual.");

        // 3. Ficha Técnica Enriquecida
        safeText('obra-soporte', obra.tecnica_detalle || obra.tecnica || 'No especificado');
        const dims = obra.dimensiones && obra.dimensiones.trim() !== "" ? obra.dimensiones : 'Dimensiones no disponibles';
        safeText('obra-dimensiones', dims);
        safeText('obra-id-ref', `VRT-${obra.id.toString().padStart(4, '0')}`);

        // 4. Manejo de la Imagen Principal
        const imgEl = document.getElementById('obra-imagen-principal');
        if (imgEl) {
            imgEl.style.transition = "opacity 0.8s ease";
            imgEl.style.opacity = "0"; 
            imgEl.src = base + obra.imagen;
            imgEl.onload = () => imgEl.style.opacity = "1";
        }

        // 5. Estadísticas de Interacción (Formato: 15.000)
        if (obra.stats) {
            const formatNum = (num) => new Intl.NumberFormat('es-ES').format(num);
            safeText('stat-vistas', formatNum(obra.stats.vistas));
            safeText('stat-likes', formatNum(obra.stats.likes));
            safeText('stat-guardados', formatNum(obra.stats.guardados));
        }

        // 6. LÓGICA DE COLECCIÓN (Sin iconos en el texto del botón)
        const btnColeccion = document.getElementById('btn-coleccion');
        if (btnColeccion) {
            let estaEnColeccion = false; 

            btnColeccion.onclick = () => {
                if (!estaEnColeccion) {
                    estaEnColeccion = true;
                    btnColeccion.textContent = 'ELIMINAR DE MI COLECCIÓN'; //
                    btnColeccion.classList.add('active');
                    mostrarNotificacion('Obra añadida a tu colección privada', 'success');
                } else {
                    estaEnColeccion = false;
                    btnColeccion.textContent = 'AÑADIR A MI COLECCIÓN PRIVADA'; //
                    btnColeccion.classList.remove('active');
                    mostrarNotificacion('Obra eliminada de tu colección', 'info');
                }
            };
        }

        // 7. Carga de Obras Relacionadas
        cargarRelacionadas(obra.categoria_id, id);
    }
};

/**
 * CARGA DE OBRAS RELACIONADAS
 */
async function cargarRelacionadas(categoriaId, actualId) {
    const container = document.getElementById('contenedor-relacionadas');
    if (!container) return;

    const todas = await DataLoader.getObras();
    const base = DataLoader.getBasePath();

    const filtradas = todas
        .filter(o => o.categoria_id === categoriaId && o.id != actualId)
        .slice(0, 4);

    if (filtradas.length > 0) {
        container.innerHTML = filtradas.map(o => `
            <article class="artist-card" onclick="window.location.href='obra-detalle.html?id=${o.id}'">
                <div class="artist-image">
                    <img src="${base}${o.imagen}" alt="${o.titulo}" style="filter: none;">
                </div>
                <div class="artist-info">
                    <h3>${o.titulo}</h3>
                    <p>${o.artista_data ? o.artista_data.nombre : 'Vértice Art'}</p>
                </div>
            </article>
        `).join(''); //
    } else {
        container.innerHTML = '<p class="text-muted">Explora más obras en nuestra colección principal.</p>';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('obra-titulo')) {
        window.initObraDetalle();
    }
});