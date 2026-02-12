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

    // Validación preventiva: Si no existe el grid, no hacemos nada
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
         * @param {string} categoria - La categoría a filtrar.
         */
        const renderCategory = (categoria) => {
            const slots = gridContainer.querySelectorAll('.art-slot');
            
            // --- NUEVO: Obtener la raíz de assets desde el Master Engine ---
            const assetRoot = DataLoader.getAssetPath();

            // Normalización de texto para comparaciones
            const normalize = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const targetCat = normalize(categoria);

            // Filtrado de obras (Mantiene tu lógica de categorías/estilo)
            const filteredObras = categoria 
                ? obras.filter(o => normalize(o.categoria_id) === targetCat || normalize(o.estilo) === targetCat)
                : obras;

            // Selección aleatoria de 5 obras
            const randomSelection = filteredObras.sort(() => 0.5 - Math.random()).slice(0, 5);

            // Inyección en el DOM
            slots.forEach((slot, index) => {
                const obra = randomSelection[index];

                slot.innerHTML = '';
                slot.style.backgroundColor = '#f4f4f4'; 

                if (obra) {
                    // --- CORRECCIÓN DE RUTA INTEGRADA PARA EVITAR ERROR ---
                    // Limpiamos cualquier prefijo relativo previo para evitar duplicidad de puntos
                    let cleanPath = obra.imagen.replace(/^(\.\/|\/|\.\.\/)+/, '');
                    
                    // Concatenamos el prefijo inteligente (./ o ../../)
                    let imagePath = assetRoot + cleanPath;

                    // Construcción del enlace
                    const link = document.createElement('a');
                    
                    // MODIFICACIÓN PARA POPUP:
                    // En lugar de navegar a una página nueva, abrimos el modal
                    link.href = "#"; 
                    link.onclick = (e) => {
                        e.preventDefault();
                        // Llamamos a la función global definida en detalle.js
                        if (typeof window.openObraModal === 'function') {
                            window.openObraModal(obra.id);
                        }
                    };

                    link.className = 'art-grid-link';
                    link.style.display = 'block';
                    link.style.width = '100%';
                    link.style.height = '100%';

                    // Construcción de la imagen
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.alt = obra.titulo;
                    
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.opacity = '0'; 
                    img.style.transition = 'opacity 0.6s ease';

                    // Eventos de carga de imagen
                    img.onload = () => { img.style.opacity = '1'; };
                    img.onerror = () => { 
                        // Muestra el error de ruta si el archivo no existe
                        console.error("No se pudo cargar la imagen en:", imagePath);
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
   ========================================================================== */
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initHomePage);
    } else {
        window.initHomePage();
    }
})();