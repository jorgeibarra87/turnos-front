import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon } from 'lucide-react';
import axios from 'axios';

export default function SiguientePaso() {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const seleccion = searchParams.get('seleccion');
    const seleccionId = searchParams.get('seleccionId');
    const [selectedEquipo, setSelectedEquipo] = useState({ id: "", nombre: "" });
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:8080/equipo');

                if (response.data && Array.isArray(response.data)) {
                    // Asegurarnos de que los equipos tienen idEquipo y nombre
                    const equiposFormateados = response.data.map(equipo => ({
                        idEquipo: equipo.idEquipo || equipo.id || "",
                        nombre: equipo.nombre || equipo.descripcion || "Sin nombre"
                    }));
                    setEquipos(equiposFormateados);
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

        fetchEquipos();
    }, []);

    const handleEquipoChange = (e) => {
        const equipoId = e.target.value;
        const equipoSeleccionado = equipos.find(equipo => equipo.idEquipo.toString() === equipoId.toString());

        if (equipoSeleccionado) {
            setSelectedEquipo({
                id: equipoSeleccionado.idEquipo,
                nombre: equipoSeleccionado.nombre
            });
        } else {
            setSelectedEquipo({ id: "", nombre: "" });
        }
    };

    const getNextStepUrl = () => {
        if (!selectedEquipo.id) return "#";

        const params = new URLSearchParams({
            categoria: categoria || '',
            seleccion: seleccion || '',
            seleccionId: seleccionId || '',
            equipoId: selectedEquipo.id,
            equipoNombre: selectedEquipo.nombre
        });
        //console.log("seleccionId:", seleccionId);
        const nextRoute = categoria === 'Multiproceso' ? '/crearCuadroMulti' : '/CrearCuadro4';
        return `${nextRoute}?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Crear Cuadro de Turno</div>

                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Categoría: {categoria || 'No especificada'}
                    </div>
                    <div className='text-md font-medium text-gray-700'>
                        {categoria} seleccionado: <span className="font-bold">{seleccion || 'No especificado'}</span>
                    </div>
                </div>

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
                            value={selectedEquipo.id}
                            onChange={handleEquipoChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona un equipo --</option>
                            {equipos.map((equipo, index) => (
                                <option key={equipo.idEquipo || index} value={equipo.idEquipo}>
                                    {equipo.nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedEquipo.id && (
                        <p className="text-xs font-semibold text-gray-700 p-2">Equipo seleccionado: {selectedEquipo.nombre}</p>
                    )}
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link to={getNextStepUrl()}>
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedEquipo.id
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedEquipo.id}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Aceptar
                        </button>
                    </Link>

                    <Link to={`/crearCuadro2?categoria=${encodeURIComponent(categoria || '')}`}>
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