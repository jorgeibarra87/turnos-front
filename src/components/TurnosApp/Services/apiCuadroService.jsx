import axios from 'axios';

// Usar la misma configuración base
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.REACT_APP_API_TIMEOUT || '10000', 10);

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptores para manejar tokens y errores
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Servicio de cuadros de turno
export const apiCuadroService = {
    cuadros: {
        // Obtener todos los cuadros de turno
        getAll: async () => {
            const response = await apiClient.get('/cuadro-turnos');
            return Array.isArray(response.data) ? response.data : response.data.cuadros || [];
        },

        // Obtener cuadros
        getCuadros: async () => {
            const response = await apiClient.get('/cuadro-turnos');
            const allCuadros = Array.isArray(response.data) ? response.data : response.data.cuadros || [];
            /* return allCuadros.filter(cuadro => cuadro.estadoCuadro === 'abierto'); */
            return allCuadros;
        },

        // Obtener cuadro por ID
        getById: async (id) => {
            const response = await apiClient.get(`/cuadro-turnos/${id}`);
            return response.data;
        },

        // Obtener procesos de un cuadro
        getProcesos: async (cuadroId) => {
            const response = await apiClient.get(`/cuadro-turnos/${cuadroId}/procesos`);
            return response.data || [];
        },

        // Crear cuadro completo
        createCompleto: async (cuadroData) => {
            const response = await apiClient.post('/cuadro-turnos/crear-total', cuadroData);
            return response.data;
        },

        // Actualizar cuadro completo
        updateCompleto: async (id, cuadroData) => {
            const response = await apiClient.put(`/cuadro-turnos/${id}/editar-total`, cuadroData);
            return response.data;
        },

        // Cambiar estado del cuadro (cerrar/abrir)
        cambiarEstado: async (estadoActual, nuevoEstado, idsCuadros) => {
            const response = await apiClient.put('/cuadro-turnos/cambiar-estado', {
                estadoActual,
                nuevoEstado,
                idsCuadros
            });
            return response.data;
        },

        // Cerrar cuadro específico
        cerrar: async (id) => {
            return await apiCuadroService.cuadros.cambiarEstado('abierto', 'cerrado', [id]);
        },

        // Abrir cuadro específico
        abrir: async (id) => {
            return await apiCuadroService.cuadros.cambiarEstado('cerrado', 'abierto', [id]);
        }
    },

    // Servicios auxiliares para los formularios
    auxiliares: {
        // Obtener macroprocesos
        getMacroprocesos: async () => {
            const response = await apiClient.get('/macroprocesos');
            return response.data || [];
        },

        // Obtener procesos
        getProcesos: async () => {
            const response = await apiClient.get('/procesos');
            return response.data || [];
        },

        // Obtener procesos de atención (para multiproceso)
        getProcesosAtencion: async () => {
            const response = await apiClient.get('/procesosAtencion');
            return response.data || [];
        },

        // Obtener servicios
        getServicios: async () => {
            const response = await apiClient.get('/servicio');
            return response.data || [];
        },

        // Obtener secciones de servicio
        getSeccionesServicio: async () => {
            const response = await apiClient.get('/seccionesServicio');
            return response.data || [];
        },

        // Obtener subsecciones de servicio
        getSubseccionesServicio: async () => {
            const response = await apiClient.get('/subseccionesServicio');
            return response.data || [];
        },

        // Obtener equipos
        getEquipos: async () => {
            const response = await apiClient.get('/equipo');
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(equipo => ({
                    idEquipo: equipo.idEquipo || equipo.id || "",
                    nombre: equipo.nombre || equipo.descripcion || "Sin nombre"
                }));
            }
            return [];
        },

        // Obtener miembros de un equipo con perfil
        getMiembrosEquipo: async (equipoId) => {
            const response = await apiClient.get(`/equipo/${equipoId}/miembros-perfil`);
            return response.data || [];
        },

        // Obtener datos por categoría
        getDataByCategoria: async (categoria) => {
            const endpoints = {
                'Macroproceso': '/macroprocesos',
                'Proceso': '/procesos',
                'Servicio': '/servicio',
                'Seccion': '/seccionesServicio',
                'Subseccion': '/subseccionesServicio',
                'Multiproceso': '/procesosAtencion'
            };

            const endpoint = endpoints[categoria];
            if (!endpoint) {
                throw new Error(`Categoría no válida: ${categoria}`);
            }

            const response = await apiClient.get(endpoint);
            return response.data || [];
        },

        // Obtener proceso específico por ID
        getProcesoById: async (id) => {
            const response = await apiClient.get(`/procesos/${id}`);
            return response.data;
        },
    }
};
