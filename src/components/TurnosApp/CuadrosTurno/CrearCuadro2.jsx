import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon } from 'lucide-react';
import axios from 'axios';

export default function SiguientePaso() {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [optionId, setOptionId] = useState('');
    //console.log("Options:", options);
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                // Determinar qué endpoint llamar según la categoría
                let endpoint = '';
                switch (categoria) {
                    case 'Macroproceso':
                        endpoint = 'http://localhost:8080/macroprocesos';
                        setOptionId('idMacroproceso');
                        break;
                    case 'Proceso':
                        endpoint = 'http://localhost:8080/procesos';
                        setOptionId('idProceso');
                        break;
                    case 'Servicio':
                        endpoint = 'http://localhost:8080/servicio';
                        setOptionId('idServicio');
                        break;
                    case 'Sección':
                        endpoint = 'http://localhost:8080/seccionesServicio';
                        setOptionId('idSeccionServicio');
                        break;
                    case 'Subsección':
                        endpoint = 'http://localhost:8080/subseccionesServicio';
                        setOptionId('idSubseccionServicio');
                        break;
                    case 'Multiproceso':
                        endpoint = 'http://localhost:8080/procesosAtencion';
                        setOptionId('idProcesoAtencion');
                        break;
                    default:
                        break;
                }

                if (endpoint) {
                    const response = await axios.get(endpoint);
                    setOptions(response.data);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error al cargar opciones:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoria) {
            fetchOptions();
        }
    }, [categoria]);

    // const handleChange = (e) => {
    //     setSelectedOption(e.target.value);
    // };

    const handleChange = (e) => {
        const selectedId = e.target.value;
        const selectedObj = options.find(option => option[optionId]?.toString() === selectedId);
        setSelectedOption(selectedObj);
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Crear Cuadro de Turno</div>

                <div className='text-lg text-center font-semibold'>
                    Categoría seleccionada: {categoria}
                </div>

                <div className="w-full">
                    <label htmlFor="select" className="block text-sm font-medium text-gray-700 mb-2">
                        Selecciona un {categoria}
                    </label>

                    {loading ? (
                        <p>Cargando opciones...</p>
                    ) : error ? (
                        <p className="text-red-500">Error al cargar opciones: {error}</p>
                    ) : (
                        <select
                            id="select"
                            value={selectedOption ? selectedOption[optionId] : ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona --</option>
                            {options.map((option) => (
                                <option key={option[optionId]} value={option[optionId]}>
                                    {option.nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedOption && (
                        <p className="mt-2 text-xs text-gray-600">Seleccionaste: {selectedOption?.nombre}</p>
                    )}
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link
                        to={selectedOption ?
                            (categoria === 'Multiproceso' ?
                                `/crearCuadro4?categoria=${encodeURIComponent(categoria)}&seleccion=${encodeURIComponent(selectedOption.nombre)}&seleccionId=${encodeURIComponent(selectedOption[optionId])}` :
                                `/crearCuadro3?categoria=${encodeURIComponent(categoria)}&seleccion=${encodeURIComponent(selectedOption.nombre)}&seleccionId=${encodeURIComponent(selectedOption[optionId])}`) :
                            "#"}
                    >
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedOption
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedOption}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Aceptar
                        </button>
                    </Link>

                    <Link to="/crearCuadro">
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