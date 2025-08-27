import axios from "axios";

// Configuración de variables de entorno

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.REACT_APP_API_TIMEOUT || '10000', 10);

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para manejo de errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Servicios para PERSONAS
export const personasService = {
    // Obtener todas las personas
    getAll: async () => {
        try {
            const response = await api.get("/persona");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar personas: ${error.response?.data?.message || error.message}`);
        }
    },

    // Obtener persona por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/persona/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar persona con ID ${id}: ${error.response?.data?.message || error.message}`);
        }
    },

    // Crear nueva persona
    create: async (personaData) => {
        try {
            const response = await api.post("/persona", personaData);
            return response.data;
        } catch (error) {
            throw new Error(`Error al crear persona: ${error.response?.data?.message || error.message}`);
        }
    },

    // Actualizar persona
    update: async (id, personaData) => {
        try {
            const response = await api.put(`/persona/${id}`, personaData);
            return response.data;
        } catch (error) {
            throw new Error(`Error al actualizar persona: ${error.response?.data?.message || error.message}`);
        }
    },

    // Eliminar persona
    delete: async (id) => {
        try {
            const response = await api.delete(`/persona/${id}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                throw new Error('No se puede eliminar la persona porque tiene dependencias asociadas');
            } else if (error.response?.status === 404) {
                throw new Error('La persona no fue encontrada');
            }
            throw new Error(`Error al eliminar persona: ${error.response?.data?.message || error.message}`);
        }
    }
};

// Servicios para RELACIONES PERSONAS-TÍTULOS
export const personasTitulosService = {
    // Obtener todas las relaciones personas-títulos (usando mapper)
    getUsuariosTitulos: async () => {
        try {
            const response = await api.get("/usuario/titulos");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar usuarios títulos: ${error.response?.data?.message || error.message}`);
        }
    },

    // Obtener títulos académicos
    getTitulos: async () => {
        try {
            const response = await api.get("/titulosFormacionAcademica");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar títulos: ${error.response?.data?.message || error.message}`);
        }
    },

    // Agregar título a persona
    addTituloToPersona: async (personaId, tituloId) => {
        try {
            const response = await api.post(`/usuario/${personaId}/titulo/${tituloId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al agregar título a persona: ${error.response?.data?.message || error.message}`);
        }
    },

    // Eliminar relación persona-título
    removeTituloFromPersona: async (personaId, tituloId) => {
        try {
            const response = await api.delete(`/usuarios/${personaId}/titulos/${tituloId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al eliminar relación persona-título: ${error.response?.data?.message || error.message}`);
        }
    }
};

// Servicios para RELACIONES PERSONAS-ROLES
export const personasRolesService = {
    // Obtener todas las relaciones personas-roles (usando mapper)
    getUsuariosRoles: async () => {
        try {
            const response = await api.get("/usuario/roles");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar usuarios roles: ${error.response?.data?.message || error.message}`);
        }
    },

    // Obtener roles
    getRoles: async () => {
        try {
            const response = await api.get("/roles");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar roles: ${error.response?.data?.message || error.message}`);
        }
    },

    // Agregar rol a persona
    addRolToPersona: async (personaId, rolId) => {
        try {
            const response = await api.post(`/usuario/${personaId}/rol/${rolId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al agregar rol a persona: ${error.response?.data?.message || error.message}`);
        }
    },

    // Eliminar relación persona-rol
    removeRolFromPersona: async (personaId, rolId) => {
        try {
            const response = await api.delete(`/usuarios/${personaId}/rol/${rolId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al eliminar relación persona-rol: ${error.response?.data?.message || error.message}`);
        }
    }
};

// Servicios para RELACIONES PERSONAS-EQUIPOS
export const personasEquiposService = {
    // Obtener todas las relaciones personas-equipos (usando mapper)
    getUsuariosEquipos: async () => {
        try {
            const response = await api.get("/usuario/equipos");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar usuarios equipos: ${error.response?.data?.message || error.message}`);
        }
    },

    // Obtener equipos
    getEquipos: async () => {
        try {
            const response = await api.get("/equipo");
            return response.data;
        } catch (error) {
            throw new Error(`Error al cargar equipos: ${error.response?.data?.message || error.message}`);
        }
    },

    // Agregar equipo a persona
    addEquipoToPersona: async (personaId, equipoId) => {
        try {
            const response = await api.post(`/usuario/${personaId}/equipo/${equipoId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al agregar equipo a persona: ${error.response?.data?.message || error.message}`);
        }
    },

    // Eliminar relación persona-equipo
    removeEquipoFromPersona: async (personaId, equipoId) => {
        try {
            const response = await api.delete(`/usuarios/${personaId}/equipo/${equipoId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error al eliminar relación persona-equipo: ${error.response?.data?.message || error.message}`);
        }
    }
};

// Exportar todo
export const apiPersonasService = {
    personas: personasService,
    personasTitulos: personasTitulosService,
    personasRoles: personasRolesService,
    personasEquipos: personasEquiposService
};

export default apiPersonasService;
