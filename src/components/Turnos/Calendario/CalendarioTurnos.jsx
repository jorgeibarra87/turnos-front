// components/CalendarioTurnos.js
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye, Edit, User, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalendarioTurnos } from '../Calendario/hooks/useCalendarioTurnos';
import { useCuadrosTurno } from '../Calendario/hooks/useCuadrosTurno';
import { useProcesos } from '../Calendario/hooks/useProcesos';
import { usePerfiles } from '../Calendario/hooks/usePerfiles';

export default function CalendarioTurnos() {
    const navigate = useNavigate();
    const [fechaActual, setFechaActual] = useState(new Date());
    const [filtros, setFiltros] = useState({
        cuadroTurno: '',
        proceso: '',
        perfil: '',
        mes: fechaActual.getMonth().toString()
    });

    // Hooks
    const { cuadrosTurno, loading: loadingCuadros } = useCuadrosTurno();
    const { procesos, loading: loadingProcesos } = useProcesos(filtros.cuadroTurno);
    const { perfiles, loading: loadingPerfiles } = usePerfiles(filtros.cuadroTurno);
    const { turnos, loading: loadingTurnos, error } = useCalendarioTurnos(filtros, fechaActual);

    // Función para calcular duración total del turno
    const calcularDuracionTurno = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return 0;

        const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
        const [finHora, finMin] = horaFin.split(':').map(Number);

        let inicioEnMinutos = inicioHora * 60 + inicioMin;
        let finEnMinutos = finHora * 60 + finMin;

        if (finEnMinutos < inicioEnMinutos) {
            finEnMinutos += 24 * 60;
        }

        const diferencia = finEnMinutos - inicioEnMinutos;
        return Math.round(diferencia / 60);
    };

    // Obtener semanas del mes
    const obtenerSemanasDelMes = () => {
        const año = fechaActual.getFullYear();
        const mes = fechaActual.getMonth();
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);

        const semanas = [];
        let fechaActualSemana = new Date(primerDia);

        const diaSemana = fechaActualSemana.getDay();
        const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        fechaActualSemana.setDate(fechaActualSemana.getDate() - diasHastaLunes);

        let semanaNum = 1;
        while (fechaActualSemana <= ultimoDia) {
            const semana = {
                numero: semanaNum++,
                dias: []
            };

            for (let i = 0; i < 7; i++) {
                const fecha = new Date(fechaActualSemana);
                semana.dias.push({
                    fecha: fecha,
                    fechaString: fecha.toISOString().split('T')[0],
                    esMesActual: fecha.getMonth() === mes
                });
                fechaActualSemana.setDate(fechaActualSemana.getDate() + 1);
            }

            semanas.push(semana);
            if (fechaActualSemana.getMonth() > mes) break;
        }

        return semanas;
    };

    // FUNCIÓN CORREGIDA para obtener turnos por fecha
    const obtenerTurnosPorFecha = (fechaString) => {
        console.log('Buscando turnos para fecha:', fechaString);
        console.log('Total turnos disponibles:', turnos.length);

        const turnosDelDia = turnos.filter(turno => {
            if (!turno.fechaInicio) return false;

            // Normalizar formato de fecha del turno
            let fechaTurnoString;
            if (turno.fechaInicio.includes('T')) {
                fechaTurnoString = turno.fechaInicio.split('T')[0];
            } else {
                fechaTurnoString = turno.fechaInicio;
            }

            const coincide = fechaTurnoString === fechaString;
            if (coincide) {
                console.log(`✓ Turno encontrado para ${fechaString}:`, turno);
            }
            return coincide;
        });

        console.log(`Turnos encontrados para ${fechaString}:`, turnosDelDia);
        return turnosDelDia;
    };

    const calcularHorasSemana = (semana) => {
        let total = 0;
        semana.dias.forEach(dia => {
            const turnosDia = obtenerTurnosPorFecha(dia.fechaString);
            total += turnosDia.reduce((sum, turno) => sum + (turno.totalHoras || 0), 0);
        });
        return total;
    };

    const navegarMes = (direccion) => {
        const nuevaFecha = new Date(fechaActual);
        nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
        setFechaActual(nuevaFecha);
        setFiltros({ ...filtros, mes: nuevaFecha.getMonth().toString() });
    };

    const handleVerTurno = (turno) => {
        const cuadroSeleccionado = cuadrosTurno.find(c => c.idCuadroTurno.toString() === filtros.cuadroTurno);
        const cuadroNombre = cuadroSeleccionado?.nombre || '';
        const equipoNombre = cuadroSeleccionado?.equipoNombre || '';

        navigate(`/ver-turno/${turno.idTurno}?cuadroNombre=${encodeURIComponent(cuadroNombre)}&equipoNombre=${encodeURIComponent(equipoNombre)}`);
    };

    const handleEditarTurno = (turno) => {
        navigate(`/editar-turno/${turno.idTurno}`);
    };

    const handleCuadroChange = (e) => {
        setFiltros({
            ...filtros,
            cuadroTurno: e.target.value,
            proceso: '',
            perfil: ''
        });
    };

    const aplicarFiltros = () => {
        console.log('Filtros aplicados:', filtros);
    };

    const semanas = obtenerSemanasDelMes();
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    if (loadingCuadros) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-600" size={32} />
                        Calendario de Turnos
                    </h1>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navegarMes(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-semibold min-w-[200px] text-center">
                            {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                        </h2>
                        <button onClick={() => navegarMes(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cuadro de Turno:</label>
                        <select
                            value={filtros.cuadroTurno}
                            onChange={handleCuadroChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecciona Cuadro Turno</option>
                            {cuadrosTurno.map(cuadro => (
                                <option key={cuadro.idCuadroTurno} value={cuadro.idCuadroTurno}>
                                    {cuadro.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Proceso:</label>
                        <select
                            value={filtros.proceso}
                            onChange={(e) => setFiltros({ ...filtros, proceso: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={!filtros.cuadroTurno || loadingProcesos}
                        >
                            <option value="">
                                {loadingProcesos ? 'Cargando...' : 'Selecciona Proceso'}
                            </option>
                            {procesos.map(proceso => (
                                <option key={proceso.idProceso || proceso.id} value={proceso.idProceso || proceso.id}>
                                    {proceso.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Perfil:</label>
                        <select
                            value={filtros.perfil}
                            onChange={(e) => setFiltros({ ...filtros, perfil: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={!filtros.cuadroTurno || loadingPerfiles}
                        >
                            <option value="">
                                {loadingPerfiles ? 'Cargando...' : 'Selecciona Perfil'}
                            </option>
                            {perfiles.map(perfil => (
                                <option key={perfil.id} value={perfil.nombre}>
                                    {perfil.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mes:</label>
                        <select
                            value={filtros.mes}
                            onChange={(e) => {
                                const nuevoMes = parseInt(e.target.value);
                                const nuevaFecha = new Date(fechaActual);
                                nuevaFecha.setMonth(nuevoMes);
                                setFechaActual(nuevaFecha);
                                setFiltros({ ...filtros, mes: e.target.value });
                            }}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {meses.map((mes, index) => (
                                <option key={index} value={index}>{mes}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={aplicarFiltros}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        disabled={loadingTurnos}
                    >
                        {loadingTurnos ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Eye size={18} />
                        )}
                        {loadingTurnos ? 'Cargando...' : 'Ver Turnos'}
                    </button>

                    {/* BOTÓN DEBUG TEMPORAL */}
                    {/* <button
                        onClick={() => {
                            console.log('=== DEBUG MANUAL ===');
                            console.log('Filtros actuales:', filtros);
                            console.log('Fecha actual del calendario:', fechaActual);
                            console.log('Turnos cargados:', turnos);
                            console.log('Cuadros disponibles:', cuadrosTurno);

                            // Verificar específicamente el día 5 de agosto
                            const fecha5Agosto = '2025-08-05';
                            const turnosDia5 = turnos.filter(t => {
                                const fecha = t.fechaInicio?.includes('T') ? t.fechaInicio.split('T')[0] : t.fechaInicio;
                                return fecha === fecha5Agosto;
                            });
                            console.log(`Turnos para ${fecha5Agosto}:`, turnosDia5);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    >
                        DEBUG
                    </button> */}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Información del cuadro seleccionado */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Calendario Turnos de Selección:</h3>
                    <div className="p-1 bg-gray-100 rounded-lg">
                        <span className="font-medium">Cuadro de turno:</span>
                        <div className="text-sm text-gray-600">
                            {filtros.cuadroTurno
                                ? cuadrosTurno.find(c => c.idCuadroTurno.toString() === filtros.cuadroTurno)?.nombre
                                : 'No seleccionado'
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendario */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header del calendario */}
                <div className="grid grid-cols-8 bg-gray-800 text-white">
                    <div className="p-4 text-center font-medium border-r border-gray-700">Semana</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Lun</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Mar</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Mié</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Jue</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Vie</div>
                    <div className="p-4 text-center font-medium border-r border-gray-700">Sáb</div>
                    <div className="p-4 text-center font-medium">Dom</div>
                </div>

                {/* FILAS DE SEMANAS - AQUÍ ESTÁ LA SECCIÓN CON DEBUG */}
                {semanas.map((semana, semanaIndex) => (
                    <div key={semanaIndex} className="grid grid-cols-8 border-b border-gray-200 min-h-[200px]">
                        {/* Columna de semana */}
                        <div className="bg-gray-100 p-4 border-r border-gray-200 flex flex-col items-center justify-center">
                            <div className="text-lg font-bold mb-2">Semana {semana.numero}</div>
                            <div className="text-sm text-gray-600 mb-1">Total Horas:</div>
                            <div className="text-xl font-bold text-blue-600">{calcularHorasSemana(semana)}</div>
                        </div>

                        {/* DÍAS DE LA SEMANA - AQUÍ VA TU CÓDIGO DEBUG */}
                        {semana.dias.map((dia, diaIndex) => {
                            const turnosDia = obtenerTurnosPorFecha(dia.fechaString);
                            const totalHorasDia = turnosDia.reduce((sum, turno) => sum + (turno.totalHoras || 0), 0);

                            // DEBUG: Mostrar información del día 5
                            if (dia.fecha.getDate() === 5) {
                                console.log(`=== DÍA 5 DE AGOSTO ===`);
                                console.log('Fecha string:', dia.fechaString);
                                console.log('Es mes actual:', dia.esMesActual);
                                console.log('Turnos encontrados:', turnosDia);
                                console.log('Total horas:', totalHorasDia);
                            }

                            return (
                                <div key={diaIndex} className={`p-2 border-r border-gray-200 ${!dia.esMesActual ? 'bg-gray-50' : ''}`}>
                                    {/* Header del día */}
                                    {/* <div className="flex justify-between items-center mb-2">

                                        {totalHorasDia > 0 && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {totalHorasDia}h
                                            </span>
                                        )}
                                    </div> */}

                                    {/* CARDS DE TURNOS */}
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {turnosDia.length === 0 && dia.fecha.getDate() === 5}

                                        {turnosDia.map((turno, turnoIndex) => {
                                            const duracionCalculada = calcularDuracionTurno(turno.horaInicio, turno.horaFin);

                                            return (
                                                <div
                                                    key={turnoIndex}
                                                    className="bg-blue-50 border border-blue-200 rounded p-2 text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                                                    onClick={() => handleVerTurno(turno)}
                                                >
                                                    {/* Header de la Card - Duración total destacada */}
                                                    <div className="flex justify-between items-center mb-1">
                                                        {/* <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                            {duracionCalculada}h
                                                        </span> */}
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                            {turno.totalHoras || duracionCalculada}h
                                                        </span>
                                                    </div>

                                                    {/* Nombre de la persona - MÁS PROMINENTE */}
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <User size={12} className="text-blue-600" />
                                                        <span className="font-bold text-blue-800 text-xs leading-tight">
                                                            {turno.nombrePersona || 'Sin asignar'}
                                                        </span>
                                                    </div>

                                                    {/* Horario - MÁS VISIBLE */}
                                                    <div className="flex items-center justify-center bg-gray-100 rounded p-1 mb-1">
                                                        <Clock size={12} className="text-gray-600 mr-1" />
                                                        <span className="text-gray-800 font-medium text-xs">
                                                            {turno.horaInicio} - {turno.horaFin}
                                                        </span>
                                                    </div>

                                                    {/* Perfil - MÁS DESTACADO como en la imagen */}
                                                    <div className="text-center mb-1">
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium block">
                                                            {turno.perfil || 'Sin perfil'}
                                                        </span>
                                                    </div>

                                                    {/* Jornada - Similar a la imagen */}
                                                    <div className="text-center mb-2">
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                            {turno.jornada || 'Sin especificar'}
                                                        </span>
                                                    </div>

                                                    {/* Botones de acción */}
                                                    <div className="flex gap-1 justify-center mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVerTurno(turno);
                                                            }}
                                                            className="p-1 hover:bg-blue-200 rounded transition-colors"
                                                            title="Ver turno"
                                                        >
                                                            <Eye size={12} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditarTurno(turno);
                                                            }}
                                                            className="p-1 hover:bg-green-200 rounded transition-colors"
                                                            title="Editar turno"
                                                        >
                                                            <Edit size={12} className="text-green-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Loading específico por día */}
                                    {loadingTurnos && turnosDia.length === 0 && (
                                        <div className="text-xs text-center text-gray-500 mt-2">
                                            <div className="animate-pulse">Cargando...</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Resumen del Mes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {turnos.reduce((sum, turno) => sum + (turno.totalHoras || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Horas</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{turnos.length}</div>
                            <div className="text-sm text-gray-600">Total Turnos</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {[...new Set(turnos.map(t => t.nombrePersona))].length}
                            </div>
                            <div className="text-sm text-gray-600">Personas Asignadas</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
