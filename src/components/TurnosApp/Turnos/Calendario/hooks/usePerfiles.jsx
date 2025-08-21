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
                    // USAR EL MISMO ENDPOINT QUE EN TU CÓDIGO EJEMPLAR
                    const response = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros-perfil`);
                    console.log('Datos de miembros-perfil:', response.data);

                    // Extraer perfiles únicos de los títulos
                    const todosLosPerfiles = response.data.flatMap(miembro =>
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
                    console.log('Perfiles únicos encontrados:', perfilesUnicos);
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
