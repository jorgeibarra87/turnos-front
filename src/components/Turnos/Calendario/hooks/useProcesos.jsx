// hooks/useProcesos.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProcesos = (cuadroId) => {
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProcesos = async () => {
            if (!cuadroId) {
                setProcesos([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Obtener procesos específicos del cuadro de turno
                const response = await axios.get(`http://localhost:8080/cuadro-turnos/${cuadroId}/procesos`);
                setProcesos(response.data || []);
            } catch (err) {
                console.error('Error al cargar procesos:', err);
                // Fallback: cargar todos los procesos
                try {
                    const response = await axios.get('http://localhost:8080/procesos');
                    setProcesos(response.data || []);
                } catch (fallbackErr) {
                    setProcesos([]);
                    setError('Error al cargar procesos');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProcesos();
    }, [cuadroId]);

    return { procesos, loading, error };
};
