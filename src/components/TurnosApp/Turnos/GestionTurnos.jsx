import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { User, ArrowLeft, Eye, Users, CalendarPlus, Calendar, Edit, CalendarSearch, CalendarSync, ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { apiTurnoService } from '../Services/apiTurnoService';

export default function GestionTurnos() {
    const [searchParams] = useSearchParams();
    const equipoId = searchParams.get('equipoId');
    const cuadroId = searchParams.get('cuadroId');
    const cuadroNombre = searchParams.get('cuadroNombre');

    // Estados para paginación de personas
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Estados para paginación de turnos por persona (objeto que guarda la página actual y items por página de cada persona)
    const [turnosPagination, setTurnosPagination] = useState({});
    const [turnosItemsPerPage, setTurnosItemsPerPage] = useState({}); // estado para items por página de cada persona

    const navigate = useNavigate();

    const [turnos, setTurnos] = useState([]);
    const [equipo, setEquipo] = useState([]);
    const [miembros, setMiembros] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [errorMiembros, setErrorMiembros] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCrearTurno = () => {
        const params = new URLSearchParams({
            cuadroId: cuadroId,
            cuadroNombre: cuadroNombre,
            equipoId: equipoId,
            equipoNombre: equipo?.nombre
        });

        navigate(`/crear-turno?${params.toString()}`);
    };

    // Función para formatear fechas
    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatearHora = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Funciones para paginación de turnos por persona
    const getTurnosCurrentPage = (persona) => {
        return turnosPagination[persona] || 1;
    };

    const setTurnosCurrentPage = (persona, page) => {
        setTurnosPagination(prev => ({
            ...prev,
            [persona]: page
        }));
    };

    // Función para obtener items por página de una persona específica
    const getTurnosItemsPerPage = (persona) => {
        return turnosItemsPerPage[persona] || 5; // Valor por defecto: 5
    };

    // Función para establecer items por página para una persona específica
    const setTurnosItemsPerPersona = (persona, items) => {
        setTurnosItemsPerPage(prev => ({
            ...prev,
            [persona]: items
        }));
        // Resetear a la primera página cuando se cambia el número de items
        setTurnosCurrentPage(persona, 1);
    };

    const getTurnosPaginatedData = (turnosPersona, persona) => {
        const currentPage = getTurnosCurrentPage(persona);
        const itemsPerPage = getTurnosItemsPerPage(persona);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return turnosPersona.slice(startIndex, endIndex);
    };

    const getTurnosTotalPages = (turnosPersona, persona) => {
        const itemsPerPage = getTurnosItemsPerPage(persona);
        return Math.ceil(turnosPersona.length / itemsPerPage);
    };

    // Funciones de navegación para turnos
    const goToTurnosPage = (persona, page) => {
        setTurnosCurrentPage(persona, page);
    };

    const goToTurnosPrevious = (persona, turnosPersona) => {
        const currentPage = getTurnosCurrentPage(persona);
        if (currentPage > 1) {
            setTurnosCurrentPage(persona, currentPage - 1);
        }
    };

    const goToTurnosNext = (persona, turnosPersona) => {
        const currentPage = getTurnosCurrentPage(persona);
        const totalPages = getTurnosTotalPages(turnosPersona, persona);
        if (currentPage < totalPages) {
            setTurnosCurrentPage(persona, currentPage + 1);
        }
    };

    // Función para generar números de página visibles para turnos
    const getTurnosVisiblePageNumbers = (persona, turnosPersona) => {
        const currentPage = getTurnosCurrentPage(persona);
        const totalPages = getTurnosTotalPages(turnosPersona, persona);
        const delta = 1;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Obtener datos del equipo
    useEffect(() => {
        const fetchEquipo = async () => {
            if (!equipoId) return;

            try {
                setLoading(true);
                setError(null);

                const equipoData = await apiTurnoService.auxiliares.getEquipoInfo(equipoId);
                setEquipo(equipoData);

            } catch (err) {
                setError('Error al cargar el equipo');
                console.error('Error al cargar equipo:', err);
                setEquipo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipo();
    }, [equipoId]);

    // Obtener miembros del equipo
    useEffect(() => {
        const loadMiembrosEquipo = async () => {
            if (!equipoId) return;

            try {
                setLoadingMiembros(true);
                setErrorMiembros(null);

                const miembrosData = await apiTurnoService.auxiliares.getMiembrosPerfilEquipo(equipoId);
                setMiembros(miembrosData);

            } catch (error) {
                console.error("Error al obtener miembros del equipo:", error);
                setErrorMiembros("Error al cargar los miembros del equipo");
                setMiembros([]);
            } finally {
                setLoadingMiembros(false);
            }
        };

        loadMiembrosEquipo();
    }, [equipoId]);

    // Obtener datos del turno
    useEffect(() => {
        const fetchTurnos = async () => {
            if (!cuadroId) return;

            try {
                setLoading(true);
                setError(null);

                const turnosData = await apiTurnoService.turnos.getTurnosAbiertosByCuadro(cuadroId);
                setTurnos(turnosData);

            } catch (err) {
                setError('Error al cargar turnos');
                console.error('Error al cargar turnos:', err);
                setTurnos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [cuadroId]);

    // Agrupar turnos por persona
    const turnosPorPersona = turnos.reduce((acc, turno) => {
        const persona = turno.nombrePersona || "Sin asignar";
        if (!acc[persona]) {
            acc[persona] = [];
        }
        acc[persona].push(turno);
        return acc;
    }, {});

    // Lógica de paginación para personas
    const personas = Object.keys(turnosPorPersona);
    const totalPages = Math.ceil(personas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPersonas = personas.slice(startIndex, endIndex);

    // Funciones para cambiar página de personas
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Función para generar números de página visibles para personas
    const getVisiblePageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-4 rounded-lg flex flex-col gap-2 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                    <CalendarClock size={40} className="text-primary-green-husj" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Gestion de Turnos
                    </h1>
                </div>

                {/* Header */}
                <div className='flex items-center justify-center mb-0'>
                    <div className='flex items-center gap-2'>
                        <div>
                            <p className='text-gray-600'>Visualización de datos del Cuadro seleccionado</p>
                        </div>
                    </div>
                </div>

                {/* Nombre del cuadro */}
                <div className='text-2xl text-center font-bold mb-0'>Cuadro de Turno: </div>
                <div className=' text-center text-sm font-bold text-black-500 mb-0 bg-blue-50 p-2 rounded-lg border'>{cuadroNombre || `Cuadro ID: ${cuadroId}`}</div>

                {/* Equipo de Trabajo */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-xl font-semibold flex items-center justify-center gap-2'>
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
                                        <th></th>
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

                <div className='text-4xl font-bold flex items-center gap-2 pb-4 w-full justify-center'>
                    Turnos
                    <CalendarPlus
                        size={50}
                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                        onClick={handleCrearTurno}
                        title="Crear nuevo turno"
                    />
                </div>

                {/* Selector de elementos por página para personas */}
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-600">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={1}>1</option>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">personas por página</span>
                </div>

                {/* Datos de Turnos Agrupados por Persona */}
                <div className='bg-white rounded-lg border'>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando turnos...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {error}
                        </div>
                    ) : turnos.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontraron turnos para este cuadro
                        </div>
                    ) : (
                        <div className="space-y-6 p-4">
                            {currentPersonas.map((persona) => {
                                const turnosPersona = turnosPorPersona[persona].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
                                const totalHoras = turnosPersona.reduce((sum, turno) => sum + (turno.totalHoras || 0), 0);

                                // Paginación para los turnos de esta persona
                                const currentTurnosPage = getTurnosCurrentPage(persona);
                                const turnosPaginados = getTurnosPaginatedData(turnosPersona, persona);
                                const turnosTotalPages = getTurnosTotalPages(turnosPersona, persona);
                                const currentItemsPerPage = getTurnosItemsPerPage(persona);

                                return (
                                    <div key={persona} className="border rounded-lg overflow-hidden">
                                        {/* Encabezado de la persona con selector de items por página */}
                                        <div className="bg-gray-800 text-white px-4 py-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <User size={20} />
                                                    {persona}
                                                </h3>
                                                <div className="flex gap-4 text-sm">
                                                    <span>Turnos: {turnosPersona.length}</span>
                                                    <span>Total Horas: {totalHoras}</span>
                                                </div>
                                            </div>

                                            {/* Selector de turnos por página para esta persona específica */}
                                            <div className="flex items-center justify-end gap-2 text-sm">
                                                <span className="text-gray-300">Mostrar:</span>
                                                <select
                                                    value={currentItemsPerPage}
                                                    onChange={(e) => setTurnosItemsPerPersona(persona, Number(e.target.value))}
                                                    className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                                                >
                                                    <option value={3}>3</option>
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={25}>25</option>
                                                </select>
                                                <span className="text-gray-300">turnos por página</span>
                                            </div>
                                        </div>

                                        {/* Tabla de turnos de la persona */}
                                        <div className="overflow-x-auto">
                                            <table className='w-full'>
                                                <thead className='bg-gray-100'>
                                                    <tr className='text-xs'>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            ID
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Fecha Inicio
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Hora Inicio
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Fecha Fin
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Hora Fin
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Horas
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Jornada
                                                        </th>
                                                        <th className='px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider'>
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-200'>
                                                    {turnosPaginados.map((turno, index) => (
                                                        <tr key={turno.idTurno} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                                            <td className='px-3 py-2 text-sm text-gray-700'>
                                                                {turno.idTurno}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900'>
                                                                {formatearFecha(turno.fechaInicio)}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900'>
                                                                {formatearHora(turno.fechaInicio)}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900'>
                                                                {formatearFecha(turno.fechaFin)}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900'>
                                                                {formatearHora(turno.fechaFin)}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900 font-medium'>
                                                                {turno.totalHoras || 0}
                                                            </td>
                                                            <td className='px-3 py-2 text-sm text-gray-900'>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${turno.jornada === "Mañana" ? "bg-yellow-100 text-yellow-800" :
                                                                    turno.jornada === "Tarde" ? "bg-green-100 text-green-800" :
                                                                        turno.jornada === "Noche" ? "bg-blue-100 text-blue-800" :
                                                                            "bg-gray-100 text-gray-800"
                                                                    }`}>
                                                                    {turno.jornada || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className='px-3 py-2 text-sm font-medium'>
                                                                <div className="flex gap-2">
                                                                    <Link
                                                                        to={`/ver-turno/${turno.idTurno}?cuadroNombre=${cuadroNombre}&equipoNombre=${equipo.nombre}`}
                                                                        title={`Ver turno: ${persona}`}
                                                                        className="inline-block"
                                                                    >
                                                                        <CalendarSearch
                                                                            size={18}
                                                                            className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
                                                                        />
                                                                    </Link>

                                                                    <Link
                                                                        to={`/editar-turno/${turno.idTurno}?cuadroNombre=${cuadroNombre}&equipoNombre=${equipo.nombre}&equipoId=${equipoId}`}
                                                                        title={`Editar turno: ${persona}`}
                                                                        className="inline-block"
                                                                    >
                                                                        <CalendarSync
                                                                            size={18}
                                                                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                                                        />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Paginación para turnos de cada persona */}
                                        {turnosTotalPages > 1 && (
                                            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center text-sm">
                                                <div className="text-gray-600">
                                                    Mostrando {((currentTurnosPage - 1) * currentItemsPerPage) + 1} a {Math.min(currentTurnosPage * currentItemsPerPage, turnosPersona.length)} de {turnosPersona.length} turnos
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {/* Botón anterior */}
                                                    <button
                                                        onClick={() => goToTurnosPrevious(persona, turnosPersona)}
                                                        disabled={currentTurnosPage === 1}
                                                        className={`p-1 rounded ${currentTurnosPage === 1
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </button>

                                                    {/* Números de página */}
                                                    {getTurnosVisiblePageNumbers(persona, turnosPersona).map((pageNumber, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => pageNumber !== '...' && goToTurnosPage(persona, pageNumber)}
                                                            disabled={pageNumber === '...'}
                                                            className={`px-2 py-1 rounded text-xs ${pageNumber === currentTurnosPage
                                                                ? 'bg-blue-500 text-white'
                                                                : pageNumber === '...'
                                                                    ? 'text-gray-400 cursor-default'
                                                                    : 'text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    ))}

                                                    {/* Botón siguiente */}
                                                    <button
                                                        onClick={() => goToTurnosNext(persona, turnosPersona)}
                                                        disabled={currentTurnosPage === turnosTotalPages}
                                                        className={`p-1 rounded ${currentTurnosPage === turnosTotalPages
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Información de paginación y controles para personas */}
                {personas.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Información de registros */}
                        <div className="text-sm text-gray-600">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, personas.length)} de {personas.length} personas
                        </div>

                        {/* Controles de paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {getVisiblePageNumbers().map((pageNumber, index) => (
                                    <button
                                        key={index}
                                        onClick={() => pageNumber !== '...' && goToPage(pageNumber)}
                                        disabled={pageNumber === '...'}
                                        className={`px-3 py-1 rounded text-sm ${pageNumber === currentPage
                                            ? 'bg-blue-500 text-white'
                                            : pageNumber === '...'
                                                ? 'text-gray-400 cursor-default'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    onClick={goToNext}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Botón de volver */}
                <div className='flex justify-center gap-4 pt-4 '>
                    <Link to="/selector-cuadro-turno">
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
