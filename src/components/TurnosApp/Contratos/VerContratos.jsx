import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowLeft, Eye, Calendar, User, Building, BookOpen } from 'lucide-react';
import { apiService } from '../Services/apiContratoService';

export default function VerContrato() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contrato, setContrato] = useState(null);
    const [especialidades, setEspecialidades] = useState([]);
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verMasObservaciones, setVerMasObservaciones] = useState(false);

    /* // Obtener datos completos del contrato
    useEffect(() => {
        const fetchContratoCompleto = async () => {
            try {
                setLoading(true);
                setError(null);

                // Obtener información completa del contrato
                const contratoResponse = await axios.get(`http://localhost:8080/contrato/contratoTotal/${id}`);

                if (contratoResponse.data) {
                    setContrato(contratoResponse.data);

                    // Obtener especialidades
                    try {
                        const especialidadesResponse = await axios.get(`http://localhost:8080/contrato/${id}/titulos`);
                        setEspecialidades(especialidadesResponse.data || []);
                    } catch (error) {
                        console.warn('Error al cargar especialidades:', error);
                        setEspecialidades([]);
                    }

                    // Obtener procesos
                    try {
                        const procesosResponse = await axios.get(`http://localhost:8080/contrato/${id}/procesos`);
                        setProcesos(procesosResponse.data || []);
                    } catch (error) {
                        console.warn('Error al cargar procesos:', error);
                        setProcesos([]);
                    }
                } else {
                    setContrato(null);
                    console.warn('No se recibió información del contrato');
                }

            } catch (err) {
                setError('Error al cargar el contrato');
                console.error('Error al cargar contrato:', err);
                setContrato(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchContratoCompleto();
    }, [id]); */

    // Obtener datos completos del contrato usando apiService
    const fetchContratoCompleto = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener información completa del contrato
            const contratoData = await apiService.contratos.getContratoCompleto(id);

            if (contratoData) {
                setContrato(contratoData);

                // Obtener especialidades y procesos usando apiService
                const [especialidadesData, procesosData] = await Promise.all([
                    apiService.contratos.getEspecialidades(id).catch(error => {
                        console.warn('Error al cargar especialidades:', error);
                        return [];
                    }),
                    apiService.contratos.getProcesos(id).catch(error => {
                        console.warn('Error al cargar procesos:', error);
                        return [];
                    })
                ]);

                setEspecialidades(especialidadesData);
                setProcesos(procesosData);
            } else {
                setContrato(null);
                setError('Contrato no encontrado');
            }

        } catch (err) {
            console.error('Error al cargar contrato:', err);

            if (err.response?.status === 404) {
                setError('Contrato no encontrado');
            } else {
                setError('Error al cargar el contrato');
            }

            setContrato(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchContratoCompleto();
        }
    }, [id]);

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No definida';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return fecha;
        }
    };

    if (loading) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando información del contrato...</p>
                </div>
            </div>
        );
    }

    if (error || !contrato) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg text-center'>
                    <p className="text-lg text-red-600 mb-4">{error || 'Contrato no encontrado'}</p>
                    <Link to="/contratos">
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 mx-auto">
                            <ArrowLeft size={20} />
                            Volver al Listado
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='text-center border-b pb-4'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Información de Contrato</h1>
                </div>

                {/* Información Principal del Contrato */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>

                    {/* Columna Izquierda */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-40 font-semibold text-gray-700'>Número Contrato:</div>
                            <div className='text-gray-900'>{contrato.numContrato || 'No definido'}</div>
                        </div>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Año:</div>
                            <div className='text-gray-900'>{contrato.anio || 'No definido'}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Fecha Inicio:</div>
                            <div className='text-gray-900'>{formatearFecha(contrato.fechaInicio)}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-38 font-semibold text-gray-700'>Fecha Terminación:</div>
                            <div className='text-gray-900'>{formatearFecha(contrato.fechaTerminacion)}</div>
                        </div>



                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Contratista:</div>
                            <div className='text-gray-900'>{contrato.contratista || 'No definido'}</div>
                        </div>


                    </div>

                    {/* Columna Derecha */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Supervisor:</div>
                            <div className='text-gray-900'>{contrato.supervisor || 'No definido'}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-40 font-semibold text-gray-700'>Apoyo Supervisión:</div>
                            <div className='text-gray-900'>{contrato.apoyoSupervision || 'No definido'}</div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Objeto:</div>
                            <div className='text-gray-900 text-xs leading-relaxed'>
                                {contrato.objeto || 'No definido'}
                            </div>
                        </div>

                        <div className='flex items-start gap-3 border border-black rounded-xl p-1 text-xs'>
                            <div className='w-32 font-semibold text-gray-700'>Observaciones:</div>
                            <div className='text-gray-900 text-xs leading-relaxed'>
                                <div className={`${verMasObservaciones ? '' : 'line-clamp-5'} whitespace-pre-line`}>
                                    {contrato.observaciones || 'Sin observaciones'}
                                </div>
                                {contrato.observaciones && (
                                    <button
                                        onClick={() => setVerMasObservaciones(!verMasObservaciones)}
                                        className="text-blue-600 hover:underline text-sm mt-1"
                                    >
                                        {verMasObservaciones ? 'Ver menos' : 'Ver más'}
                                    </button>
                                )}
                            </div>
                        </div>


                    </div>
                </div>

                {/* Tabla de Especialidades y Procesos */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-gray-800 text-white'>
                        <div className='grid grid-cols-2'>
                            <div className='px-4 py-3 font-semibold text-center border-r border-gray-600'>
                                Especialidades (Perfil)
                            </div>
                            <div className='px-4 py-3 font-semibold text-center'>
                                Procesos
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 min-h-[200px]'>
                        {/* Especialidades */}
                        <div className='border-r border-gray-200 p-4'>
                            {especialidades.length > 0 ? (
                                <div className='space-y-2'>
                                    {especialidades.map((especialidad, index) => (
                                        <div key={index} className='text-sm text-gray-700 py-1 border-b border-gray-100 last:border-b-0'>
                                            {especialidad.titulo || especialidad.descripcion || 'Sin nombre'}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-gray-500 text-center py-8'>
                                    Sin especialidades
                                </div>
                            )}
                        </div>

                        {/* Procesos */}
                        <div className='p-4'>
                            {procesos.length > 0 ? (
                                <div className='space-y-2'>
                                    {procesos.map((proceso, index) => (
                                        <div key={index} className='text-sm text-gray-700 py-1 border-b border-gray-100 last:border-b-0'>
                                            {proceso.detalle || proceso.nombre || 'Sin nombre'}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-gray-500 text-center py-8'>
                                    Sin procesos
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botón de volver */}
                <div className='flex justify-center gap-4 pt-4 border-t'>
                    <Link to="/contratos">
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Volver al Listado
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}