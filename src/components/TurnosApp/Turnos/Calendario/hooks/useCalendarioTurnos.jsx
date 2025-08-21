import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCalendarioTurnos = (filtros, fechaActual) => {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTurnos = async () => {
            // Si no hay cuadro seleccionado, limpiar turnos
            if (!filtros.cuadroTurno) {
                setTurnos([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('Cargando turnos para cuadro:', filtros.cuadroTurno);
                console.log('Fecha actual del calendario:', fechaActual);

                // Cargar TODOS los turnos
                const response = await axios.get('http://localhost:8080/turnos');
                console.log('Todos los turnos obtenidos:', response.data);

                let turnosFiltrados = response.data || [];

                // FILTRO PRINCIPAL: Por cuadro de turno
                turnosFiltrados = turnosFiltrados.filter(turno => {
                    const coincideCuadro = turno.idCuadroTurno?.toString() === filtros.cuadroTurno.toString();
                    console.log(`Turno ${turno.idTurno}: Cuadro ${turno.idCuadroTurno} vs Filtro ${filtros.cuadroTurno} = ${coincideCuadro}`);
                    return coincideCuadro;
                });

                console.log('Turnos después de filtrar por cuadro:', turnosFiltrados);

                // Filtro por mes y año actual del calendario
                const añoActual = fechaActual.getFullYear();
                const mesActual = fechaActual.getMonth();

                turnosFiltrados = turnosFiltrados.filter(turno => {
                    if (!turno.fechaInicio) return false;

                    //  formato de fecha
                    let fechaTurno;
                    if (turno.fechaInicio.includes('T')) {
                        // Si viene como datetime: "2025-08-05T07:00:00"
                        fechaTurno = new Date(turno.fechaInicio);
                    } else {
                        // Si viene como fecha: "2025-08-05"
                        fechaTurno = new Date(turno.fechaInicio + 'T00:00:00');
                    }

                    const cumpleFecha = fechaTurno.getFullYear() === añoActual &&
                        fechaTurno.getMonth() === mesActual;

                    console.log(`Turno ${turno.idTurno}: Fecha ${turno.fechaInicio} -> Año: ${fechaTurno.getFullYear()}, Mes: ${fechaTurno.getMonth()} vs Calendario: ${añoActual}-${mesActual} = ${cumpleFecha}`);
                    return cumpleFecha;
                });

                console.log('Turnos después de filtrar por fecha:', turnosFiltrados);

                // Filtros adicionales solo si están seleccionados
                if (filtros.proceso) {
                    turnosFiltrados = turnosFiltrados.filter(turno =>
                        turno.idProceso?.toString() === filtros.proceso.toString()
                    );
                    console.log('Turnos después de filtrar por proceso:', turnosFiltrados);
                }

                if (filtros.perfil) {
                    turnosFiltrados = turnosFiltrados.filter(turno =>
                        turno.perfil?.toLowerCase().includes(filtros.perfil.toLowerCase())
                    );
                    console.log('Turnos después de filtrar por perfil:', turnosFiltrados);
                }

                console.log('Turnos finales a mostrar:', turnosFiltrados);
                setTurnos(turnosFiltrados);

            } catch (err) {
                console.error('Error al cargar turnos:', err);
                setError('Error al cargar turnos: ' + err.message);
                setTurnos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [filtros, fechaActual]); // Ejecutar cuando cambien filtros o fecha

    return { turnos, loading, error };
};
