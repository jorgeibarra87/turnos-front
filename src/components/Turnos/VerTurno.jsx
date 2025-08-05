import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CircleXIcon, User, Clock, Calendar, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerTurno() {
    const { turnoId } = useParams();
    const navigate = useNavigate();

    const [turno, setTurno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const cuadroNombre = searchParams.get('cuadroNombre');
    const equipoNombre = searchParams.get('equipoNombre');

    useEffect(() => {
        const loadTurno = async () => {
            if (!turnoId) {
                setError('ID de turno no válido');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/turnos/${turnoId}`);
                setTurno(response.data);
            } catch (err) {
                console.error('Error al cargar turno:', err);
                setError('Error al cargar los datos del turno');
            } finally {
                setLoading(false);
            }
        };

        loadTurno();
    }, [turnoId]);

    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        return new Date(dateTimeString).toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando turno...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !turno) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold text-red-600'>Error</div>
                    <div className='text-center text-gray-600'>{error || 'Turno no encontrado'}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} color="white" strokeWidth={2} />
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center mb-6'>
                    <div className='text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2'>
                        <Calendar size={36} className="text-blue-600" />
                        Detalles del Turno
                    </div>
                    <div className='text-sm text-gray-600'>ID: {turnoId}</div>
                </div>

                {/* Información del Turno */}
                <div className='space-y-6'>

                    {/* Información General */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2'>
                        <h3 className='text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2'>
                            <Calendar size={20} />
                            Información General
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-1 gap-4 text-sm'>
                            <div>
                                <span className='font-medium text-gray-700'>Cuadro de Turno:</span>
                                <div className='mt-1 text-gray-900'>{cuadroNombre || 'N/A'}</div>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>Equipo:</span>
                                <div className='mt-1 text-gray-900'>{equipoNombre || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Información de la Persona */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2'>
                        <h3 className='text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2'>
                            <User size={20} />
                            Persona Asignada
                        </h3>
                        <div className='text-sm'>
                            <div>
                                {/* <span className='font-medium text-gray-700'>Nombre:</span> */}
                                <div className='mt-1 text-gray-900 text-lg'>{turno.nombrePersona || 'No asignado'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Horarios */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2'>
                        <h3 className='text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2'>
                            <Clock size={20} />
                            Horarios
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                                <span className='font-medium text-gray-700'>Fecha/Hora Inicio:</span>
                                <div className='mt-1 text-gray-900 font-mono'>{formatDate(turno.fechaInicio)}</div>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>Fecha/Hora Fin:</span>
                                <div className='mt-1 text-gray-900 font-mono'>{formatDate(turno.fechaFin)}</div>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>Total de Horas:</span>
                                <div className='mt-1 text-gray-900 font-semibold text-lg flex items-center gap-2'>
                                    <Clock size={16} />
                                    {turno.totalHoras || 0} horas
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detalles del Turno */}
                    <div className='bg-blue-50 border border-purple-200 rounded-lg p-4'>
                        <h3 className='text-lg font-semibold text-blue-800 mb-4'>Detalles del Turno</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                                <span className='font-medium text-gray-700'>Jornada:</span>
                                <div className='mt-1'>
                                    <span className='inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full'>
                                        {turno.jornada || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>Tipo de Turno:</span>
                                <div className='mt-1'>
                                    <span className='inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full'>
                                        {turno.tipoTurno || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>Comentarios:</span>
                                <div className='mt-1'>
                                    <span className='inline-block  bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full'>
                                        {turno.comentarios || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className='flex justify-center items-center gap-4 mt-8'>
                    {/* <Link to={`/editar-turno/${turnoId}`}>
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex justify-center items-center gap-2 transition-colors">
                            <Edit size={20} color="white" strokeWidth={2} />
                            Editar Turno
                        </button>
                    </Link> */}

                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} color="white" strokeWidth={2} />
                        Volver
                    </button>

                    <Link to="/selector-cuadro-turno">
                        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                            <CircleXIcon size={20} color="white" strokeWidth={2} />
                            Cancelar
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}