// js/services/dataLoader.js

/**
 * Función global para cargar las obras desde el JSON.
 * Retorna una Promesa con los datos.
 */
async function cargarObras() {
    try {
        // Asegúrate de que esta ruta sea correcta desde donde se ejecuta el HTML
        const response = await fetch('assets/data/obras.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const datos = await response.json();
        return datos;
        
    } catch (error) {
        console.error("Error en dataLoader:", error);
        return []; // Retorna array vacío para no romper la web
    }
}