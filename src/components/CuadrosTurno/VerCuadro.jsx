import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, ArrowLeft, Eye, Calendar, Users, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerCuadro() {
    const { id } = useParams(); // Obtener ID desde la URL
    const navigate = useNavigate();

    // Estados
    const [cuadroData, setCuadroData] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [error, setError] = useState(null);
    const [errorMiembros, setErrorMiembros] = useState(null);

    const [procesos, setProcesos] = useState([]);
    const [loadingProcesos, setLoadingProcesos] = useState(false);
    const [errorProcesos, setErrorProcesos] = useState(null);

    // Cargar datos del cuadro
    useEffect(() => {
        const loadCuadroData = async () => {
            if (!id) {
                setError('ID de cuadro no proporcionado');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8080/cuadro-turnos/${id}`);
                const cuadro = response.data;

                setCuadroData(cuadro);

                // Cargar miembros del equipo
                if (cuadro.idEquipo) {
                    await loadMiembrosEquipo(cuadro.idEquipo);
                }

            } catch (err) {
                console.error('Error al cargar cuadro:', err);
                setError('Error al cargar los datos del cuadro');
            } finally {
                setLoading(false);
            }
        };

        loadCuadroData();
    }, [id]);
    // Efecto para cargar los procesos de atención si la categoría es 'multiproceso'
    useEffect(() => {
        const fetchProcesos = async () => {
            if (cuadroData?.categoria === 'multiproceso' && cuadroData?.idCuadroTurno) {
                try {
                    setLoadingProcesos(true);
                    setErrorProcesos(null);
                    const response = await axios.get(`http://localhost:8080/procesosAtencion/cuadro/${cuadroData.idCuadroTurno}`);

                    if (response.data && Array.isArray(response.data)) {
                        const procesosFormateados = response.data.map(proceso => ({
                            idProcesoAtencion: proceso.id || proceso.idProcesoAtencion || "",
                            nombre: proceso.detalle || "Sin nombre"
                        }));
                        setProcesos(procesosFormateados);
                    } else {
                        setProcesos([]);
                        console.warn('La respuesta no contiene un array de procesos de atención');
                    }
                } catch (err) {
                    setErrorProcesos('Error al cargar los procesos de atención.');
                    console.error('Error al cargar procesos:', err);
                    setProcesos([]);
                } finally {
                    setLoadingProcesos(false);
                }
            } else if (cuadroData && cuadroData.categoria !== 'multiproceso') {
                // Si no es multiproceso, aseguramos que los procesos estén vacíos
                setProcesos([]);
                setLoadingProcesos(false);
            }
        };

        fetchProcesos();
    }, [cuadroData]);

    // Cargar miembros del equipo
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

    // Función para formatear la categoría
    const formatearCategoria = (categoria) => {
        return categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : '';
    };


    if (loading) {
        return (
            <div className='absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando cuadro...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold text-red-600'>Error</div>
                    <div className='text-center text-gray-600'>{error}</div>
                    <Link to="/">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex justify-center items-center gap-2 transition-colors">
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-4 rounded-lg flex flex-col gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex items-center justify-between border-b pb-2'>
                    <div className='flex items-center gap-4'>
                        <Eye size={32} className="text-blue-600" />
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800'>Ver Cuadro de Turno</h1>
                            <p className='text-gray-600'>Visualización de datos del cuadro</p>
                        </div>
                    </div>
                    <div className='text-sm'>
                        ID: {id}
                    </div>
                </div>

                {/* Información del Cuadro */}
                <div className='bg-gray-50 rounded-lg p-2'>
                    <h2 className='text-xl font-semibold mb-2 flex items-center gap-2'>
                        <Tag size={20} className="text-gray-600" />
                        Información del Cuadro
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2'>
                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Nombre del Cuadro</div>
                            <div className=' text-gray-800 break-all text-xs'>
                                {cuadroData?.nombre || 'No disponible'}
                            </div>
                        </div>

                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Categoría</div>
                            <div className=' text-gray-800 text-sm font-bold'>
                                {formatearCategoria(cuadroData?.categoria)}
                            </div>
                        </div>

                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Período</div>
                            <div className=' text-gray-800 flex items-center gap-2 text-xs'>
                                <Calendar size={16} />
                                Mes: {cuadroData?.mes} Año: {cuadroData?.anio}
                            </div>
                        </div>

                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Equipo</div>
                            <div className=' text-gray-800 text-xs'>
                                {cuadroData?.nombreEquipo || `Equipo ID: ${cuadroData?.idEquipo}`}
                            </div>
                        </div>

                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Turno Excepción</div>
                            <div className='font-semibold text-gray-800'>
                                <span className={`px-2 py-1 rounded-full text-xs ${cuadroData?.turnoExcepcion
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {cuadroData?.turnoExcepcion ? 'Sí' : 'No'}
                                </span>
                            </div>
                        </div>

                        <div className='bg-white p-4 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Estado</div>
                            <div className='font-semibold text-gray-800'>
                                <span className='px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                                    Activo
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Procesos de Atención (solo si es 'multiproceso') */}
                {cuadroData.categoria === 'multiproceso' && (
                    <div className='bg-white rounded-lg border'>
                        <div className='bg-blue-50 px-6 py-2 border-b'>
                            <h2 className='text-xl font-semibold flex items-center gap-2'>
                                <Tag size={20} className="text-blue-600" />
                                Procesos de Atención
                            </h2>
                        </div>

                        {loadingProcesos ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-500">Cargando procesos...</p>
                            </div>
                        ) : errorProcesos ? (
                            <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                                {errorProcesos}
                            </div>
                        ) : procesos.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No se encontraron procesos de atención para este cuadro.
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead className='bg-gray-50'>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200'>
                                        {procesos.map((proceso, index) => (
                                            <tr key={proceso.idProceso || index} className='hover:bg-gray-50 transition-colors'>
                                                <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                    {proceso.nombre}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Sección de Procesos individuales (solo no es 'multiproceso') */}
                {cuadroData.categoria !== 'multiproceso' && (
                    <div className='bg-white rounded-lg border'>
                        <div className='bg-blue-50 px-6 py-2 border-b'>
                            <h2 className='text-xl font-semibold flex items-center gap-2'>
                                <Tag size={20} className="text-blue-600" />
                                {cuadroData.nombreMacroproceso && <div>Macroproceso</div>}
                                {cuadroData.nombreProceso && <div>Proceso</div>}
                                {cuadroData.nombreServicio && <div>Servicio</div>}
                                {cuadroData.nombreSeccionServicio && <div>Sección Servicio</div>}
                                {cuadroData.nombreSubseccionServicio && <div>Subsección Servicio</div>}
                            </h2>
                        </div>


                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    <tr className='hover:bg-gray-50 transition-colors'>
                                        <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                            {cuadroData.nombreMacroproceso && <div>{cuadroData.nombreMacroproceso}</div>}
                                            {cuadroData.nombreProceso && <div>{cuadroData.nombreProceso}</div>}
                                            {cuadroData.nombreServicio && <div>{cuadroData.nombreServicio}</div>}
                                            {cuadroData.nombreSeccionServicio && <div>{cuadroData.nombreSeccionServicio}</div>}
                                            {cuadroData.nombreSubseccionServicio && <div>{cuadroData.nombreSubseccionServicio}</div>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


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
                                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>

                                        </th>
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
                                            <td className='px-2 py-2 whitespace-nowrap text-center'>
                                                <div className='flex justify-center'>
                                                    <User size={20} className='text-gray-400' />
                                                </div>
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-sm text-gray-700'>
                                                {miembro.titulos?.join(', ') || 'Sin perfil definido'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                                                {miembro.nombreCompleto || 'Nombre no disponible'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className='flex justify-center gap-4 pt-4 border-t'>
                    <Link to="/">
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors">
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver al Listado
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}