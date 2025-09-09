import { useState, useEffect } from 'react';
import { apiTurnoService } from '../../../Services/apiTurnoService';

export const usePerfiles = (cuadroId) => {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerfiles = async () => {
            if (!cuadroId) {
                setPerfiles([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('🔄 Cargando perfiles para cuadro:', cuadroId);

                // Obtener cuadro específico para acceder al equipo
                const cuadroResponse = await apiTurnoService.auxiliares.getCuadrosTurno();
                const cuadroSeleccionado = cuadroResponse.find(c => c.idCuadroTurno?.toString() === cuadroId.toString());

                if (!cuadroSeleccionado?.idEquipo) {
                    console.log('⚠️ No se encontró equipo para el cuadro:', cuadroId);
                    setPerfiles([]);
                    return;
                }

                const equipoId = cuadroSeleccionado.idEquipo;
                console.log('🏢 Equipo ID encontrado:', equipoId);

                // USAR SERVICIO API
                const miembrosData = await apiTurnoService.auxiliares.getMiembrosPerfilEquipo(equipoId);
                console.log('👥 Datos de miembros-perfil:', miembrosData);

                // Extraer perfiles únicos de los títulos
                const todosLosPerfiles = miembrosData.flatMap(miembro =>
                    miembro.titulos || []
                );

                const perfilesUnicos = [...new Set(todosLosPerfiles)]
                    .filter(perfil => perfil && perfil.trim())
                    .map(perfil => ({
                        id: perfil,
                        nombre: perfil.trim()
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));

                setPerfiles(perfilesUnicos);
                console.log('✅ Perfiles únicos encontrados:', perfilesUnicos);

            } catch (err) {
                console.error('❌ Error al cargar perfiles:', err);
                setError('Error al cargar perfiles');
                setPerfiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfiles();
    }, [cuadroId]);

    return { perfiles, loading, error };
};
