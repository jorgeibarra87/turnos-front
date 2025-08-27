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
                    throw new Error('Sección no encontrada');
                case 409:
                    throw new Error('No se puede eliminar la sección porque tiene dependencias asociadas');
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

// Servicio para Secciones
export const seccionesService = {
    // Obtener todas las secciones
    getAll: async () => {
        try {
            const response = await api.get('/seccionesServicio');
            console.log('Secciones obtenidas:', response.data);

            // Validar que retorne un array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.secciones)) {
                return response.data.secciones;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener secciones:', error);
            throw error;
        }
    },

    // Obtener una sección por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/seccionesServicio/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener sección ${id}:`, error);
            throw error;
        }
    },

    // Crear una nueva sección
    create: async (seccionData) => {
        try {
            console.log('Creando sección:', seccionData);
            const response = await api.post('/seccionesServicio', seccionData);
            console.log('Sección creada:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear sección:', error);
            throw error;
        }
    },

    // Actualizar una sección existente
    update: async (id, seccionData) => {
        try {
            console.log(`Actualizando sección ${id}:`, seccionData);
            const response = await api.put(`/seccionesServicio/${id}`, seccionData);
            console.log('Sección actualizada:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar sección ${id}:`, error);
            throw error;
        }
    },

    // Eliminar una sección
    delete: async (id) => {
        try {
            console.log(`Eliminando sección ${id}`);
            const response = await api.delete(`/seccionesServicio/${id}`);
            console.log('Sección eliminada exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar sección ${id}:`, error);
            throw error;
        }
    },

    // Buscar secciones por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/seccionesServicio/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar secciones por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener secciones activas
    getActivas: async () => {
        try {
            const response = await api.get('/seccionesServicio/activas');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener secciones activas:', error);
            throw error;
        }
    },

    // Obtener secciones por servicio
    getByServicio: async (servicioId) => {
        try {
            const response = await api.get(`/seccionesServicio/servicio/${servicioId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al obtener secciones del servicio ${servicioId}:`, error);
            throw error;
        }
    },

    // Cambiar estado de una sección
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado de la sección ${id} a ${estado}`);
            const response = await api.patch(`/seccionesServicio/${id}/estado`, { estado });
            console.log('Estado de la sección actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado de la sección ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Servicios
export const serviciosService = {
    // Obtener todos los servicios (para el formulario)
    getAll: async () => {
        try {
            const response = await api.get('/servicio');
            console.log('Servicios obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.servicios)) {
                return response.data.servicios;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            // En caso de error, retorna array vacío
            return [];
        }
    },

    // Obtener servicios activos
    getActivos: async () => {
        try {
            const response = await api.get('/servicio/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener servicios activos:', error);
            return [];
        }
    }
};

// Utilidades para validación
export const seccionesValidation = {
    // Validar datos de la sección antes de enviar
    validateSeccionData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre de la sección es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 2) {
            errors.push('El nombre de la sección debe tener al menos 2 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 100) {
            errors.push('El nombre de la sección no puede exceder 100 caracteres');
        }

        if (data.idServicio && isNaN(parseInt(data.idServicio))) {
            errors.push('El ID del servicio debe ser un número válido');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos de la sección
    cleanSeccionData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            idServicio: data.idServicio && data.idServicio !== '' ? parseInt(data.idServicio) : null,
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para obtener información adicional
export const seccionUtils = {
    // Obtener nombre del servicio por ID
    getServicioNombre: (seccion, servicios) => {
        if (seccion.nombreServicio) {
            return seccion.nombreServicio;
        }

        if (seccion.idServicio && servicios) {
            const servicio = servicios.find(s => s.idServicio === seccion.idServicio);
            return servicio ? servicio.nombre : 'Sin servicio';
        }

        return 'Sin servicio';
    },

    // Obtener información completa del servicio
    getServicioInfo: (seccion, servicios) => {
        if (seccion.idServicio && servicios) {
            const servicio = servicios.find(s => s.idServicio === seccion.idServicio);
            if (servicio) {
                return {
                    id: servicio.idServicio,
                    nombre: servicio.nombre
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin servicio'
        };
    },

    // Filtrar secciones por criterios específicos
    filtrarSecciones: (secciones, criterio) => {
        if (!secciones || !Array.isArray(secciones)) return [];

        switch (criterio) {
            case 'activas':
                return secciones.filter(s => s.estado === true);
            case 'inactivas':
                return secciones.filter(s => s.estado === false);
            case 'sin_servicio':
                return secciones.filter(s => !s.idServicio);
            default:
                return secciones;
        }
    },

    // Ordenar secciones
    ordenarSecciones: (secciones, campo = 'nombre', orden = 'asc') => {
        if (!secciones || !Array.isArray(secciones)) return [];

        const seccionesOrdenadas = [...secciones];

        seccionesOrdenadas.sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];

            // Manejar valores nulos/undefined
            if (valorA == null) valorA = '';
            if (valorB == null) valorB = '';

            // Convertir a string para comparación
            valorA = valorA.toString().toLowerCase();
            valorB = valorB.toString().toLowerCase();

            if (orden === 'desc') {
                return valorB.localeCompare(valorA);
            }
            return valorA.localeCompare(valorB);
        });

        return seccionesOrdenadas;
    },

    // Obtener estadísticas de secciones
    getEstadisticas: (secciones) => {
        if (!secciones || !Array.isArray(secciones)) {
            return {
                total: 0,
                activas: 0,
                inactivas: 0,
                conServicio: 0,
                sinServicio: 0
            };
        }

        return {
            total: secciones.length,
            activas: secciones.filter(s => s.estado === true).length,
            inactivas: secciones.filter(s => s.estado === false).length,
            conServicio: secciones.filter(s => s.idServicio).length,
            sinServicio: secciones.filter(s => !s.idServicio).length
        };
    }
};

// Exportar servicio principal
export { seccionesService as default };
