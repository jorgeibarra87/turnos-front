import React from 'react';
import { Eye, Edit, Trash2, CopyPlusIcon, CopyPlus, UsersIcon, BoxesIcon, Users, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function EquiposTable() {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEquipos();
    }, []);

    const loadEquipos = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await axios.get("http://localhost:8080/equipo");
            console.log('Equipos cargados:', result.data);

            // Si la respuesta es un array directamente
            if (Array.isArray(result.data)) {
                setEquipos(result.data);
            } else {
                // Si hay alguna estructura diferente, ajustar aquí
                setEquipos(result.data.equipos || []);
            }
        } catch (err) {
            console.error('Error al cargar equipos:', err);
            setError('Error al cargar los equipos');
            setEquipos([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${nombre}"?`)) {
            try {
                // Primero verificar si el equipo tiene cuadros de turno asociados
                const checkResponse = await axios.get(`http://localhost:8080/equipo/${id}/cuadros`);

                if (checkResponse.data && checkResponse.data.length > 0) {
                    alert(`No se puede eliminar el equipo "${nombre}" porque tiene ${checkResponse.data.length} cuadro(s) de turno asociado(s). Primero debe cerrar o eliminar los cuadros de turno.`);
                    return;
                }

                // Si no tiene cuadros asociados, proceder con la eliminación
                const response = await axios.delete(`http://localhost:8080/equipo/${id}`);

                // Recargar la lista después de la eliminación
                loadEquipos();
                alert('Equipo eliminado exitosamente');
                console.log('Respuesta:', response.data);
            } catch (error) {
                console.error('Error al eliminar el equipo:', error.response?.data || error.message);

                // Manejar diferentes tipos de errores
                if (error.response?.status === 409) {
                    alert('No se puede eliminar el equipo porque tiene cuadros de turno asociados');
                } else if (error.response?.status === 404) {
                    alert('El equipo no fue encontrado');
                } else {
                    alert('Error al eliminar el equipo');
                }
            }
        }
    };

    // Función para obtener el número de miembros (si está disponible en la API)
    const getMiembrosCount = async (equipoId) => {
        try {
            const response = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros`);
            return response.data.length || 0;
        } catch (error) {
            console.warn(`No se pudo obtener el número de miembros para el equipo ${equipoId}`);
            return 0;
        }
    };

    // Función para extraer la categoría del nombre del equipo
    const extractCategory = (nombre) => {
        if (!nombre) return 'N/A';

        const parts = nombre.split('_');
        if (parts.length >= 2 && parts[0] === 'Equipo') {
            return parts[1]; // Retorna la categoría (Servicio, Proceso, etc.)
        }
        return 'Personalizado'; // Si no sigue el patrón estándar
    };

    // Función para extraer el área/proceso del nombre del equipo
    const extractArea = (nombre) => {
        if (!nombre) return 'N/A';

        const parts = nombre.split('_');
        if (parts.length >= 3 && parts[0] === 'Equipo') {
            return parts[2]; // Retorna el área/proceso (UCI1, etc.)
        }
        return nombre; // Si no sigue el patrón, retorna el nombre completo
    };

    if (loading) {
        return (
            <div className="m-8 p-6 bg-white shadow rounded">
                <div className='m-10 text-5xl text-center font-bold'>Gestión de Equipos</div>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando equipos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Gestión de Equipos</div>

            {/* Botón para crear nuevo equipo */}
            <div className="flex justify-between items-center mb-4">
                <Link to="/crearEquipo">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                        <CopyPlus size={22} color="white" strokeWidth={2} />
                        Crear Equipo
                    </button>
                </Link>

                {/* Información adicional */}
                <div className="text-sm text-gray-600">
                    Total equipos: {equipos.length}
                </div>
            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                </div>
            )}

            {/* Tabla de equipos */}
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Nombre del Equipo</th>
                        {/* <th className="p-3">Área/Proceso</th> */}
                        <th className="p-3 flex items-center gap-2">
                            <Settings size={16} />
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {equipos.map((equipo) => (
                        <tr key={equipo.idEquipo || equipo.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-xs font-mono">
                                {equipo.idEquipo || equipo.id}
                            </td>
                            <td className="p-3 text-xs font-medium">
                                {equipo.nombre || 'Sin nombre'}
                            </td>
                            <td className="p-3 space-x-3">
                                {/* Botón Ver - Link a vista detallada de equipo */}
                                <Link
                                    to={`/verEquipo/${equipo.idEquipo || equipo.id}`}
                                    title={`Ver equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                {/* Botón Editar - Link dinámico con ID */}
                                <Link
                                    to={`/crearEquipo/editar/${equipo.idEquipo || equipo.id}`}
                                    title={`Editar equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                    />
                                </Link>
                                {/* Botón Eliminar - Mantiene la funcionalidad de botón */}
                                {/* <button
                                    onClick={() => handleDelete(equipo.idEquipo || equipo.id, equipo.nombre)}
                                    title={`Eliminar equipo: ${equipo.nombre}`}
                                    className="inline-block"
                                >
                                    <Trash2
                                        size={18}
                                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                                    />
                                </button> */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mensaje cuando no hay equipos */}
            {equipos.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay equipos disponibles</p>
                    <p className="text-sm">Crea tu primer equipo usando el botón de arriba</p>
                </div>
            )}


        </div>
    );
}