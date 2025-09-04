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

        // Manejo personalizado de errores
        if (error.response) {
            // El servidor respondió con un código de error
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
            // La petición se hizo pero no se recibió respuesta
            throw new Error('No se pudo conectar con el servidor');
        } else {
            // Error en la configuración de la petición
            throw new Error('Error en la configuración de la petición');
        }
    }
);

// Servicio para Servicios
export const serviciosService = {
    // Obtener todos los servicios
    getAll: async () => {
        try {
            const response = await api.get('/servicio');
            console.log('Servicios obtenidos:', response.data);

            // Asegurar que siempre retorne un array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.servicios)) {
                return response.data.servicios;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            throw error;
        }
    },

    // Obtener un servicio por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/servicio/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener servicio ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo servicio
    create: async (servicioData) => {
        try {
            console.log('Creando servicio:', servicioData);
            const response = await api.post('/servicio', servicioData);
            console.log('Servicio creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear servicio:', error);
            throw error;
        }
    },

    // Actualizar un servicio existente
    update: async (id, servicioData) => {
        try {
            console.log(`Actualizando servicio ${id}:`, servicioData);
            const response = await api.put(`/servicio/${id}`, servicioData);
            console.log('Servicio actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar servicio ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un servicio
    delete: async (id) => {
        try {
            console.log(`Eliminando servicio ${id}`);
            const response = await api.delete(`/servicio/${id}`);
            console.log('Servicio eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar servicio ${id}:`, error);
            throw error;
        }
    },

    // Buscar servicios por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/servicio/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar servicios por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener servicios activos
    getActivos: async () => {
        try {
            const response = await api.get('/servicio/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener servicios activos:', error);
            throw error;
        }
    },

    // Obtener servicios por bloque
    getByBloque: async (bloqueId) => {
        try {
            const response = await api.get(`/servicio/bloque/${bloqueId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al obtener servicios del bloque ${bloqueId}:`, error);
            throw error;
        }
    },

    // Obtener servicios por proceso
    getByProceso: async (procesoId) => {
        try {
            const response = await api.get(`/servicio/proceso/${procesoId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al obtener servicios del proceso ${procesoId}:`, error);
            throw error;
        }
    },

    // Cambiar estado de un servicio
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado del servicio ${id} a ${estado}`);
            const response = await api.patch(`/servicio/${id}/estado`, { estado });
            console.log('Estado del servicio actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado del servicio ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Bloques de Servicio
export const bloquesServicioService = {
    // Obtener todos los bloques de servicio
    getAll: async () => {
        try {
            const response = await api.get('/bloqueServicio');
            console.log('Bloques de servicio obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.bloqueservicio)) {
                return response.data.bloqueservicio;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener bloques de servicio:', error);
            throw error;
        }
    },

    // Obtener un bloque de servicio por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/bloqueServicio/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener bloque de servicio ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo bloque de servicio
    create: async (bloqueData) => {
        try {
            console.log('Creando bloque de servicio:', bloqueData);
            const response = await api.post('/bloqueServicio', bloqueData);
            console.log('Bloque de servicio creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear bloque de servicio:', error);
            throw error;
        }
    },

    // Actualizar un bloque de servicio existente
    update: async (id, bloqueData) => {
        try {
            console.log(`Actualizando bloque de servicio ${id}:`, bloqueData);
            const response = await api.put(`/bloqueServicio/${id}`, bloqueData);
            console.log('Bloque de servicio actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar bloque de servicio ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un bloque de servicio
    delete: async (id) => {
        try {
            console.log(`Eliminando bloque de servicio ${id}`);
            const response = await api.delete(`/bloqueServicio/${id}`);
            console.log('Bloque de servicio eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar bloque de servicio ${id}:`, error);
            throw error;
        }
    },

    // Buscar bloques de servicio por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/bloqueServicio/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar bloques de servicio por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener bloques de servicio activos
    getActivos: async () => {
        try {
            const response = await api.get('/bloqueServicio/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener bloques de servicio activos:', error);
            throw error;
        }
    },

    // Cambiar estado de un bloque de servicio
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado del bloque de servicio ${id} a ${estado}`);
            const response = await api.patch(`/bloqueServicio/${id}/estado`, { estado });
            console.log('Estado del bloque de servicio actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado del bloque de servicio ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Procesos
export const procesosService = {
    // Obtener todos los procesos (para el formulario)
    getAll: async () => {
        try {
            const response = await api.get('/procesos');
            console.log('Procesos obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.procesos)) {
                return response.data.procesos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener procesos:', error);
            // En caso de error, retorna array vacío
            return [];
        }
    },

    // Obtener procesos activos
    getActivos: async () => {
        try {
            const response = await api.get('/procesos/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener procesos activos:', error);
            return [];
        }
    }
};

// Utilidades para validación de Servicios
export const serviciosValidation = {
    // Validar datos del servicio antes de enviar
    validateServicioData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del servicio es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 2) {
            errors.push('El nombre del servicio debe tener al menos 2 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 100) {
            errors.push('El nombre del servicio no puede exceder 100 caracteres');
        }

        if (data.idBloqueServicio && isNaN(parseInt(data.idBloqueServicio))) {
            errors.push('El ID del bloque de servicio debe ser un número válido');
        }

        if (data.idProceso && isNaN(parseInt(data.idProceso))) {
            errors.push('El ID del proceso debe ser un número válido');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del servicio
    cleanServicioData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            idBloqueServicio: data.idBloqueServicio && data.idBloqueServicio !== '' ? parseInt(data.idBloqueServicio) : null,
            idProceso: data.idProceso && data.idProceso !== '' ? parseInt(data.idProceso) : null,
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para validación de Bloques de Servicio
export const bloquesValidation = {
    // Validar datos del bloque antes de enviar
    validateBloqueData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del bloque es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 2) {
            errors.push('El nombre del bloque debe tener al menos 2 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 100) {
            errors.push('El nombre del bloque no puede exceder 100 caracteres');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del bloque
    cleanBloqueData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para obtener información adicional
export const serviciosUtils = {
    // Obtener nombre del bloque por ID
    getBloqueNombre: (servicio, bloques) => {
        if (servicio.nombreBloqueServicio) {
            return servicio.nombreBloqueServicio;
        }

        if (servicio.idBloqueServicio && bloques) {
            const bloque = bloques.find(b => b.idBloqueServicio === servicio.idBloqueServicio || b.id === servicio.idBloqueServicio);
            return bloque ? bloque.nombre : 'Sin bloque';
        }

        return 'Sin bloque';
    },

    // Obtener información completa del bloque
    getBloqueInfo: (servicio, bloques) => {
        if (servicio.idBloqueServicio && bloques) {
            const bloque = bloques.find(b => b.idBloqueServicio === servicio.idBloqueServicio || b.id === servicio.idBloqueServicio);
            if (bloque) {
                return {
                    id: bloque.idBloqueServicio || bloque.id,
                    nombre: bloque.nombre
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin bloque'
        };
    },

    // Obtener nombre del proceso por ID
    getProcesoNombre: (servicio, procesos) => {
        if (servicio.nombreProceso) {
            return servicio.nombreProceso;
        }

        if (servicio.idProceso && procesos) {
            const proceso = procesos.find(p => p.idProceso === servicio.idProceso || p.id === servicio.idProceso);
            return proceso ? proceso.nombre : 'Sin proceso';
        }

        return 'Sin proceso';
    },

    // Obtener información completa del proceso
    getProcesoInfo: (servicio, procesos) => {
        if (servicio.idProceso && procesos) {
            const proceso = procesos.find(p => p.idProceso === servicio.idProceso || p.id === servicio.idProceso);
            if (proceso) {
                return {
                    id: proceso.idProceso || proceso.id,
                    nombre: proceso.nombre
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin proceso'
        };
    },

    // Filtrar servicios por criterios específicos
    filtrarServicios: (servicios, criterio) => {
        if (!servicios || !Array.isArray(servicios)) return [];

        switch (criterio) {
            case 'activos':
                return servicios.filter(s => s.estado === true);
            case 'inactivos':
                return servicios.filter(s => s.estado === false);
            case 'sin_bloque':
                return servicios.filter(s => !s.idBloqueServicio);
            case 'sin_proceso':
                return servicios.filter(s => !s.idProceso);
            default:
                return servicios;
        }
    },

    // Ordenar servicios
    ordenarServicios: (servicios, campo = 'nombre', orden = 'asc') => {
        if (!servicios || !Array.isArray(servicios)) return [];

        const serviciosOrdenados = [...servicios];

        serviciosOrdenados.sort((a, b) => {
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

        return serviciosOrdenados;
    },

    // Obtener estadísticas de servicios
    /* getEstadisticasServicios: (servicios) => {
        if (!servicios || !Array.isArray(servicios)) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0,
                conBloque: 0,
                sinBloque: 0,
                conProceso: 0,
                sinProceso: 0
            };
        }

        return {
            total: servicios.length,
            activos: servicios.filter(s => s.estado === true).length,
            inactivos: servicios.filter(s => s.estado === false).length,
            conBloque: servicios.filter(s => s.idBloqueServicio).length,
            sinBloque: servicios.filter(s => !s.idBloqueServicio).length,
            conProceso: servicios.filter(s => s.idProceso).length,
            sinProceso: servicios.filter(s => !s.idProceso).length
        };
    } */
};

// Utilidades para bloques de servicio
export const bloquesUtils = {
    // Filtrar bloques por criterios específicos
    filtrarBloques: (bloques, criterio) => {
        if (!bloques || !Array.isArray(bloques)) return [];

        switch (criterio) {
            case 'activos':
                return bloques.filter(b => b.estado === true);
            case 'inactivos':
                return bloques.filter(b => b.estado === false);
            default:
                return bloques;
        }
    },

    // Ordenar bloques
    ordenarBloques: (bloques, campo = 'nombre', orden = 'asc') => {
        if (!bloques || !Array.isArray(bloques)) return [];

        const bloquesOrdenados = [...bloques];

        bloquesOrdenados.sort((a, b) => {
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

        return bloquesOrdenados;
    },

    // Obtener estadísticas de bloques
    /* getEstadisticasBloques: (bloques) => {
        if (!bloques || !Array.isArray(bloques)) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0
            };
        }

        return {
            total: bloques.length,
            activos: bloques.filter(b => b.estado === true).length,
            inactivos: bloques.filter(b => b.estado === false).length
        };
    } */
};

// Exportar servicios principales
export { serviciosService as default };
