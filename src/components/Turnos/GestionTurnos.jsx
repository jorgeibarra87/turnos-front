import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { User, ArrowLeft, Eye, Users, CalendarPlus } from 'lucide-react';
import { turnosData } from '../../data/turnosData';

export default function GestionTurnos() {
    const [searchParams] = useSearchParams();
    const equipoId = searchParams.get('equipoId');
    const cuadroId = searchParams.get('cuadroId');
    const cuadroNombre = searchParams.get('cuadroNombre');
    const navigate = useNavigate();

    const [equipo, setEquipo] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [errorMiembros, setErrorMiembros] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener datos del equipo
    useEffect(() => {
        const fetchEquipo = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:8080/equipo/${equipoId}`);

                if (response.data) {
                    const equipoData = response.data;
                    const equipoFormateado = {
                        idEquipo: equipoData.idEquipo || equipoData.id || "",
                        nombre: equipoData.nombre || "Sin nombre"
                    };
                    setEquipo(equipoFormateado); // ✅ equipo es objeto, no array
                } else {
                    setEquipo(null);
                    console.warn('No se recibió equipo');
                }

            } catch (err) {
                setError('Error al cargar el equipo');
                console.error('Error al cargar equipo:', err);
                setEquipo(null);
            } finally {
                setLoading(false);
            }
        };

        if (equipoId) fetchEquipo();
    }, [equipoId]);

    // Obtener miembros del equipo
    useEffect(() => {
        if (equipoId) {
            loadMiembrosEquipo(equipoId);
        }
    }, [equipoId]);

    const loadMiembrosEquipo = async (equipoId) => {
        try {
            setLoadingMiembros(true);
            setErrorMiembros(null);
            const response = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros-perfil`);
            setMiembros(response.data);
        } catch (error) {
            console.error("Error al obtener miembros del equipo:", error);
            setErrorMiembros("Error al cargar los miembros del equipo");
            setMiembros([]);
        } finally {
            setLoadingMiembros(false);
        }
    };

    // Obtener datos del turno
    useEffect(() => {
        const fetchTurno = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:8080/turnos/cuadro/${cuadroId}`);

                if (response.data) {
                    const turnoData = response.data;
                    /* const turnoFormateado = {
                        idEquipo: equipoData.idEquipo || equipoData.id || "",
                        nombre: equipoData.nombre || "Sin nombre"
                    }; */
                    setTurno(turnoData);
                } else {
                    setEquipo(null);
                    console.warn('No se recibió turnos');
                }

            } catch (err) {
                setError('Error al cargar turnos');
                console.error('Error al cargar turnos:', err);
                setEquipo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTurno();
    }, [cuadroId]);

    console.log("turnoData", turnosData);

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-4 rounded-lg flex flex-col gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl text-center font-bold'>Gestion de Turnos</div>
                {/* Header */}
                <div className='flex items-center  border-b pb-2'>
                    <div className='flex items-center gap-4'>
                        <div>

                            <p className='text-gray-600'>Visualización de datos del Cuadro seleccionado</p>
                        </div>
                    </div>
                </div>

                {/* Nombre del equipo */}
                <div className='bg-white p-4 rounded-lg border'>
                    <div className='text-xl font-bold text-black-500 mb-1'>Cuadro de Turno: {cuadroNombre || `Equipo ID: ${cuadroId}`}</div>

                </div>

                {/* Equipo de Trabajo */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-xl font-semibold flex items-center gap-2'>
                            <Users size={20} className="text-blue-600" />
                            Equipo de Talento Humano
                        </h2>
                    </div>

                    {loadingMiembros ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando miembros del equipo...</p>
                        </div>
                    ) : errorMiembros ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {errorMiembros}
                        </div>
                    ) : miembros.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontraron miembros para este equipo
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th></th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Perfil
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Nombre Completo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {miembros.map((miembro, index) => (
                                        <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-2 py-2 text-center'>
                                                <User size={20} className='text-gray-400' />
                                            </td>
                                            <td className='px-2 py-2 text-sm text-gray-700'>
                                                {miembro.titulos?.join(', ') || 'Sin perfil definido'}
                                            </td>
                                            <td className='px-2 py-2 text-sm font-medium text-gray-900'>
                                                {miembro.nombreCompleto || 'Nombre no disponible'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className='text-4xl font-bold flex items-center gap-2 pb-4 w-full justify-center '>
                    Turnos <CalendarPlus size={50} className="text-green-600 hover:text-green-800" />
                </div>

                {/* Botón de volver */}
                <div className='flex justify-center gap-4 pt-4 '>
                    <Link to="/crearTurnos">
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
