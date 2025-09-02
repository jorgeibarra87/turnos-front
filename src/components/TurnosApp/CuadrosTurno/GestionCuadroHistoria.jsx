import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, ArrowLeft, Eye, Calendar, Users, Tag, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiCuadroService } from '../Services/apiCuadroService';
import { apiTurnoService } from '../Services/apiTurnoService';

export default function GestionCuadroHistoria() {
    const { id } = useParams(); // Obtener ID desde la URL
    const navigate = useNavigate();

    // Estados
    const [cuadroData, setCuadroData] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [historialturno, setHistorialTurno] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [loadingHistorialTurno, setLoadingHistorialTurno] = useState(false);
    const [error, setError] = useState(null);
    const [errorMiembros, setErrorMiembros] = useState(null);
    const [errorTurnos, setErrorTurnos] = useState(null);
    const [errorHistorial, setErrorHistorial] = useState(null);
    const [errorHistorialTurno, setErrorHistorialTurno] = useState(null);

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
                const cuadro = await apiCuadroService.cuadros.getById(id);
                setCuadroData(cuadro);

                // Cargar historial del cuadro
                await loadHistorial(id);

                // Cargar Turnos del cuadro
                await loadTurnos(id);

                // Cargar historial Turnos del cuadro
                await loadHistorialTurnos(id);

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
                    const procesosData = await apiCuadroService.auxiliares.getProcesosAtencionByCuadro(cuadroData.idCuadroTurno);

                    if (procesosData && Array.isArray(procesosData)) {
                        const procesosFormateados = procesosData.map(proceso => ({
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
            const miembrosData = await apiCuadroService.auxiliares.getMiembrosEquipo(equipoId);
            setMiembros(miembrosData);
        } catch (error) {
            console.error("Error al obtener miembros del equipo:", error);
            setErrorMiembros("Error al cargar los miembros del equipo");
            setMiembros([]);
        } finally {
            setLoadingMiembros(false);
        }
    };

    // Cargar historial del cuadro
    const loadHistorial = async (id) => {
        try {
            setLoadingHistorial(true);
            setErrorHistorial(null);
            const historialData = await apiCuadroService.auxiliares.getHistorialById(id);
            setHistorial(historialData);
        } catch (error) {
            console.error("Error al obtener historial:", error);
            setErrorHistorial("Error al cargar historial");
            setHistorial([]);
        } finally {
            setLoadingHistorial(false);
        }
    };

    // Cargar datos de Turnos del cuadro
    const loadTurnos = async (id) => {
        try {
            setLoadingTurnos(true);
            setErrorTurnos(null);
            const TurnoData = await apiTurnoService.turnos.getTurnosAbiertosByCuadro(id);
            setTurnos(TurnoData);
        } catch (error) {
            console.error("Error al obtener Turnos:", error);
            setErrorTurnos("Error al cargar Turnos");
            setTurnos([]);
        } finally {
            setLoadingTurnos(false);
        }
    };

    // Cargar historial de Turnos del cuadro
    const loadHistorialTurnos = async (id) => {
        try {
            setLoadingHistorialTurno(true);
            setErrorHistorialTurno(null);
            const historialTurnoData = await apiCuadroService.auxiliares.getHistorialTurnosById(id);
            setHistorialTurno(historialTurnoData);
        } catch (error) {
            console.error("Error al obtener historial:", error);
            setErrorHistorialTurno("Error al cargar historial");
            setHistorialTurno([]);
        } finally {
            setLoadingHistorialTurno(false);
        }
    };

    // Función para formatear la categoría
    const formatearCategoria = (categoria) => {
        return categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : '';
    };


    if (loading) {
        return (
            <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando cuadro...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold text-red-600'>Error</div>
                    <div className='text-center text-gray-600'>{error}</div>
                    <Link to="/selectorCuadroHistorial">
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
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-4 rounded-lg flex flex-col gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex items-center justify-between border-b pb-2'>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                        <Eye size={40} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Gestion Historial Cuadro de Turno
                        </h1>
                    </div>
                    <div className='text-sm'>
                        ID: {id}
                    </div>
                </div>

                {/* Información del Cuadro */}
                <div className='bg-gray-50 rounded-lg p-1'>
                    <h2 className='text-lg font-semibold mb-1 flex items-center gap-1'>
                        <Tag size={20} className="text-gray-600" />
                        Información del Cuadro
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-1'>
                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Nombre del Cuadro</div>
                            <div className=' text-gray-800 break-all text-xs'>
                                {cuadroData?.nombre || 'No disponible'}
                            </div>
                        </div>

                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Version</div>
                            <div className=' text-gray-800 break-all text-xs'>
                                {cuadroData?.version || 'No disponible'}
                            </div>
                        </div>

                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Categoría</div>
                            <div className=' text-gray-800 text-sm font-bold'>
                                {formatearCategoria(cuadroData?.categoria)}
                            </div>
                        </div>

                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Período</div>
                            <div className=' text-gray-800 flex items-center gap-1 text-xs'>
                                <Calendar size={16} />
                                Mes: {cuadroData?.mes} Año: {cuadroData?.anio}
                            </div>
                        </div>

                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Equipo</div>
                            <div className=' text-gray-800 text-xs'>
                                {cuadroData?.nombreEquipo || `Equipo ID: ${cuadroData?.idEquipo}`}
                            </div>
                        </div>

                        <div className='bg-white p-2 rounded-lg border'>
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

                        <div className='bg-white p-2 rounded-lg border'>
                            <div className='text-sm text-gray-500 mb-1'>Estado</div>
                            <div className='font-semibold text-gray-800'>
                                <span className='px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                                    {cuadroData?.estadoCuadro || `No especificado`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Procesos de Atención (solo si es 'multiproceso') */}
                {cuadroData.categoria === 'multiproceso' && (
                    <div className='bg-white rounded-lg border'>
                        <div className='bg-blue-50 px-2 py-2 border-b'>
                            <h2 className='text-xs font-semibold flex items-center gap-2'>
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
                        <div className='bg-blue-50 px-2 py-2 border-b'>
                            <h2 className='text-sm font-semibold flex items-center gap-1'>
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
                        <h2 className='text-sm font-semibold flex items-center gap-1'>
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
                                <thead className='bg-black'>
                                    <tr>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>

                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Perfil
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
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
                                            <td className='px-2 py-2 whitespace-nowrap text-xs text-gray-700'>
                                                {miembro.titulos?.join(', ') || 'Sin perfil definido'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {miembro.nombreCompleto || 'Nombre no disponible'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Historial cambios cuadro */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-sm font-semibold flex items-center gap-1'>
                            <CalendarClock size={20} className="text-blue-600" />
                            Historial Cambios Cuadro
                        </h2>
                    </div>

                    {loadingHistorial ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando historial...</p>
                        </div>
                    ) : errorHistorial ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {errorHistorial}
                        </div>
                    ) : historial.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontrarohistorial para este cuadro
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-black'>
                                    <tr>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Año
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            mes
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Fecha Cambio
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            nombre
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            version
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Turno Excepcion
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {/* {console.log('Historial del cuadro:', historial)} */}
                                    {historial.map((h, index) => (
                                        <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-2 py-2 whitespace-nowrap text-center'>
                                                {h.idCuadroTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs text-gray-700'>
                                                {h.anio || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {h.mes || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {h.fechaCambio || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {h.nombre || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {h.version || 'N/A'}
                                            </td>
                                            <td className={`px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 ${h?.turnoExcepcion
                                                ? ' text-green-800'
                                                : ' text-orange-800'
                                                }`}>
                                                {h?.turnoExcepcion ? 'Si' : 'No'}
                                            </td>
                                            <td className={`px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 ${h?.estado
                                                ? 'bg-green-50 text-green-800'
                                                : 'bg-orange-50 text-orange-800'
                                                }`}>
                                                {h?.estado ? 'activo' : 'inactivo'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Datos Turnos del Cuadro */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-sm font-semibold flex items-center gap-1'>
                            <CalendarClock size={20} className="text-blue-600" />
                            Turnos del Cuadro
                        </h2>
                    </div>

                    {loadingTurnos ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando Turnos...</p>
                        </div>
                    ) : errorTurnos ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {errorTurnos}
                        </div>
                    ) : turnos.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontraron turnos para este cuadro
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-black'>
                                    <tr>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            estado Turno
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Fecha Inicio
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Fecha Fin
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Jornada
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Tipo Turno
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Total Horas
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Version
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id Cuadro
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id Persona
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Estado
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            comentarios
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {console.log('Turnos:', turnos)}
                                    {turnos.map((turno, index) => (
                                        <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-2 py-2 whitespace-nowrap text-center'>
                                                {turno.idTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.estadoTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.fechaInicio || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.fechaFin || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.jornada || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.tipoTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.totalHoras || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.version || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.idCuadroTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {turno.idPersona || 'N/A'}
                                            </td>
                                            <td className={`px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 ${turno?.estado
                                                ? 'bg-green-50 text-green-800'
                                                : 'bg-orange-50 text-orange-800'
                                                }`}>
                                                {turno?.estado ? 'activo' : 'inactivo'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs text-gray-700'>
                                                {turno.comentarios || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* HIstorial Turnos del Cuadro */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-sm font-semibold flex items-center gap-1'>
                            <CalendarClock size={20} className="text-blue-600" />
                            Historial Cambios Turnos del Cuadro
                        </h2>
                    </div>

                    {loadingHistorialTurno ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando historial Turnos...</p>
                        </div>
                    ) : errorHistorialTurno ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {errorHistorialTurno}
                        </div>
                    ) : historialturno.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontraro historial de turnos para este cuadro
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-black'>
                                    <tr>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            estado Turno
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Fecha Inicio
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Fecha Fin
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Jornada
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Tipo Turno
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Total Horas
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Version
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id Cuadro
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id Turno
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Id Persona
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            Estado
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider'>
                                            comentarios
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {/* {console.log('historia Turnos:', historialturno)} */}
                                    {historialturno.map((ht, index) => (
                                        <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-2 py-2 whitespace-nowrap text-center'>
                                                {ht.idTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.estadoTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.fechaInicio || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.fechaFin || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.jornada || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.tipoTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.totalHoras || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.version || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.idCuadroTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.idTurno || 'N/A'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900'>
                                                {ht.idUsuario || 'N/A'}
                                            </td>
                                            <td className={`px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 ${ht?.estado
                                                ? 'bg-green-50 text-green-800'
                                                : 'bg-orange-50 text-orange-800'
                                                }`}>
                                                {ht?.estado ? 'activo' : 'inactivo'}
                                            </td>
                                            <td className='px-2 py-2 whitespace-nowrap text-xs text-gray-700'>
                                                {ht.comentarios || 'N/A'}
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
                    <Link to="/selectorCuadroHistorial">
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