import axios from 'axios';

// Configuración de variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

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
        console.error('Error en la petición:', error);

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    throw new Error('Recurso no encontrado');
                case 409:
                    throw new Error('No se puede eliminar el registro porque tiene dependencias asociadas');
                case 400:
                    throw new Error(error.response.data?.message || 'Datos inválidos');
                case 500:
                    throw new Error('Error interno del servidor');
                default:
                    throw new Error(error.response.data?.message || 'Error en la operación');
            }
        } else if (error.request) {
            throw new Error('No se pudo conectar con el servidor');
        } else {
            throw new Error('Error en la configuración de la petición');
        }
    }
);

// Servicio para Subsecciones
export const subseccionesService = {
    // Obtener todas las subsecciones
    getAll: async () => {
        try {
            const response = await api.get('/subseccionesServicio');
            console.log('Subsecciones obtenidas:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.subsecciones)) {
                return response.data.subsecciones;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener subsecciones:', error);
            throw error;
        }
    },

    // Obtener una subsección por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/subseccionesServicio/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener subsección ${id}:`, error);
            throw error;
        }
    },

    // Crear una nueva subsección
    create: async (subseccionData) => {
        try {
            console.log('Creando subsección:', subseccionData);
            const response = await api.post('/subseccionesServicio', subseccionData);
            console.log('Subsección creada:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear subsección:', error);
            throw error;
        }
    },

    // Actualizar una subsección existente
    update: async (id, subseccionData) => {
        try {
            console.log(`Actualizando subsección ${id}:`, subseccionData);
            const response = await api.put(`/subseccionesServicio/${id}`, subseccionData);
            console.log('Subsección actualizada:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar subsección ${id}:`, error);
            throw error;
        }
    },

    // Eliminar una subsección
    delete: async (id) => {
        try {
            console.log(`Eliminando subsección ${id}`);
            const response = await api.delete(`/subseccionesServicio/${id}`);
            console.log('Subsección eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar subsección ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Secciones (para el formulario)
export const seccionesService = {
    // Obtener todas las secciones
    getAll: async () => {
        try {
            const response = await api.get('/seccionesServicio');
            console.log('Secciones obtenidas:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.secciones)) {
                return response.data.secciones;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener secciones:', error);
            // En caso de error, retorna array vacío
            return [];
        }
    },

    // Obtener secciones activas
    getActivas: async () => {
        try {
            const response = await api.get('/seccionesServicio/activas');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener secciones activas:', error);
            return [];
        }
    }
};

// Utilidades para validación
export const subseccionesValidation = {
    // Validar datos de la subsección antes de enviar
    validateSubseccionData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre de la subsección es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 2) {
            errors.push('El nombre de la subsección debe tener al menos 2 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 100) {
            errors.push('El nombre de la subsección no puede exceder 100 caracteres');
        }

        if (data.idSeccionServicio && isNaN(parseInt(data.idSeccionServicio))) {
            errors.push('El ID de la sección debe ser un número válido');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos de la subsección
    cleanSubseccionData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            idSeccionServicio: data.idSeccionServicio && data.idSeccionServicio !== '' ? parseInt(data.idSeccionServicio) : null,
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para subsecciones
export const subseccionesUtils = {
    // Obtener nombre de la sección por ID
    getSeccionNombre: (subseccion, secciones) => {
        if (subseccion.nombreSeccion) {
            return subseccion.nombreSeccion;
        }

        if (subseccion.idSeccionServicio && secciones) {
            const seccion = secciones.find(s =>
                s.idSeccionServicio === subseccion.idSeccionServicio ||
                s.id === subseccion.idSeccionServicio
            );
            return seccion ? seccion.nombre : 'Sin sección';
        }

        return 'Sin sección';
    },

    // Obtener información completa de la sección
    getSeccionInfo: (subseccion, secciones) => {
        if (subseccion.idSeccionServicio && secciones) {
            const seccion = secciones.find(s =>
                s.idSeccionServicio === subseccion.idSeccionServicio ||
                s.id === subseccion.idSeccionServicio
            );
            if (seccion) {
                return {
                    id: seccion.idSeccionServicio || seccion.id,
                    nombre: seccion.nombre
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin sección'
        };
    }
};

// Exportaciones por defecto
export default {
    subsecciones: subseccionesService,
    secciones: seccionesService,
    validation: subseccionesValidation,
    utils: subseccionesUtils
};
