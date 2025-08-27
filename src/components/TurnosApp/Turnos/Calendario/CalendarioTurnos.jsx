// components/CalendarioTurnos.js
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye, Edit, User, Clock, Filter, CalendarClock, Calendar1 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalendarioTurnos } from '../Calendario/hooks/useCalendarioTurnos';
import { useCuadrosTurno } from '../Calendario/hooks/useCuadrosTurno';
import { useProcesos } from '../Calendario/hooks/useProcesos';
import { usePerfiles } from '../Calendario/hooks/usePerfiles';
import ModalDetalleTurno from './ModalDetalleTurno';

export default function CalendarioTurnos() {
    const navigate = useNavigate();
    const [fechaActual, setFechaActual] = useState(new Date());
    const [filtros, setFiltros] = useState({
        cuadroTurno: '',
        proceso: '',
        perfil: '',
        mes: fechaActual.getMonth().toString()
    });

    // ESTADO PARA EL MODAL
    const [modalDetalle, setModalDetalle] = useState({
        isOpen: false,
        turno: null,
        cuadroNombre: "",
        equipoNombre: ""

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
                    esMesActual: fecha.getMonth() === mes,
                    numeroDia: fecha.getDate()
                });
                fechaActualSemana.setDate(fechaActualSemana.getDate() + 1);
            }

            semanas.push(semana);
            if (fechaActualSemana.getMonth() > mes) break;
        }

        return semanas;
    };

    // Función para obtener turnos por fecha
    const obtenerTurnosPorFecha = (fechaString) => {
        console.log('Buscando turnos para fecha:', fechaString);
        console.log('Total turnos disponibles:', turnos.length);

        const turnosDelDia = turnos.filter(turno => {
            if (!turno.fechaInicio) return false;

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

    // FUNCIÓN PARA ABRIR EL MODAL
    const handleVerTurno = (turno) => {
        const cuadroSeleccionado = cuadrosTurno.find(c => c.idCuadroTurno.toString() === filtros.cuadroTurno);
        const cuadroNombre = cuadroSeleccionado?.nombre || '';
        const nombreEquipo = cuadroSeleccionado?.nombreEquipo || '';
        console.log('Abriendo modal para turno:', turno);
        setModalDetalle({
            isOpen: true,
            turno: turno,
            cuadroNombre: cuadroNombre,
            equipoNombre: nombreEquipo
        });
    };

    // FUNCIÓN PARA CERRAR EL MODAL
    const cerrarModal = () => {
        setModalDetalle({
            isOpen: false,
            turno: null
        });
    };

    // FUNCIÓN PARA MANEJAR EDITAR TURNO
    const handleEditarTurno = (turno) => {
        const cuadroSeleccionado = cuadrosTurno.find(c => c.idCuadroTurno.toString() === filtros.cuadroTurno);
        const cuadroNombre = cuadroSeleccionado?.nombre || '';
        const nombreEquipo = cuadroSeleccionado?.nombreEquipo || '';

        console.log('Navegando a editar turno:', {
            turnoId: turno.idTurno,
            cuadroNombre,
            nombreEquipo
        });

        navigate(`/editar-turno/${turno.idTurno}?cuadroNombre=${encodeURIComponent(cuadroNombre)}&equipoNombre=${encodeURIComponent(nombreEquipo)}`);
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
        <div className="p-6 bg-gray-300 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-4 w-fit mx-2">
                        <Calendar1 size={40} className="text-primary-green-husj" />
                        <h1 className="text-4xl font-extrabold text-gray-800">
                            Calendario de Turnos
                        </h1>
                    </div>
                    {/* <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-600" size={32} />
                        Calendario de Turnos
                    </h1> */}

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

                {/* FILAS DE SEMANAS */}
                {semanas.map((semana, semanaIndex) => (
                    <div key={semanaIndex} className="grid grid-cols-8 border-b border-gray-200 min-h-[200px]">
                        {/* Columna de semana */}
                        <div className="bg-gray-100 p-4 border-r border-gray-200 flex flex-col items-center justify-center">
                            <div className="text-lg font-bold mb-2">Semana {semana.numero}</div>
                            <div className="text-sm text-gray-600 mb-1">Total Horas:</div>
                            <div className="text-xl font-bold text-blue-600">{calcularHorasSemana(semana)}</div>
                        </div>

                        {/* DÍAS DE LA SEMANA */}
                        {semana.dias.map((dia, diaIndex) => {
                            const turnosDia = obtenerTurnosPorFecha(dia.fechaString);
                            const totalHorasDia = turnosDia.reduce((sum, turno) => sum + (turno.totalHoras || 0), 0);

                            return (
                                <div key={diaIndex} className={`p-2 border-r border-gray-200 ${!dia.esMesActual ? 'bg-gray-50' : ''}`}>
                                    {/* HEADER DEL DÍA CON NÚMERO */}
                                    <div className="flex justify-between items-center mb-2">
                                        {/* NÚMERO DEL DÍA */}
                                        <div className={`text-lg font-bold px-2 py-1 rounded ${dia.esMesActual
                                            ? 'text-gray-800 bg-white '
                                            : 'text-gray-500'
                                            }`}>
                                            {dia.numeroDia}
                                        </div>

                                        {/* TOTAL HORAS DEL DÍA */}
                                        {totalHorasDia > 0 && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                                                {totalHorasDia}h
                                            </span>
                                        )}
                                    </div>

                                    {/* CARDS DE TURNOS */}
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {turnosDia.map((turno, turnoIndex) => {
                                            const duracionCalculada = calcularDuracionTurno(turno.horaInicio, turno.horaFin);

                                            return (
                                                <div
                                                    key={turnoIndex}
                                                    className="bg-blue-50 border border-blue-200 rounded p-1 text-[10px] hover:bg-blue-100 transition-colors cursor-pointer"
                                                    onClick={() => handleVerTurno(turno)}
                                                >
                                                    {/* Nombre de la persona */}
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <User size={12} className="text-blue-600" />
                                                        <span className="font-bold text-blue-800 text-[10px] leading-tight">
                                                            {turno.nombrePersona || 'Sin asignar'}
                                                        </span>
                                                    </div>

                                                    {/* Horario  */}
                                                    <div className="flex items-center justify-center bg-gray-100 rounded p-1 mb-1">
                                                        <Clock size={12} className="text-gray-600 mr-1" />
                                                        <span className="text-gray-800 font-medium text-[10px] pr-2">
                                                            {new Date(turno.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                                                            -
                                                            {new Date(turno.fechaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                                                        </span>
                                                        <span className="bg-green-100 text-green-800 rounded text-[10px] font-medium">
                                                            {turno.totalHoras || duracionCalculada}h
                                                        </span>
                                                        {/* <span className="text-gray-800 font-medium text-[10px] pr-2">
                                                            {turno.jornada || 'N/A'}
                                                        </span> */}
                                                        <span
                                                            className={
                                                                turno.jornada === 'Mañana'
                                                                    ? 'bg-yellow-100 text-yellow-800 rounded text-[10px] font-medium pl-1'
                                                                    : turno.jornada === 'Tarde'
                                                                        ? 'text-green-500 font-bold'
                                                                        : turno.jornada === 'Noche'
                                                                            ? 'text-blue-500 font-bold'
                                                                            : 'text-gray-500'
                                                            }
                                                        >
                                                            {turno.jornada === 'Mañana'
                                                                ? '(M)'
                                                                : turno.jornada === 'Tarde'
                                                                    ? '(T)'
                                                                    : turno.jornada === 'Noche'
                                                                        ? '(N)'
                                                                        : ''}
                                                        </span>
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

            {/* MODAL DE DETALLE DEL TURNO */}
            <ModalDetalleTurno
                turno={modalDetalle.turno}
                isOpen={modalDetalle.isOpen}
                cuadroNombre={modalDetalle.cuadroNombre}
                equipoNombre={modalDetalle.equipoNombre}
                onClose={cerrarModal}
            />
        </div>
    );
}