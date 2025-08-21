import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon, Edit } from 'lucide-react';
import axios from 'axios';
export default function SiguientePaso() {
    const [searchParams] = useSearchParams();
    const procesos = searchParams.get('procesos');
    const isEditMode = searchParams.get('edit') === 'true';
    const cuadroId = searchParams.get('id');
    const categoria = "Multiproceso";
    const [selectedEquipo, setSelectedEquipo] = useState({ id: "", nombre: "" });
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cuadroOriginal, setCuadroOriginal] = useState(null);
    const [loadingCuadro, setLoadingCuadro] = useState(false);
    // Nuevos estados para los nombres de los procesos
    const [nombresProcesos, setNombresProcesos] = useState([]);
    const [loadingProcesos, setLoadingProcesos] = useState(false);
    // Cargar datos del cuadro si estamos editando
    useEffect(() => {
        const loadCuadroData = async () => {
            if (!isEditMode || !cuadroId) return;
            try {
                setLoadingCuadro(true);
                const response = await axios.get(`http://localhost:8080/cuadro-turnos/${cuadroId}`);
                const cuadroData = response.data;
                setCuadroOriginal(cuadroData);
                // Preseleccionar el equipo
                setSelectedEquipo({
                    id: cuadroData.idEquipo.toString(),
                    nombre: cuadroData.equipoNombre || cuadroData.nombreEquipo || ""
                });
            } catch (err) {
                setError('Error al cargar datos del cuadro');
                console.error('Error:', err);
            } finally {
                setLoadingCuadro(false);
            }
        };
        loadCuadroData();
    }, [isEditMode, cuadroId]);
    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:8080/equipo');
                if (response.data && Array.isArray(response.data)) {
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
    // Efecto para cargar los nombres de los procesos
    useEffect(() => {
        const fetchNombresProcesos = async () => {
            if (!procesos) return;
            try {
                setLoadingProcesos(true);
                const procesosIds = JSON.parse(procesos);
                const promises = procesosIds.map(id =>
                    axios.get(`http://localhost:8080/procesos/${id}`)
                );
                const responses = await Promise.all(promises);
                const nombres = responses.map(res => res.data.nombre);
                setNombresProcesos(nombres);
            } catch (err) {
                console.error("Error al cargar nombres de procesos:", err);
                setNombresProcesos([]);
            } finally {
                setLoadingProcesos(false);
            }
        };
        fetchNombresProcesos();
    }, [procesos]);
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
            procesos: procesos || '',
            equipoId: selectedEquipo.id,
            equipoNombre: selectedEquipo.nombre
        });
        if (isEditMode) {
            params.append('edit', 'true');
            params.append('id', cuadroId);
        }
        return `/crearCuadroMulti3?${params.toString()}`;
    };
    const getBackUrl = () => {
        const params = new URLSearchParams({
            procesos: procesos || ''
        });
        if (isEditMode) {
            params.append('edit', 'true');
            params.append('id', cuadroId);
        }
        return `/crearCuadroMulti?${params.toString()}`;
    };
    if (loadingCuadro) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando datos del cuadro...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }
    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                <div className='text-3xl text-center font-bold'>
                    {isEditMode ? 'Editar Cuadro de Turno' : 'Crear Cuadro de Turno'}
                </div>
                {/* Información de edición */}
                {isEditMode && cuadroOriginal && (
                    <div className='text-sm bg-blue-50 border border-blue-200 rounded px-4 py-2 w-full'>
                        <div className='flex items-center gap-2 mb-2'>
                            <Edit size={16} className="text-blue-600" />
                            <span className='font-semibold text-blue-800'>Editando Cuadro Multiproceso</span>
                        </div>
                        <div className='text-xs text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {cuadroId}</div>
                            <div><span className='font-medium'>Nombre:</span> {cuadroOriginal.nombre}</div>
                        </div>
                    </div>
                )}
                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Categoría: {categoria || 'No especificada'}
                    </div>
                    <div className='text-lg font-bold text-gray-700'>
                        Procesos seleccionados:
                    </div>
                    {loadingProcesos ? (
                        <div className="text-xs">Cargando nombres de procesos...</div>
                    ) : (
                        <div className="text-xs">
                            {nombresProcesos.length > 0
                                ? nombresProcesos.join(', ')
                                : 'Ninguno'}
                        </div>
                    )}
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
                        <p className="text-xs font-semibold text-gray-700 p-2">
                            Equipo seleccionado: {selectedEquipo.nombre}
                        </p>
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
                            {isEditMode ? 'Continuar' : 'Aceptar'}
                        </button>
                    </Link>
                    <Link to={getBackUrl()}>
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