import axios from 'axios';

// Configuración de variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

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

// Servicio de turnos
export const apiTurnoService = {
    turnos: {
        // Obtener turnos por cuadro
        getByCuadro: async (cuadroId) => {
            const response = await apiClient.get(`/turnos/cuadro/${cuadroId}`);
            return response.data || [];
        },

        // Obtener turno por ID
        getById: async (turnoId) => {
            const response = await apiClient.get(`/turnos/${turnoId}`);
            return response.data;
        },

        // Crear turno
        create: async (turnoData) => {
            try {
                const response = await apiClient.post('/turnos', turnoData);
                return response.data;
            } catch (error) {
                // ✅ AGREGAR LOGGING PARA VER QUÉ CÓDIGO HTTP SE RECIBE
                console.error('Error status:', error.response?.status);
                console.error('Error data:', error.response?.data);

                if (error.response?.status === 422) {
                    // ✅ Validación de reglas de negocio
                    const errorMessage = error.response.data?.mensaje ||
                        error.response.data?.message ||
                        'Error de validación en el turno';
                    throw new Error(errorMessage);
                } else if (error.response?.status === 400) {
                    throw new Error('Datos inválidos en la solicitud');
                } else if (error.response?.status === 409) {
                    throw new Error('Conflicto al crear el turno');
                } else if (error.response?.status === 500) {
                    throw new Error('Error interno del servidor');
                } else {
                    throw new Error('Error desconocido: ' + (error.response?.data?.message || error.message));
                }
            }
        },
        /* create: async (turnoData) => {
            const response = await apiClient.post('/turnos', turnoData);
            return response.data;
        }, */

        // Actualizar turno
        update: async (turnoId, turnoData) => {
            const response = await apiClient.put(`/turnos/${turnoId}`, turnoData);
            return response.data;
        },

        // Eliminar turno
        delete: async (turnoId) => {
            const response = await apiClient.delete(`/turnos/${turnoId}`);
            return response.data;
        },

        // Obtener turnos abiertos por cuadro
        getTurnosAbiertosByCuadro: async (cuadroId) => {
            const response = await apiClient.get(`/turnos/cuadro/${cuadroId}`);
            const turnos = response.data || [];
            return turnos.filter(turno => turno.estadoTurno === "abierto");
        }
    },

    auxiliares: {
        // Obtener cuadros de turno
        getCuadrosTurno: async () => {
            const response = await apiClient.get('/cuadro-turnos');
            return Array.isArray(response.data) ? response.data : response.data.cuadros || [];
        },

        // Obtener cuadros formateados para selects
        getCuadrosFormateados: async () => {
            const cuadros = await apiTurnoService.auxiliares.getCuadrosTurno();
            return cuadros.map(cuadro => ({
                idCuadroTurno: cuadro.idCuadroTurno || cuadro.id || "",
                nombre: cuadro.nombre || cuadro.descripcion || "Sin nombre",
                idEquipo: cuadro.idEquipo || null
                , version: cuadro.version || ""
            }));
        },

        // Obtener usuarios de un equipo (para formulario)
        getUsuariosEquipo: async (equipoId) => {
            const response = await apiClient.get(`/usuario/equipo/${equipoId}/usuarios`);
            return response.data || [];
        },

        // Obtener miembros con perfil de un equipo
        getMiembrosPerfilEquipo: async (equipoId) => {
            const response = await apiClient.get(`/equipo/${equipoId}/miembros-perfil`);
            return response.data || [];
        },

        // Obtener información de un equipo
        getEquipoInfo: async (equipoId) => {
            const response = await apiClient.get(`/equipo/${equipoId}`);
            return {
                idEquipo: response.data.idEquipo || response.data.id || "",
                nombre: response.data.nombre || "Sin nombre"
            };
        }
    }
};
