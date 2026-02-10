/* ==========================================================================
   HOME PAGE CONTROLLER
   Gestiona el grid interactivo y la carga dinámica de obras en el inicio.
   Ubicación: assets/js/pages/home.js
   ========================================================================== */

/**
 * Inicializa la lógica de la página de inicio.
 * Se encarga de obtener los datos y configurar los eventos del grid.
 */
window.initHomePage = async function() {
    const gridContainer = document.getElementById('art-grid');

    // Validación preventiva: Si no existe el grid, no hacemos nada (evita errores en otras páginas)
    if (!gridContainer) return;

    // Validación de dependencia: DataLoader
    if (typeof DataLoader === 'undefined') {
        console.error("Error: DataLoader no está definido. Verifique la carga de scripts.");
        return;
    }

    try {
        // 1. Obtener datos de obras
        const obras = await DataLoader.getObras();

        /**
         * Renderiza las obras en el grid según la categoría seleccionada.
         * @param {string} categoria - La categoría a filtrar (ej: 'moderno').
         */
        const renderCategory = (categoria) => {
            const slots = gridContainer.querySelectorAll('.art-slot');
            
            // Normalización de texto para comparaciones (ignora acentos y mayúsculas)
            const normalize = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const targetCat = normalize(categoria);

            // Filtrado de obras
            const filteredObras = categoria 
                ? obras.filter(o => normalize(o.categoria) === targetCat || normalize(o.estilo) === targetCat)
                : obras;

            // Selección aleatoria de 5 obras (Fisher-Yates simplificado)
            const randomSelection = filteredObras.sort(() => 0.5 - Math.random()).slice(0, 5);

            // Inyección en el DOM
            slots.forEach((slot, index) => {
                const obra = randomSelection[index];

                // Limpiar estado anterior del slot
                slot.innerHTML = '';
                slot.style.backgroundColor = '#f4f4f4'; // Fondo placeholder por defecto

                if (obra) {
                    // Procesamiento de ruta de imagen (Sanitización)
                    let imagePath = obra.imagen.replace(/(\.\.\/)+/g, ''); // Elimina retrocesos de ruta
                    
                    // Asegurar prefijo 'assets/' si es ruta local relativa
                    if (!imagePath.startsWith('assets') && !imagePath.startsWith('http')) {
                        imagePath = 'assets/' + imagePath;
                    }

                    // Construcción del enlace
                    const link = document.createElement('a');
                    link.href = `pages/catalogo/obra-detalle.html?id=${obra.id}`;
                    link.className = 'art-grid-link';
                    link.style.display = 'block';
                    link.style.width = '100%';
                    link.style.height = '100%';

                    // Construcción de la imagen
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.alt = obra.titulo;
                    
                    // Estilos inline críticos para la animación (el resto debería ir en CSS)
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.opacity = '0'; 
                    img.style.transition = 'opacity 0.6s ease';

                    // Eventos de carga de imagen
                    img.onload = () => { img.style.opacity = '1'; };
                    img.onerror = () => { 
                        // Fallback visual silencioso si falla la imagen
                        slot.style.backgroundColor = '#e0e0e0'; 
                    };

                    link.appendChild(img);
                    slot.appendChild(link);
                }
            });
        };

        // 2. Configurar Eventos de Hover (Interacción)
        const triggers = document.querySelectorAll('.cat-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const category = trigger.getAttribute('data-cat');
                renderCategory(category);
            });
        });

        // 3. Carga Inicial (Estado por defecto)
        renderCategory('moderno');

    } catch (error) {
        console.error("Error inicializando Home Page:", error);
    }
};

/* ==========================================================================
   AUTO-INICIALIZACIÓN
   Asegura que el script se ejecute independientemente del orden de carga.
   ========================================================================== */
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initHomePage);
    } else {
        window.initHomePage();
    }
})();