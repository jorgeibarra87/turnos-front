import axios from 'axios';

// Configuración de variables de entorno
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

// Interceptores
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

// Servicio de equipos
export const apiEquipoService = {
    equipos: {
        // Obtener todos los equipos
        getAll: async () => {
            const response = await apiClient.get('/equipo');
            return Array.isArray(response.data) ? response.data : response.data.equipos || [];
        },

        // Obtener equipos activos (filtrado)
        getEquiposActivos: async () => {
            const response = await apiClient.get('/equipo');
            const allEquipos = Array.isArray(response.data) ? response.data : response.data.equipos || [];
            return allEquipos.filter(equipo => equipo.estado === true);
        },

        // Obtener equipo por ID
        getById: async (id) => {
            const response = await apiClient.get(`/equipo/${id}`);
            return response.data; // Retorna el objeto completo del equipo
        },

        // FUNCIONES PARA CrearEquipo:

        // Crear equipo, con nombre, categoría, subcategoría
        createCompleto: async ({ nombre, categoria, subcategoria }) => {
            const equipoData = { nombre, categoria, subcategoria };
            // Endpoint: POST /equipo/equipoNombre
            const response = await apiClient.post('/equipo/equipoNombre', equipoData);
            return response.data;
        },

        // Actualizar el nombre del equipo
        updateNombre: async (id, equipoData) => {
            // Endpoint: PUT /equipo/{id}/actualizar-nombre
            const response = await apiClient.put(`/equipo/${id}/actualizar-nombre`, equipoData);
            return response.data;
        },

        // Crear equipo
        create: async (equipoData) => {
            const response = await apiClient.post('/equipo', equipoData);
            return response.data;
        },

        // Actualizar equipo
        update: async (id, equipoData) => {
            const response = await apiClient.put(`/equipo/${id}`, equipoData);
            return response.data;
        },

        // Eliminar equipo
        delete: async (id) => {
            const response = await apiClient.delete(`/equipo/${id}`);
            return response.data;
        },

        // Obtener cuadros asociados a un equipo (antes de eliminar)
        getCuadros: async (id) => {
            const response = await apiClient.get(`/equipo/${id}/cuadros`);
            return response.data || [];
        },

        // Obtener miembros básicos del equipo
        getMiembros: async (id) => {
            const response = await apiClient.get(`/equipo/${id}/miembros`);
            return response.data || [];
        },

        // Obtener miembros con perfil del equipo
        getMiembrosPerfil: async (id) => {
            const response = await apiClient.get(`/equipo/${id}/miembros-perfil`);
            return response.data || [];
        },

        // Obtener usuarios del equipo (para edición)
        getUsuariosEquipo: async (idEquipo) => {
            const response = await apiClient.get(`/usuario/equipo/${idEquipo}/usuarios`);
            return response.data || [];
        },

        // Actualizar usuarios del equipo
        updateUsuariosEquipo: async (idEquipo, personasIds) => {
            const response = await apiClient.put(`/usuario/equipo/${idEquipo}`, personasIds);
            return response.data;
        },

        // Verificar si el equipo puede ser eliminado
        canDelete: async (id) => {
            try {
                const cuadros = await apiEquipoService.equipos.getCuadros(id);
                return {
                    canDelete: cuadros.length === 0,
                    cuadrosCount: cuadros.length,
                    cuadros: cuadros
                };
            } catch (error) {
                return {
                    canDelete: true,
                    cuadrosCount: 0,
                    cuadros: []
                };
            }
        }
    },

    //Servicios auxiliares
    auxiliares: {
        // Obtener opciones por categoría (para selects dinámicos)
        getByCategoria: async (categoria) => {
            const endpoints = {
                'Macroproceso': '/macroprocesos',
                'Proceso': '/procesos',
                'Servicio': '/servicio',
                'Seccion': '/seccionesServicio',
                'Subseccion': '/subseccionesServicio'
            };

            const endpoint = endpoints[categoria];
            if (!endpoint) {
                throw new Error(`Categoría no válida: ${categoria}`);
            }

            const response = await apiClient.get(endpoint);
            return response.data || [];
        },

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

        // Obtener perfiles/títulos (para asignación de personas)
        getPerfiles: async () => {
            const response = await apiClient.get('/titulosFormacionAcademica');
            return response.data || [];
        },

        // Obtener usuarios por perfil/título
        getUsuariosPorPerfil: async (idTitulo) => {
            const response = await apiClient.get(`/usuario/titulo/${idTitulo}/usuarios`);
            return response.data || [];
        }
    }
};
