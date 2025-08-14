// hooks/usePerfiles.js
import { useState, useEffect } from 'react';
import axios from 'axios';

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

                // Obtener cuadro específico para acceder al equipo
                const cuadroResponse = await axios.get(`http://localhost:8080/cuadro-turnos/${cuadroId}`);
                const equipoId = cuadroResponse.data.idEquipo;

                if (equipoId) {
                    // Obtener miembros del equipo con sus perfiles
                    const equipoResponse = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros-perfil`);

                    // Extraer perfiles únicos
                    const todosLosPerfiles = equipoResponse.data.flatMap(miembro =>
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
                }
            } catch (err) {
                console.error('Error al cargar perfiles:', err);
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
