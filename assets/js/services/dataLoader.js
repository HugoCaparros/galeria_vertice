/**
 * DATA LOADER SERVICE (VÉRTICE MASTER ENGINE)
 * Ubicación: assets/js/services/dataLoader.js
 */

const DataLoader = {
    
    // 1. GESTIÓN DE RUTAS
    getBasePath: () => {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../../data/';
        }
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

    // 3. GETTERS BÁSICOS
    async getArtistas() { return await this.loadJSON('artistas.json'); },
    async getObras() { return await this.loadJSON('obras.json'); },
    async getUsuarios() { return await this.loadJSON('usuarios.json'); },
    async getNoticias() { return await this.loadJSON('noticias.json'); },
    async getColecciones() { return await this.loadJSON('colecciones.json'); },
    async getEventos() { return await this.loadJSON('eventos.json'); },
    async getComentarios() { return await this.loadJSON('comentarios.json'); },
    async getNotificaciones() { return await this.loadJSON('notificaciones.json'); },
    async getCategorias() { return await this.loadJSON('categorias.json'); },

    // 4. FUNCIONES RELACIONALES (INTERCONEXIÓN TOTAL)

    // Obtener una obra con TODO su contexto: Artista, Categoría y Comentarios
    async getObraCompleta(id) {
        const obraId = parseInt(id);
        const [obras, artistas, categorias, comentarios] = await Promise.all([
            this.getObras(),
            this.getArtistas(),
            this.getCategorias(),
            this.getComentarios()
        ]);

        const obra = obras.find(o => o.id === obraId);
        if (!obra) return null;

        // Unir con Artista
        obra.artista_data = artistas.find(a => a.id === obra.artista_id);
        
        // Unir con Categoría (Metadatos editoriales)
        obra.categoria_data = categorias.find(c => c.id === obra.categoria_id);

        // Unir con Comentarios
        obra.lista_comentarios = comentarios.filter(c => c.obra_id === obraId);

        return obra;
    },

    // Obtener todas las obras de una categoría con datos de artista incluidos
    async getObrasPorCategoria(slug) {
        const [obras, artistas, categorias] = await Promise.all([
            this.getObras(),
            this.getArtistas(),
            this.getCategorias()
        ]);

        const categoria = categorias.find(c => c.slug === slug);
        if (!categoria) return { info: null, obras: [] };

        const filtradas = obras.filter(o => o.categoria_id === categoria.id).map(obra => {
            return {
                ...obra,
                artista_data: artistas.find(a => a.id === obra.artista_id)
            };
        });

        return {
            info: categoria,
            obras: filtradas
        };
    },

    async getArtistaCompleto(id) {
        const artistaId = parseInt(id);
        const [artistas, obras, colecciones] = await Promise.all([
            this.getArtistas(),
            this.getObras(),
            this.getColecciones()
        ]);

        const artista = artistas.find(a => a.id === artistaId);
        if (!artista) return null;

        artista.lista_obras = obras.filter(o => o.artista_id === artistaId);

        if (artista.colecciones_ids) {
            artista.lista_colecciones = colecciones.filter(c => artista.colecciones_ids.includes(c.id));
        }
        return artista;
    },

    async getUsuarioActual() {
        const uLogueado = localStorage.getItem('usuario_logueado');
        if (uLogueado) return JSON.parse(uLogueado);
        
        const usuarios = await this.getUsuarios();
        return usuarios[0]; // Fallback al primer usuario si no hay login
    }
};

window.DataLoader = DataLoader;