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

// Interceptor para requests
apiClient.interceptors.request.use(
    (config) => {
        // Agregar token si existe
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para responses
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

// Servicio de contratos
export const apiService = {
    contratos: {
        // Obtener todos los contratos
        getAll: async () => {
            const response = await apiClient.get('/contrato');
            return Array.isArray(response.data) ? response.data : response.data.contratos || [];
        },

        // Obtener contrato por ID
        getById: async (id) => {
            const response = await apiClient.get(`/contrato/${id}`);
            return response.data;
        },

        // Obtener especialidades de un contrato
        getEspecialidades: async (contratoId) => {
            const response = await apiClient.get(`/contrato/${contratoId}/titulos`);
            return response.data || [];
        },

        // Obtener procesos de un contrato
        getProcesos: async (contratoId) => {
            const response = await apiClient.get(`/contrato/${contratoId}/procesos`);
            return response.data || [];
        },

        // Crear contrato
        create: async (contrato) => {
            const response = await apiClient.post('/contrato', contrato);
            return response.data;
        },

        // Actualizar contrato
        update: async (id, contrato) => {
            const response = await apiClient.put(`/contrato/${id}`, contrato);
            return response.data;
        },

        // Eliminar contrato
        delete: async (id) => {
            const response = await apiClient.delete(`/contrato/${id}`);
            return response.data;
        },

        // Obtener contrato completo (para VerContrato)
        getContratoCompleto: async (id) => {
            const response = await apiClient.get(`/contrato/contratoTotal/${id}`);
            return response.data;
        },

        // Crear contrato con elementos relacionados (para CrearContrato)
        createCompleto: async (contratoData) => {
            const response = await apiClient.post('/contrato/guardar', contratoData);
            return response.data;
        },

        // Actualizar contrato con elementos relacionados (para CrearContrato)
        updateCompleto: async (id, contratoData) => {
            const response = await apiClient.put(`/contrato/actualizar/${id}`, contratoData);
            return response.data;
        },

        // Obtener especialidades disponibles
        getTitulosFormacionAcademica: async () => {
            const response = await apiClient.get('/titulosFormacionAcademica');
            return response.data || [];
        },

        // Obtener procesos disponibles
        getProcesosDisponibles: async () => {
            const response = await apiClient.get('/procesos');
            return response.data || [];
        }
    }
};
