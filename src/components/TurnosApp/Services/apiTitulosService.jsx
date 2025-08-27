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

// Servicio para Títulos de Formación Académica
export const titulosService = {
    // Obtener todos los títulos
    getAll: async () => {
        try {
            const response = await api.get('/titulosFormacionAcademica');
            console.log('Títulos obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.titulos)) {
                return response.data.titulos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener títulos:', error);
            throw error;
        }
    },

    // Obtener un título por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/titulosFormacionAcademica/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener título ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo título
    create: async (tituloData) => {
        try {
            console.log('Creando título:', tituloData);
            const response = await api.post('/titulosFormacionAcademica', tituloData);
            console.log('Título creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear título:', error);
            throw error;
        }
    },

    // Actualizar un título existente
    update: async (id, tituloData) => {
        try {
            console.log(`Actualizando título ${id}:`, tituloData);
            const response = await api.put(`/titulosFormacionAcademica/${id}`, tituloData);
            console.log('Título actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar título ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un título
    delete: async (id) => {
        try {
            console.log(`Eliminando título ${id}`);
            const response = await api.delete(`/titulosFormacionAcademica/${id}`);
            console.log('Título eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar título ${id}:`, error);
            throw error;
        }
    },

    // Búsqueda de títulos por nombre
    searchByName: async (nombre) => {
        try {
            const response = await api.get(`/titulosFormacionAcademica/buscar?nombre=${encodeURIComponent(nombre)}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al buscar títulos por nombre "${nombre}":`, error);
            throw error;
        }
    },

    // Obtener títulos activos
    getActivos: async () => {
        try {
            const response = await api.get('/titulosFormacionAcademica/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener títulos activos:', error);
            throw error;
        }
    },

    // Obtener títulos por tipo de formación
    getByTipoFormacion: async (tipoId) => {
        try {
            const response = await api.get(`/titulosFormacionAcademica/tipo/${tipoId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`Error al obtener títulos del tipo ${tipoId}:`, error);
            throw error;
        }
    },

    // Cambiar estado de un título
    cambiarEstado: async (id, estado) => {
        try {
            console.log(`Cambiando estado del título ${id} a ${estado}`);
            const response = await api.patch(`/titulosFormacionAcademica/${id}/estado`, { estado });
            console.log('Estado del título actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al cambiar estado del título ${id}:`, error);
            throw error;
        }
    }
};

// Servicio para Tipos de Formación Académica
export const tiposFormacionService = {
    // Obtener todos los tipos de formación
    getAll: async () => {
        try {
            const response = await api.get('/tipoFormacionAcademica');
            console.log('Tipos de formación obtenidos:', response.data);

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.tipos)) {
                return response.data.tipos;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener tipos de formación:', error);
            // En caso de error, retorna array vacío
            return [];
        }
    },

    // Obtener un tipo de formación por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/tipoFormacionAcademica/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener tipo de formación ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo tipo de formación
    create: async (tipoData) => {
        try {
            console.log('Creando tipo de formación:', tipoData);
            const response = await api.post('/tipoFormacionAcademica', tipoData);
            console.log('Tipo de formación creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear tipo de formación:', error);
            throw error;
        }
    },

    // Actualizar un tipo de formación existente
    update: async (id, tipoData) => {
        try {
            console.log(`Actualizando tipo de formación ${id}:`, tipoData);
            const response = await api.put(`/tipoFormacionAcademica/${id}`, tipoData);
            console.log('Tipo de formación actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar tipo de formación ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un tipo de formación
    delete: async (id) => {
        try {
            console.log(`Eliminando tipo de formación ${id}`);
            const response = await api.delete(`/tipoFormacionAcademica/${id}`);
            console.log('Tipo de formación eliminado exitosamente');
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar tipo de formación ${id}:`, error);
            throw error;
        }
    },

    // Obtener tipos de formación activos
    getActivos: async () => {
        try {
            const response = await api.get('/tipoFormacionAcademica/activos');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener tipos de formación activos:', error);
            return [];
        }
    }
};

// Utilidades para validación de Títulos
export const titulosValidation = {
    // Validar datos del título antes de enviar
    validateTituloData: (data) => {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del título es requerido');
        }

        if (data.nombre && data.nombre.trim().length < 2) {
            errors.push('El nombre del título debe tener al menos 2 caracteres');
        }

        if (data.nombre && data.nombre.trim().length > 200) {
            errors.push('El nombre del título no puede exceder 200 caracteres');
        }

        if (data.idTipoFormacionAcademica && isNaN(parseInt(data.idTipoFormacionAcademica))) {
            errors.push('El ID del tipo de formación debe ser un número válido');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del título
    cleanTituloData: (data) => {
        return {
            nombre: data.nombre ? data.nombre.trim() : '',
            idTipoFormacionAcademica: data.idTipoFormacionAcademica && data.idTipoFormacionAcademica !== '' ? parseInt(data.idTipoFormacionAcademica) : null,
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para validación de Tipos de Formación
export const tiposFormacionValidation = {
    // Validar datos del tipo de formación antes de enviar
    validateTipoData: (data) => {
        const errors = [];

        if (!data.tipo || data.tipo.trim().length === 0) {
            errors.push('El tipo de formación es requerido');
        }

        if (data.tipo && data.tipo.trim().length < 2) {
            errors.push('El tipo de formación debe tener al menos 2 caracteres');
        }

        if (data.tipo && data.tipo.trim().length > 100) {
            errors.push('El tipo de formación no puede exceder 100 caracteres');
        }

        if (typeof data.estado !== 'boolean') {
            errors.push('El estado debe ser un valor booleano');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Limpiar y formatear datos del tipo de formación
    cleanTipoData: (data) => {
        return {
            tipo: data.tipo ? data.tipo.trim() : '',
            estado: Boolean(data.estado)
        };
    }
};

// Utilidades para títulos
export const titulosUtils = {
    // Obtener nombre del tipo de formación por ID
    getTipoFormacionNombre: (titulo, tiposFormacion) => {
        if (titulo.nombreTipo) {
            return titulo.nombreTipo;
        }

        if (titulo.idTipoFormacionAcademica && tiposFormacion) {
            const tipo = tiposFormacion.find(t =>
                t.idTipoFormacionAcademica === titulo.idTipoFormacionAcademica ||
                t.id === titulo.idTipoFormacionAcademica
            );
            return tipo ? tipo.tipo : 'Sin tipo de formación';
        }

        return 'Sin tipo de formación';
    },

    // Obtener información completa del tipo de formación
    getTipoFormacionInfo: (titulo, tiposFormacion) => {
        if (titulo.idTipoFormacionAcademica && tiposFormacion) {
            const tipo = tiposFormacion.find(t =>
                t.idTipoFormacionAcademica === titulo.idTipoFormacionAcademica ||
                t.id === titulo.idTipoFormacionAcademica
            );
            if (tipo) {
                return {
                    id: tipo.idTipoFormacionAcademica || tipo.id,
                    nombre: tipo.tipo
                };
            }
        }

        return {
            id: 'No asignado',
            nombre: 'Sin tipo de formación'
        };
    },

    // Filtrar títulos por criterios específicos
    filtrarTitulos: (titulos, criterio) => {
        if (!titulos || !Array.isArray(titulos)) return [];

        switch (criterio) {
            case 'activos':
                return titulos.filter(t => t.estado === true);
            case 'inactivos':
                return titulos.filter(t => t.estado === false);
            case 'sin_tipo':
                return titulos.filter(t => !t.idTipoFormacionAcademica);
            default:
                return titulos;
        }
    },

    // Ordenar títulos
    ordenarTitulos: (titulos, campo = 'titulo', orden = 'asc') => {
        if (!titulos || !Array.isArray(titulos)) return [];

        const titulosOrdenados = [...titulos];

        titulosOrdenados.sort((a, b) => {
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

        return titulosOrdenados;
    },

    /* // Obtener estadísticas de títulos
    getEstadisticasTitulos: (titulos) => {
        if (!titulos || !Array.isArray(titulos)) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0,
                conTipo: 0,
                sinTipo: 0
            };
        }

        return {
            total: titulos.length,
            activos: titulos.filter(t => t.estado === true).length,
            inactivos: titulos.filter(t => t.estado === false).length,
            conTipo: titulos.filter(t => t.idTipoFormacionAcademica).length,
            sinTipo: titulos.filter(t => !t.idTipoFormacionAcademica).length
        };
    }, */

    // Agrupar títulos por tipo de formación
    agruparPorTipo: (titulos, tiposFormacion) => {
        if (!titulos || !Array.isArray(titulos)) return {};

        const agrupados = {};

        titulos.forEach(titulo => {
            const tipoNombre = titulosUtils.getTipoFormacionNombre(titulo, tiposFormacion);

            if (!agrupados[tipoNombre]) {
                agrupados[tipoNombre] = [];
            }

            agrupados[tipoNombre].push(titulo);
        });

        return agrupados;
    },

    // Validar relación con tipo de formación
    validarRelacionTipo: (titulo, tiposFormacion) => {
        if (!titulo.idTipoFormacionAcademica) {
            return { valida: true, mensaje: '' };
        }

        if (!tiposFormacion || !Array.isArray(tiposFormacion)) {
            return { valida: false, mensaje: 'No se pudieron cargar los tipos de formación' };
        }

        const tipoExiste = tiposFormacion.some(t =>
            t.idTipoFormacionAcademica === titulo.idTipoFormacionAcademica ||
            t.id === titulo.idTipoFormacionAcademica
        );

        if (!tipoExiste) {
            return { valida: false, mensaje: 'El tipo de formación seleccionado no existe' };
        }

        return { valida: true, mensaje: '' };
    }
};

// Utilidades para tipos de formación
export const tiposFormacionUtils = {
    // Filtrar tipos de formación por criterios específicos
    filtrarTipos: (tipos, criterio) => {
        if (!tipos || !Array.isArray(tipos)) return [];

        switch (criterio) {
            case 'activos':
                return tipos.filter(t => t.estado === true);
            case 'inactivos':
                return tipos.filter(t => t.estado === false);
            default:
                return tipos;
        }
    },

    // Ordenar tipos de formación
    ordenarTipos: (tipos, campo = 'tipo', orden = 'asc') => {
        if (!tipos || !Array.isArray(tipos)) return [];

        const tiposOrdenados = [...tipos];

        tiposOrdenados.sort((a, b) => {
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

        return tiposOrdenados;
    },

    // Obtener estadísticas de tipos de formación
    getEstadisticasTipos: (tipos) => {
        if (!tipos || !Array.isArray(tipos)) {
            return {
                total: 0,
                activos: 0,
                inactivos: 0
            };
        }

        return {
            total: tipos.length,
            activos: tipos.filter(t => t.estado === true).length,
            inactivos: tipos.filter(t => t.estado === false).length
        };
    }
};

// Exportar servicio principal
export { titulosService as default };
