import axios from 'axios';

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
        console.error('Error en la petición:', error);

        // Manejo personalizado de errores
        if (error.response) {
            // El servidor respondió con un código de error
            switch (error.response.status) {
                case 404:
                    throw new Error('Macroproceso no encontrado');
                case 409:
                    throw new Error('No se puede eliminar el macroproceso porque tiene dependencias asociadas');
                case 400:
                    throw new Error(error.response.data?.message || 'Datos inválidos');
                case 500:
                    throw new Error('Error interno del servidor');
                default:
                    throw new Error(error.response.data?.message || 'Error en la operación');
            }
        } else if (error.request) {
            // La petición se hizo pero no se recibió respuesta
            throw new Error('No se pudo conectar con el servidor');
        } else {
            // Error en la configuración de la petición
            throw new Error('Error en la configuración de la petición');
        }
    }
);

// Servicio para Macroprocesos
export const macroprocesosService = {
    // Obtener todos los macroprocesos
    getAll: async () => {
        try {
            const response = await api.get('/macroprocesos');
            console.log('Macroprocesos obtenidos:', response.data);
            // Validar que retorne un array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.macroprocesos)) {
                return response.data.macroprocesos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener macroprocesos:', error);
            throw error;
        }
    },

    // Obtener un macroproceso por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/macroprocesos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener macroproceso ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo macroproceso
    create: async (macroprocesoData) => {
        try {
            console.log('Creando macroproceso:', macroprocesoData);
            const response = await api.post('/macroprocesos', macroprocesoData);
            console.log('Macroproceso creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear macroproceso:', error);
            throw error;
        }
    },

    // Actualizar un macroproceso existente
    update: async (id, macroprocesoData) => {
        try {
            console.log(`Actualizando macroproceso ${id}:`, macroprocesoData);
            const response = await api.put(`/macroprocesos/${id}`, macroprocesoData);
            console.log('Macroproceso actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar macroproceso ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un macroproceso
    delete: async (id) => {
        try {
            console.log(`Eliminando macroproceso ${id}`);
            const response = await api.delete(`/macroprocesos/${id}`);
            console.log('Macroproceso eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar macroproceso ${id}:`, error);
            throw error;
        }
    },

    // Buscar macroprocesos por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/macroprocesos/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar macroprocesos por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener macroprocesos activos
    getActivos: async () => {
        try {
            const response = await api.get('/macroprocesos/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener macroprocesos activos:', error);
            throw error;
        }
    },

    // Cambiar estado de un macroproceso
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado del macroproceso ${id} a ${estado}`);
            const response = await api.patch(`/macroprocesos/${id}/estado`, { estado });
            console.log('Estado del macroproceso actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado del macroproceso ${id}:`, error);
            throw error;
        }
    }
};

//Validación
export const macroprocesosValidation = {
    // Validar datos del macroproceso antes de enviar
    validateMacroprocesoData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del macroproceso es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            errors.push('El nombre del macroproceso debe tener al menos 3 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 100) {
            errors.push('El nombre del macroproceso no puede exceder 100 caracteres');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del macroproceso
    cleanMacroprocesoData: (data) => {
        return {
            ...data,
            nombre: data.nombre ? data.nombre.trim() : '',
            estado: Boolean(data.estado)
        };
    }
};

// Exportar servicios individualmente
export { macroprocesosService as default };
