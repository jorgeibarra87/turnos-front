import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCalendarioTurnos = (filtros, fechaActual) => {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTurnos = async () => {
            if (!filtros.cuadroTurno) {
                setTurnos([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('🔄 Cargando turnos para cuadro:', filtros.cuadroTurno);
                console.log('📅 Fecha actual del calendario:', fechaActual);
                console.log('🔍 Filtros aplicados:', filtros);

                // Cargar TODOS los turnos
                const response = await axios.get('http://localhost:8081/turnos');
                console.log('✅ Todos los turnos obtenidos:', response.data);

                let turnosFiltrados = response.data || [];
                console.log('📊 Total turnos inicial:', turnosFiltrados.length);

                // FILTRO PRINCIPAL: Por cuadro de turno
                turnosFiltrados = turnosFiltrados.filter(turno => {
                    const coincideCuadro = turno.idCuadroTurno?.toString() === filtros.cuadroTurno.toString();
                    if (coincideCuadro) {
                        console.log(`✓ Turno ${turno.idTurno} pertenece al cuadro ${filtros.cuadroTurno}`);
                    }
                    return coincideCuadro;
                });
                console.log('📋 Turnos después de filtrar por cuadro:', turnosFiltrados.length);

                // Filtro por mes y año actual del calendario
                const añoActual = fechaActual.getFullYear();
                const mesActual = fechaActual.getMonth();

                turnosFiltrados = turnosFiltrados.filter(turno => {
                    if (!turno.fechaInicio) return false;

                    let fechaTurno;
                    if (turno.fechaInicio.includes('T')) {
                        fechaTurno = new Date(turno.fechaInicio);
                    } else {
                        fechaTurno = new Date(turno.fechaInicio + 'T00:00:00');
                    }

                    const cumpleFecha = fechaTurno.getFullYear() === añoActual &&
                        fechaTurno.getMonth() === mesActual;

                    return cumpleFecha;
                });
                console.log('📅 Turnos después de filtrar por fecha:', turnosFiltrados.length);

                // FILTRO POR PROCESO
                if (filtros.proceso && filtros.proceso.trim() !== '') {
                    const procesoFiltro = filtros.proceso.toString();
                    const turnosAntesProceso = turnosFiltrados.length;

                    turnosFiltrados = turnosFiltrados.filter(turno => {
                        const coincide = turno.idProceso?.toString() === procesoFiltro;
                        if (coincide) {
                            console.log(`✓ Turno ${turno.idTurno} coincide con proceso ${procesoFiltro}`);
                        }
                        return coincide;
                    });
                    console.log(`⚙️ Filtro proceso (${procesoFiltro}): ${turnosAntesProceso} → ${turnosFiltrados.length} turnos`);
                }

                // FILTRO POR PERFIL
                if (filtros.perfil) {
                    try {
                        console.log('🔍 Aplicando filtro de perfil:', filtros.perfil);

                        // Obtener cuadro específico para acceder al equipo
                        const cuadroResponse = await axios.get(`http://localhost:8081/cuadro-turnos/${filtros.cuadroTurno}`);
                        const equipoId = cuadroResponse.data.idEquipo;

                        if (equipoId) {
                            // Obtener miembros con sus perfiles
                            const miembrosResponse = await axios.get(`http://localhost:8081/equipo/${equipoId}/miembros-perfil`);
                            const miembrosConPerfil = miembrosResponse.data || [];

                            console.log('👥 Miembros con perfil obtenidos:', miembrosConPerfil);

                            // Crear mapa: idPersona -> perfiles
                            const mapaPersonaPerfiles = {};
                            miembrosConPerfil.forEach(miembro => {
                                const personaId = miembro.idPersona || miembro.id;
                                if (personaId && miembro.titulos) {
                                    mapaPersonaPerfiles[personaId.toString()] = miembro.titulos;
                                }
                            });

                            console.log('🗺️ Mapa persona-perfiles:', mapaPersonaPerfiles);

                            // Filtrar turnos por perfil
                            turnosFiltrados = turnosFiltrados.filter(turno => {
                                const personaId = turno.idPersona;

                                if (!personaId) {
                                    console.log(`⚠️ Turno ${turno.idTurno} sin idPersona asignado - se excluye del filtro de perfil`);
                                    return false;
                                }

                                const perfilesPersona = mapaPersonaPerfiles[personaId.toString()] || [];
                                const tienePerfil = perfilesPersona.some(perfil =>
                                    perfil.toLowerCase().includes(filtros.perfil.toLowerCase())
                                );

                                console.log(`👤 Turno ${turno.idTurno} - Persona ${personaId}: Perfiles [${perfilesPersona.join(', ')}] vs Filtro "${filtros.perfil}" = ${tienePerfil}`);

                                return tienePerfil;
                            });

                            console.log(`👤 Filtro perfil ("${filtros.perfil}"): ${turnosFiltrados.length} turnos encontrados`);
                        }
                    } catch (error) {
                        console.error('❌ Error al aplicar filtro de perfil:', error);
                    }
                }

                console.log('✨ Turnos finales para mostrar:', turnosFiltrados);
                console.log('📊 Resumen final:', {
                    cuadroTurno: filtros.cuadroTurno,
                    proceso: filtros.proceso || 'sin filtro',
                    perfil: filtros.perfil || 'sin filtro',
                    totalTurnos: turnosFiltrados.length,
                    fechas: turnosFiltrados.map(t => t.fechaInicio).slice(0, 5) // Primeras 5 fechas
                });

                setTurnos(turnosFiltrados);

            } catch (err) {
                console.error('❌ Error al cargar turnos:', err);
                setError('Error al cargar turnos: ' + err.message);
                setTurnos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTurnos();
    }, [filtros, fechaActual]);

    return { turnos, loading, error };
};
