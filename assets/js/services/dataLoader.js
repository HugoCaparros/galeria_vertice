/**
 * DATA LOADER SERVICE
 * Ubicación: assets/js/services/dataLoader.js
 */

const DataLoader = {
    
    // 1. GESTIÓN DE RUTAS (CORREGIDO PARA TU ESTRUCTURA REAL)
    getBasePath: () => {
        const path = window.location.pathname;
        
        // Si estamos en una subpágina (ej: /pages/catalogo/obras.html)
        // La carpeta 'data' está dos niveles arriba (../../data/)
        if (path.includes('/pages/')) {
            return '../../data/';
        }
        
        // Si estamos en la raíz (index.html)
        // La carpeta 'data' está al lado (data/)
        return 'data/';
    },

    // 2. CARGADOR GENÉRICO
    async loadJSON(filename) {
        const basePath = this.getBasePath();
        const url = `${basePath}${filename}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`❌ Error cargando ${url}:`, error);
            return []; 
        }
    },

    // 3. GETTERS
    async getArtistas() { return await this.loadJSON('artistas.json'); },
    async getObras() { return await this.loadJSON('obras.json'); },
    async getUsuarios() { return await this.loadJSON('usuarios.json'); },
    async getNoticias() { return await this.loadJSON('noticias.json'); },
    async getColecciones() { return await this.loadJSON('colecciones.json'); },
    async getEventos() { return await this.loadJSON('eventos.json'); },
    async getComentarios() { return await this.loadJSON('comentarios.json'); },
    async getNotificaciones() { return await this.loadJSON('notificaciones.json'); },
    async getCategorias() { return await this.loadJSON('categorias.json'); },

    // 4. FUNCIONES RELACIONALES
    async getArtistaCompleto(id) {
        const artistaId = parseInt(id);
        const artistas = await this.getArtistas();
        const artista = artistas.find(a => a.id === artistaId);
        if (!artista) return null;

        const obras = await this.getObras();
        artista.lista_obras = obras.filter(o => o.artista_id === artistaId);

        const colecciones = await this.getColecciones();
        if (artista.colecciones_ids) {
            artista.lista_colecciones = colecciones.filter(c => artista.colecciones_ids.includes(c.id));
        }
        return artista;
    },

    async getObraCompleta(id) {
        const obraId = parseInt(id);
        const obras = await this.getObras();
        const obra = obras.find(o => o.id === obraId);
        if (!obra) return null;

        const artistas = await this.getArtistas();
        obra.artista_data = artistas.find(a => a.id === obra.artista_id);

        const comentarios = await this.getComentarios();
        obra.lista_comentarios = comentarios.filter(c => c.obra_id === obraId);

        return obra;
    },

    async getUsuarioActual() {
        const userId = 1; 
        const usuarios = await this.getUsuarios();
        return usuarios.find(u => u.id === userId);
    },

    async getObrasDestacadas() {
        const obras = await this.getObras();
        return obras.filter(o => o.badge === 'Viral' || o.badge === 'Trending' || o.badge === 'Nuevo').slice(0, 4);
    }
};

window.DataLoader = DataLoader;