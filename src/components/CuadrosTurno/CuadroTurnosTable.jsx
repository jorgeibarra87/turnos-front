import React from 'react';
import { Eye, Edit, Trash2, CopyPlusIcon, CopyPlus, UsersIcon, BoxesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CrearCuadro from './CrearCuadro';

export default function TurnosTable() {
    const [cuadros, setCuadros] = useState([]);

    useEffect(() => {
        loadCuadros();
    }, []);

    const loadCuadros = async () => {
        const result = await axios.get("http://localhost:8080/cuadro-turnos");
        //console.log(result.data);
        setCuadros(result.data);
    };

    // Función para manejar la eliminación
    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el cuadro "${nombre}"?`)) {
            try {
                await axios.delete(`http://localhost:8080/cuadro-turnos/${id}`);
                // Recargar la lista después de eliminar
                loadCuadros();
                alert('Cuadro eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el cuadro');
            }
        }
    };

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Gestion Cuadros de Turno</div>
            <Link to="/crearCuadro">
                <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                    <CopyPlus size={22} color="white" strokeWidth={2} />
                    Crear Cuadro de Turno
                </button>
            </Link>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3">Cuadro</th>
                        <th className="p-3 flex items-center gap-2"><UsersIcon />Equipo</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cuadros.map((cuadro) => (
                        <tr key={cuadro.idCuadroTurno} className="border-b">
                            <td className="p-3 text-xs">{cuadro.nombre}</td>
                            <td className="p-3 text-xs">{cuadro?.nombreEquipo || 'Sin equipo'}</td>
                            <td className="p-3 space-x-3">
                                {/* Botón Ver - Link a vista detallada */}
                                <Link
                                    to={`/VerCuadro/${cuadro.idCuadroTurno}`}
                                    title={`Ver cuadro: ${cuadro.nombre}`}
                                    className="inline-block"
                                >
                                    <Eye
                                        size={18}
                                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                {/* Botón Editar - Link dinámico con ID */}
                                <Link
                                    to={`/crearCuadro/editar/${cuadro.idCuadroTurno}`}
                                    title={`Editar cuadro: ${cuadro.nombre}`}
                                    className="inline-block"
                                >
                                    <Edit
                                        size={18}
                                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors"
                                    />
                                </Link>

                                {/* Botón Eliminar - Mantiene la funcionalidad de botón */}
                                <button
                                    onClick={() => handleDelete(cuadro.idCuadroTurno, cuadro.nombre)}
                                    title={`Eliminar cuadro: ${cuadro.nombre}`}
                                    className="inline-block"
                                >
                                    <Trash2
                                        size={18}
                                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                                    />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mensaje cuando no hay cuadros */}
            {cuadros.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <BoxesIcon size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay cuadros de turno disponibles</p>
                    <p className="text-sm">Crea tu primer cuadro usando el botón de arriba</p>
                </div>
            )}
        </div>
    );
}