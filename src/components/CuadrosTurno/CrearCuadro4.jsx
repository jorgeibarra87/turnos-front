import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon } from 'lucide-react';
import axios from 'axios';

export default function SiguientePaso() {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const seleccion = searchParams.get('seleccion');
    const equipo = searchParams.get('equipo');
    const [selectedEquipo, setSelectedEquipo] = useState("");
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:8080/equipo');

                // Verificar que la respuesta tenga datos
                if (response.data && Array.isArray(response.data)) {
                    setEquipos(response.data);
                } else {
                    setEquipos([]);
                    console.warn('La respuesta no contiene un array de equipos');
                }

            } catch (err) {
                setError('Error al cargar los equipos');
                console.error('Error al cargar equipos:', err);
                setEquipos([]);
            } finally {
                setLoading(false);
            }
        };

        // Cargar equipos al montar el componente
        fetchEquipos();
    }, []); // Solo se ejecuta una vez al montar

    const handleEquipoChange = (e) => {
        setSelectedEquipo(e.target.value);
    };

    // Función para generar la URL del siguiente paso
    const getNextStepUrl = () => {
        if (!selectedEquipo) return "#";

        const params = new URLSearchParams({
            categoria: categoria || '',
            seleccion: seleccion || '',
            equipo: selectedEquipo
        });

        // Determinar la ruta según la categoría
        const nextRoute = categoria === 'Multiproceso' ? '/crearCuadro4' : '/crearCuadro3';
        return `${nextRoute}?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Crear Cuadro de Turno</div>

                {/* Mostrar información de selección previa */}
                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Categoría: {categoria || 'No especificada'}
                    </div>
                    <div className='text-md font-medium text-gray-700'>
                        {categoria} seleccionado: <span className="font-bold">{seleccion || 'No especificado'}</span>
                    </div>
                    <div className='text-md font-medium text-gray-700'>
                        Equipo: <span className="font-bold">{equipo || 'No especificado'}</span>
                    </div>
                </div>

                {/* Selector de equipos */}
                <div className="w-full">
                    <label htmlFor="equipo-select" className="block text-sm font-bold text-gray-700 mb-2">
                        Selecciona un Equipo
                    </label>

                    {loading ? (
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-center">
                            <p className="text-gray-500">Cargando equipos...</p>
                        </div>
                    ) : error ? (
                        <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50">
                            <p className="text-red-500 text-center">{error}</p>
                        </div>
                    ) : (
                        <select
                            id="equipo-select"
                            value={selectedEquipo}
                            onChange={handleEquipoChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona un equipo --</option>
                            {equipos.map((equipo, index) => (
                                <option key={equipo.id || index} value={equipo.nombre}>
                                    {equipo.nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedEquipo && (
                        <p className="mt-2 text-xs text-green-600">
                            Equipo seleccionado: <strong>{selectedEquipo}</strong>
                        </p>
                    )}
                </div>

                {/* Botones de acción */}
                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link to={getNextStepUrl()}>
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedEquipo
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedEquipo}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Aceptar
                        </button>
                    </Link>

                    <Link to={`/crearCuadro3?categoria=${encodeURIComponent(categoria || '')}`}>
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors">
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                    </Link>

                    <Link to="/">
                        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                            <CircleXIcon size={20} color="white" strokeWidth={2} />
                            Cancelar
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}