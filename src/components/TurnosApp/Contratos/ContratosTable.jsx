import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../Services/apiContratoService';

export default function ContratosTable() {
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar contratos
    const loadContratos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const contratosData = await apiService.contratos.getAll();

            // Obtener especialidades y procesos para cada contrato
            const contratosConDetalles = await Promise.all(
                contratosData.map(async (contrato) => {
                    try {
                        const [especialidades, procesos] = await Promise.all([
                            apiService.contratos.getEspecialidades(contrato.idContrato),
                            apiService.contratos.getProcesos(contrato.idContrato)
                        ]);

                        return {
                            ...contrato,
                            especialidades: especialidades || [],
                            procesos: procesos || []
                        };
                    } catch (error) {
                        console.warn(`Error al obtener detalles del contrato ${contrato.idContrato}:`, error);
                        return {
                            ...contrato,
                            especialidades: [],
                            procesos: []
                        };
                    }
                })
            );

            setContratos(contratosConDetalles);
        } catch (err) {
            console.error('Error al cargar contratos:', err);
            setError('Error al cargar los contratos. Intenta nuevamente.');
            setContratos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar contrato
    const handleDelete = useCallback(async (id, numeroContrato) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el contrato "${numeroContrato}"?`)) {
            try {
                await apiService.contratos.delete(id);
                await loadContratos(); // Recargar lista
                alert('Contrato eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar contrato:', error);

                if (error.response?.status === 409) {
                    alert('No se puede eliminar el contrato porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('El contrato no fue encontrado');
                } else {
                    alert('Error al eliminar el contrato');
                }
            }
        }
    }, [loadContratos]);

    // Formatear especialidades
    const getEspecialidadesDisplay = (contrato) => {
        if (contrato.especialidades && contrato.especialidades.length > 0) {
            return contrato.especialidades
                .map(titulo => titulo.titulo || titulo.descripcion || 'Sin nombre')
                .join(', ');
        }
        return 'Sin especialidades';
    };

    // Formatear procesos
    const getProcesosDisplay = (contrato) => {
        if (contrato.procesos && contrato.procesos.length > 0) {
            return contrato.procesos
                .map(proceso => proceso.nombre || 'Sin nombre')
                .join(', ');
        }
        return 'Sin procesos';
    };

    // Cargar contratos al montar el componente
    useEffect(() => {
        loadContratos();
    }, [loadContratos]);

    // Loading spinner
    if (loading) {
        return (
            <div className="m-8 p-6 bg-white shadow rounded">
                <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Contratos:</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando contratos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Ver Todos los Contratos:</div>

            {/* Header con botón crear y contador */}
            <div className="mb-6 flex justify-between items-center">
                <Link to="/crearContrato">
                    <button className="px-4 py-2 bg-primary-green-husj text-white rounded-2xl hover:bg-green-600 flex items-center gap-2 transition-colors">
                        <CopyPlus size={22} />
                        Crear Contrato
                    </button>
                </Link>

                <div className="text-sm text-gray-500">
                    {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} encontrado{contratos.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={loadContratos}
                        className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Tabla de contratos */}
            {contratos.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="p-3">Número Contrato</th>
                                <th className="p-3">Especialidades</th>
                                <th className="p-3">Procesos</th>
                                <th className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} />
                                        Acciones
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {contratos.map((contrato) => (
                                <tr key={contrato.idContrato} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 border border-gray-200 font-medium">
                                        {contrato.numContrato || 'Sin número'}
                                    </td>
                                    <td className="p-3 border border-gray-200 text-sm">
                                        {getEspecialidadesDisplay(contrato)}
                                    </td>
                                    <td className="p-3 border border-gray-200 text-sm">
                                        {getProcesosDisplay(contrato)}
                                    </td>
                                    <td className="p-3 border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            {/* Ver */}
                                            <Link
                                                to={`/verContrato/${contrato.idContrato}`}
                                                title={`Ver contrato: ${contrato.numContrato}`}
                                                className="text-primary-green-husj hover:text-green-600 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </Link>

                                            {/* Editar */}
                                            <Link
                                                to={`/crearContrato/editar/${contrato.idContrato}`}
                                                title={`Editar contrato: ${contrato.numContrato}`}
                                                className="text-primary-blue1-husj hover:text-primary-blue2-husj transition-colors"
                                            >
                                                <Edit size={18} />
                                            </Link>

                                            {/* Eliminar */}
                                            <button
                                                onClick={() => handleDelete(contrato.idContrato, contrato.numContrato)}
                                                title={`Eliminar contrato: ${contrato.numContrato}`}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : !loading && (
                <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No hay contratos disponibles</p>
                    <p className="text-sm">Crea tu primer contrato usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}