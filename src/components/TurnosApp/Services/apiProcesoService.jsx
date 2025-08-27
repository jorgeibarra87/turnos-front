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
                    throw new Error('Proceso no encontrado');
                case 409:
                    throw new Error('No se puede eliminar el proceso porque tiene dependencias asociadas');
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

// Servicio para Procesos
export const procesosService = {
    // Obtener todos los procesos
    getAll: async () => {
        try {
            const response = await api.get('/procesos');
            console.log('Procesos obtenidos:', response.data);

            // Validar que retorne un array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.procesos)) {
                return response.data.procesos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener procesos:', error);
            throw error;
        }
    },

    // Obtener un proceso por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/procesos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener proceso ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo proceso
    create: async (procesoData) => {
        try {
            console.log('Creando proceso:', procesoData);
            const response = await api.post('/procesos', procesoData);
            console.log('Proceso creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear proceso:', error);
            throw error;
        }
    },

    // Actualizar un proceso existente
    update: async (id, procesoData) => {
        try {
            console.log(`Actualizando proceso ${id}:`, procesoData);
            const response = await api.put(`/procesos/${id}`, procesoData);
            console.log('Proceso actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar proceso ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un proceso
    delete: async (id) => {
        try {
            console.log(`Eliminando proceso ${id}`);
            const response = await api.delete(`/procesos/${id}`);
            console.log('Proceso eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar proceso ${id}:`, error);
            throw error;
        }
    },

    // Buscar procesos por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/procesos/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar procesos por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener procesos activos
    getActivos: async () => {
        try {
            const response = await api.get('/procesos/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener procesos activos:', error);
            throw error;
        }
    },

    // Obtener procesos por macroproceso
    getByMacroproceso: async (macroprocesoId) => {
        try {
            const response = await api.get(`/procesos/macroproceso/${macroprocesoId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al obtener procesos del macroproceso ${macroprocesoId}:`, error);
            throw error;
        }
    },

    // Cambiar estado de un proceso
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado del proceso ${id} a ${estado}`);
            const response = await api.patch(`/procesos/${id}/estado`, { estado });
            console.log('Estado del proceso actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado del proceso ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Macroprocesos
export const macroprocesosService = {
    // Obtener todos los macroprocesos (para el formulario)
    getAll: async () => {
        try {
            const response = await api.get('/macroprocesos');
            console.log('Macroprocesos obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.macroprocesos)) {
                return response.data.macroprocesos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener macroprocesos:', error);
            // En caso de error, retorna array vacío
            return [];
        }
    },

    // Obtener macroprocesos activos
    getActivos: async () => {
        try {
            const response = await api.get('/macroprocesos/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener macroprocesos activos:', error);
            return [];
        }
    }
};

// Utilidades para validación
export const procesosValidation = {
    // Validar datos del proceso antes de enviar
    validateProcesoData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del proceso es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 3) {
            errors.push('El nombre del proceso debe tener al menos 3 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 150) {
            errors.push('El nombre del proceso no puede exceder 150 caracteres');
        }

        if (data.idMacroproceso && isNaN(parseInt(data.idMacroproceso))) {
            errors.push('El ID del macroproceso debe ser un número válido');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del proceso
    cleanProcesoData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            idMacroproceso: data.idMacroproceso && data.idMacroproceso !== '' ? parseInt(data.idMacroproceso) : null,
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para obtener información de macroprocesos
export const procesoUtils = {
    // Obtener nombre del macroproceso por ID
    getMacroprocesoNombre: (proceso, macroprocesos) => {
        if (proceso.nombreMacroproceso) {
            return proceso.nombreMacroproceso;
        }

        if (proceso.idMacroproceso && macroprocesos) {
            const macroproceso = macroprocesos.find(m => m.idMacroproceso === proceso.idMacroproceso);
            return macroproceso ? macroproceso.nombre : 'Sin macroproceso';
        }

        return 'Sin macroproceso';
    },

    // Obtener información completa del macroproceso
    getMacroprocesoInfo: (proceso, macroprocesos) => {
        if (proceso.idMacroproceso && macroprocesos) {
            const macroproceso = macroprocesos.find(m => m.idMacroproceso === proceso.idMacroproceso);
            if (macroproceso) {
                return {
                    id: macroproceso.idMacroproceso,
                    nombre: macroproceso.nombre
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin macroproceso'
        };
    }
};

// Exportar servicio principal
export { procesosService as default };
