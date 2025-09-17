import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarClock, CheckIcon, CircleXIcon, Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiTurnoService } from '../Services/apiTurnoService';

export function SelectorCuadroHistorial() {
    const navigate = useNavigate();
    const [selectedCuadro, setSelectedCuadro] = useState({ id: "", nombre: "" });
    const [cuadros, setCuadros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // estados para el filtrado
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroCuadros, setFiltroCuadros] = useState([]);

    // Referencia al contenedor principal
    const containerRef = useRef(null);

    //Usar apiTurnoService
    useEffect(() => {
        const fetchCuadros = async () => {
            try {
                setLoading(true);
                setError(null);

                //Usar servicio
                const cuadrosFormateados = await apiTurnoService.auxiliares.getCuadrosFormateados();
                setCuadros(cuadrosFormateados);
                setFiltroCuadros(cuadrosFormateados); // Inicializar filtrados

            } catch (err) {
                setError('Error al cargar los cuadros');
                console.error('Error al cargar cuadros:', err);
                setCuadros([]);
                setFiltroCuadros([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCuadros();
    }, []);

    // Filtrar cuadros cuando cambie el término de búsqueda
    useEffect(() => {
        if (searchTerm === '') {
            setFiltroCuadros(cuadros);
        } else {
            const filtro = cuadros.filter(cuadro =>
                cuadro.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFiltroCuadros(filtro);
        }
    }, [searchTerm, cuadros]);

    // cerrar al dar clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verificar si el clic fue fuera del contenedor principal
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Función para manejar la selección de cuadro
    const handleCuadroSelect = (cuadro) => {
        setSelectedCuadro({
            id: cuadro.idCuadroTurno,
            nombre: cuadro.nombre,
            idEquipo: cuadro.idEquipo
        });
        setSearchTerm(cuadro.nombre); // Mostrar el nombre seleccionado en el input
        setIsOpen(false); // Cerrar el dropdown
    };

    // Función para limpiar la selección
    const handleClear = () => {
        setSelectedCuadro({ id: "", nombre: "", idEquipo: null });
        setSearchTerm('');
        setIsOpen(false);
    };


    const handleHistorial = () => {
        if (!selectedCuadro.id) return;

        const params = new URLSearchParams({
            cuadroId: selectedCuadro.id,
        });

        navigate(`/gestionCuadroHistoria/${params.get('cuadroId')}`);
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {/* referencia aquí */}
            <div ref={containerRef} className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-2xl w-full mx-4'>
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                    <CalendarClock size={40} className="text-primary-green-husj" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Historial de Cuadros
                    </h1>
                </div>

                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Selecciona Cuadro de turno para ver historial
                    </div>
                </div>

                <div className="w-full relative">
                    <label htmlFor="cuadro-select" className="block text-sm font-bold text-gray-700 mb-2">
                        Buscar y Seleccionar un Cuadro
                    </label>

                    {loading ? (
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-center">
                            <p className="text-gray-500">Cargando cuadros...</p>
                        </div>
                    ) : error ? (
                        <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50">
                            <p className="text-red-500 text-center">{error}</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Input con búsqueda */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsOpen(true);
                                        // Si se borra el input, limpiar selección
                                        if (e.target.value === '') {
                                            setSelectedCuadro({ id: "", nombre: "", idEquipo: null });
                                        }
                                    }}
                                    onClick={() => setIsOpen(true)}
                                    placeholder="Buscar cuadro..."
                                    className=" text-xs w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                {/* Iconos del input */}
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
                                    {searchTerm && (
                                        <button
                                            onClick={handleClear}
                                            className="text-gray-400 hover:text-gray-600"
                                            type="button"
                                        >
                                            <CircleXIcon size={16} />
                                        </button>
                                    )}
                                    <Search size={16} className="text-gray-400" />
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Dropdown de opciones */}
                            {isOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filtroCuadros.length === 0 ? (
                                        <div className="px-4 py-2 text-gray-500 text-center">
                                            {searchTerm ? 'No se encontraron cuadros' : 'No hay cuadros disponibles'}
                                        </div>
                                    ) : (
                                        filtroCuadros.map((cuadro, index) => (
                                            <button
                                                key={cuadro.idCuadroTurno || index}
                                                onClick={() => handleCuadroSelect(cuadro)}
                                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${selectedCuadro.id === cuadro.idCuadroTurno ? 'bg-blue-100' : ''
                                                    }`}
                                            >
                                                <div className="text-xs">{cuadro.nombre}</div>
                                                {cuadro.nombreEquipo && (
                                                    <div className="text-xs text-gray-500">
                                                        Equipo: {cuadro.nombreEquipo}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedCuadro.id && (
                        <p className="text-xs font-extralight text-gray-700 p-2">
                            Cuadro seleccionado: {selectedCuadro.nombre}
                        </p>
                    )}
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <button
                        onClick={handleHistorial}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedCuadro.id
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        disabled={!selectedCuadro.id}
                    >
                        <CheckIcon size={20} color="white" strokeWidth={2} />
                        Ver Historial
                    </button>

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