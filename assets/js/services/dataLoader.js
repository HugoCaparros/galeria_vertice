/**
 * DATA LOADER SERVICE (Vértice Galería)
 * -------------------------------------
 * Centraliza la carga de JSONs y gestiona las relaciones entre datos.
 * Funciona como una base de datos relacional simple en el cliente.
 */

const DataLoader = {
    
    // 1. GESTIÓN INTELIGENTE DE RUTAS
    // Detecta automáticamente si estamos en la raíz o en una subcarpeta
    getBasePath: () => {
        const path = window.location.pathname;
        
        // Si estamos en GitHub Pages o un servidor con subcarperta, ajusta esto si es necesario.
        // Lógica para estructura local estándar:
        if (path.includes('/pages/catalogo/') || path.includes('/pages/usuario/') || path.includes('/pages/auth/')) {
            return '../../assets/data/';
        }
        if (path.includes('/pages/')) { // Para archivos directos en pages/
            return '../assets/data/';
        }
        // Si estamos en la raíz (index.html)
        return 'assets/data/';
    },

    // 2. CARGADOR GENÉRICO
    async loadJSON(filename) {
        const basePath = this.getBasePath();
        try {
            const response = await fetch(`${basePath}${filename}`);
            if (!response.ok) throw new Error(`No se pudo cargar ${filename} (Status: ${response.status})`);
            return await response.json();
        } catch (error) {
            console.error(`Error crítico cargando ${filename}:`, error);
            return []; // Retorna array vacío para evitar que la web se rompa
        }
    },

    // 3. GETTERS DE DATOS CRUDOS (Raw Data)
    async getArtistas() { return await this.loadJSON('artistas.json'); },
    async getObras() { return await this.loadJSON('obras.json'); },
    async getCategorias() { return await this.loadJSON('categorias.json'); },
    async getUsuarios() { return await this.loadJSON('usuarios.json'); },
    async getNoticias() { return await this.loadJSON('noticias.json'); },
    async getColecciones() { return await this.loadJSON('colecciones.json'); },
    async getEventos() { return await this.loadJSON('eventos.json'); },
    async getComentarios() { return await this.loadJSON('comentarios.json'); },
    async getNotificaciones() { return await this.loadJSON('notificaciones.json'); },

    // 4. FUNCIONES RELACIONALES (JOINs)
    // Estas funciones cruzan los datos para entregarte objetos completos

    /**
     * Obtiene un ARTISTA con todas sus Obras, Colecciones y Eventos vinculados.
     * Ideal para: artista-detalle.html
     */
    async getArtistaCompleto(id) {
        const artistaId = parseInt(id);
        const artistas = await this.getArtistas();
        const artista = artistas.find(a => a.id === artistaId);
        
        if (!artista) return null;

        // A. Cargar sus Obras
        const obras = await this.getObras();
        artista.lista_obras = obras.filter(o => o.artista_id === artistaId);

        // B. Cargar sus Colecciones (Las que ha creado)
        const colecciones = await this.getColecciones();
        artista.lista_colecciones = colecciones.filter(c => c.artista_id === artistaId);

        // C. Cargar sus Eventos (Ojo: artista_relacionado_id puede ser un número o un array)
        const eventos = await this.getEventos();
        artista.lista_eventos = eventos.filter(e => {
            if (Array.isArray(e.artista_relacionado_id)) {
                return e.artista_relacionado_id.includes(artistaId);
            }
            return e.artista_relacionado_id === artistaId;
        });

        return artista;
    },

    /**
     * Obtiene una OBRA con los datos del Artista y Comentarios.
     * Ideal para: obra-detalle.html
     */
    async getObraCompleta(id) {
        const obraId = parseInt(id);
        const obras = await this.getObras();
        const obra = obras.find(o => o.id === obraId);
        
        if (!obra) return null;

        // A. Incrustar datos del Artista (Nombre, Avatar, Handle)
        const artistas = await this.getArtistas();
        obra.artista_data = artistas.find(a => a.id === obra.artista_id);

        // B. Cargar Comentarios
        const comentarios = await this.getComentarios();
        obra.lista_comentarios = comentarios.filter(c => c.obra_id === obraId);

        return obra;
    },

    /**
     * Obtiene una COLECCIÓN con las Obras completas dentro.
     * Ideal para: coleccion-detalle.html
     */
    async getColeccionCompleta(id) {
        const colId = parseInt(id);
        const colecciones = await this.getColecciones();
        const coleccion = colecciones.find(c => c.id === colId);

        if (!coleccion) return null;

        // A. Rellenar los IDs de las obras con los objetos reales
        const todasObras = await this.getObras();
        // Filtramos las obras cuyo ID esté incluido en el array 'obras_ids' de la colección
        coleccion.obras_detalladas = todasObras.filter(o => coleccion.obras_ids.includes(o.id));

        // B. Datos del creador (Artista o Usuario)
        // Nota: Ya vienen en el JSON (artista_nombre, etc), pero si quisieras más datos podrías buscarlos aquí.

        return coleccion;
    },

    /**
     * SIMULACIÓN DE LOGIN
     * Carga al usuario ID 1 ("Alex M.") con sus notificaciones y listas guardadas.
     * Ideal para: usuario/perfil.html y la Navbar
     */
    async getUsuarioActual() {
        const userId = 1; // ID fijo para la demo
        
        const usuarios = await this.getUsuarios();
        const usuario = usuarios.find(u => u.id === userId);
        
        if (!usuario) return null;

        // A. Cargar detalles de las colecciones que sigue (Guardadas)
        const colecciones = await this.getColecciones();
        if (usuario.colecciones_guardadas && usuario.colecciones_guardadas.length > 0) {
            usuario.mis_colecciones_guardadas = colecciones.filter(c => usuario.colecciones_guardadas.includes(c.id));
        } else {
            usuario.mis_colecciones_guardadas = [];
        }

        // B. Cargar Obras que le gustan (Likes)
        const obras = await this.getObras();
        if (usuario.obras_megusta) {
            usuario.mis_likes = obras.filter(o => usuario.obras_megusta.includes(o.id));
        }

        // C. Cargar sus Notificaciones
        const notificaciones = await this.getNotificaciones();
        // Filtramos las que son para este usuario y las ordenamos por fecha (simulada, o orden de array)
        usuario.mis_notificaciones = notificaciones.filter(n => n.usuario_destino_id === userId);

        return usuario;
    },

    /**
     * FILTROS RÁPIDOS
     */
    async getObrasDestacadas() {
        const obras = await this.getObras();
        return obras.filter(o => o.badge === 'Viral' || o.badge === 'Trending' || o.badge === 'Obra Maestra');
    },

    async getObrasRecientes() {
        const obras = await this.getObras();
        // Ordenar por fecha (asumiendo formato YYYY-MM-DD string)
        return obras.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)).slice(0, 6);
    }
};

// Hacerlo disponible globalmente
window.DataLoader = DataLoader;