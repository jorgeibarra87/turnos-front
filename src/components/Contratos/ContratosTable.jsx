import React from 'react';
import { Eye, Edit, Trash2, CopyPlus, Users, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ContratosTable() {
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadContratos();
    }, []);

    const loadContratos = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await axios.get("http://localhost:8080/contrato");
            console.log('Contratos cargados:', result.data);

            let contratosData = [];
            if (Array.isArray(result.data)) {
                contratosData = result.data;
            } else {
                contratosData = result.data.contratos || [];
            }

            // Obtener especialidades y procesos para cada contrato
            const contratosConDetalles = await Promise.all(
                contratosData.map(async (contrato) => {
                    try {
                        // Obtener especialidades
                        const especialidadesResponse = await axios.get(
                            `http://localhost:8080/contrato/${contrato.idContrato}/titulos`
                        );
                        const especialidades = especialidadesResponse.data || [];

                        // Obtener procesos
                        const procesosResponse = await axios.get(
                            `http://localhost:8080/contrato/${contrato.idContrato}/procesos`
                        );
                        const procesos = procesosResponse.data || [];

                        return {
                            ...contrato,
                            especialidades: especialidades,
                            procesos: procesos
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
            setError('Error al cargar los contratos');
            setContratos([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, numeroContrato) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el contrato "${numeroContrato}"?`)) {
            try {
                const response = await axios.delete(`http://localhost:8080/contrato/${id}`);

                // Recargar la lista después de la eliminación
                loadContratos();
                alert('Contrato eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar el contrato:', error.response?.data || error.message);

                // Manejar diferentes tipos de errores
                if (error.response?.status === 409) {
                    alert('No se puede eliminar el contrato porque tiene dependencias asociadas');
                } else if (error.response?.status === 404) {
                    alert('El contrato no fue encontrado');
                } else {
                    alert('Error al eliminar el contrato');
                }
            }
        }
    };

    // Función para obtener las especialidades del contrato cargado
    const getEspecialidadesDisplay = (contrato) => {
        if (contrato.especialidades && contrato.especialidades.length > 0) {
            return contrato.especialidades
                .map(titulo => titulo.titulo || titulo.descripcion || 'Sin nombre')
                .join(', ');
        }
        return 'Sin especialidades';
    };
    // Función para obtener los procesos del contrato cargado
    const getProcesosDisplay = (contrato) => {
        if (contrato.procesos && contrato.procesos.length > 0) {
            return contrato.procesos
                .map(proceso => proceso.nombre || proceso.nombre || 'Sin nombre')
                .join(', ');
        }
        return 'Sin procesos';
    };

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

            {/* Botón para crear nuevo contrato */}
            <Link to="/crearContrato">
                <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                    <CopyPlus size={22} color="white" strokeWidth={2} />
                    Crear Contrato
                </button>
            </Link>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                </div>
            )}

            {/* Tabla de contratos */}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3 ">Número Contrato</th>
                        <th className="p-3 ">Especialidades</th>
                        <th className="p-3 ">Procesos</th>
                        <th className="p-3 flex items-center justify-centers gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {contratos.map((contrato) => (
                        <tr key={contrato.idContrato || contrato.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 border border-gray-200 font-medium">
                                {contrato.numContrato || 'Sin número'}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getEspecialidadesDisplay(contrato)}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                                {getProcesosDisplay(contrato)}
                            </td>
                            <td className="p-3 border border-gray-200 space-x-6">
                                {/* Botón Ver - Link a vista detallada de contrato */}
                                <Link
                                    to={`/verContrato/${contrato.idContrato || contrato.id}`}
                                    title={`Ver contrato: ${contrato.numContrato}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors ml-2"
                                    />
                                </Link>

                                {/* Botón Editar - Link dinámico con ID */}
                                <Link
                                    to={`/crearContrato/editar/${contrato.idContrato || contrato.id}`}
                                    title={`Editar contrato: ${contrato.numContrato}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mensaje cuando no hay contratos */}
            {contratos.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay contratos disponibles</p>
                    <p className="text-sm">Crea tu primer contrato usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}