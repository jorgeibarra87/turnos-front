import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCuadrosTurno = () => {
    const [cuadrosTurno, setCuadrosTurno] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCuadrosTurno = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/cuadro-turnos');
                setCuadrosTurno(response.data || []);
            } catch (err) {
                console.error('Error al cargar cuadros:', err);
                setError('Error al cargar cuadros de turno');
            } finally {
                setLoading(false);
            }
        };

        fetchCuadrosTurno();
    }, []);

    return { cuadrosTurno, loading, error };
};
