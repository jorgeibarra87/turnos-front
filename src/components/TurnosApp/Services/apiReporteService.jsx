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

// Servicio de reportes
export const apiReporteService = {
    reportes: {
        // Obtener reporte por año, mes y cuadro
        getReporte: async (anio, mes, cuadroId) => {
            const response = await apiClient.get(`/reportes/${anio}/${mes}/${cuadroId}`);
            return response.data;
        },

        // Obtener reportes por rango de fechas
        getReporteByDateRange: async (fechaInicio, fechaFin, cuadroId) => {
            const response = await apiClient.get(`/reportes/rango`, {
                params: { fechaInicio, fechaFin, cuadroId }
            });
            return response.data;
        },

        // Obtener reporte consolidado por período
        getReporteConsolidado: async (anio, mes) => {
            const response = await apiClient.get(`/reportes/consolidado/${anio}/${mes}`);
            return response.data;
        },

        // Obtener estadísticas generales
        getEstadisticas: async (anio) => {
            const response = await apiClient.get(`/reportes/estadisticas/${anio}`);
            return response.data;
        }
    },

    // Servicios auxiliares para reportes
    auxiliares: {
        // Obtener todos los cuadros de turno (para select)
        getCuadrosTurno: async () => {
            const response = await apiClient.get('/cuadro-turnos');
            return Array.isArray(response.data) ? response.data : response.data.cuadros || [];
        },

        // Obtener cuadros activos únicamente
        getCuadrosActivos: async () => {
            const cuadros = await apiReporteService.auxiliares.getCuadrosTurno();
            return cuadros.filter(cuadro => cuadro.estadoCuadro === 'abierto');
        },

        // Obtener años disponibles para reportes
        getAniosDisponibles: async () => {
            const response = await apiClient.get('/reportes/anios-disponibles');
            return response.data || [];
        },

        // Obtener meses disponibles para un año específico
        getMesesDisponibles: async (anio) => {
            const response = await apiClient.get(`/reportes/meses-disponibles/${anio}`);
            return response.data || [];
        }
    },

    // Funciones de exportación (si el backend las maneja)
    exportacion: {
        // Exportar reporte a Excel
        exportToExcel: async (anio, mes, cuadroId) => {
            const response = await apiClient.get(`/reportes/export/excel/${anio}/${mes}/${cuadroId}`, {
                responseType: 'blob'
            });
            return response.data;
        },

        // Exportar reporte a PDF
        exportToPDF: async (anio, mes, cuadroId) => {
            const response = await apiClient.get(`/reportes/export/pdf/${anio}/${mes}/${cuadroId}`, {
                responseType: 'blob'
            });
            return response.data;
        },

        // Generar reporte personalizado
        exportCustom: async (params, format = 'excel') => {
            const response = await apiClient.post(`/reportes/export/${format}`, params, {
                responseType: 'blob'
            });
            return response.data;
        }
    }
};
