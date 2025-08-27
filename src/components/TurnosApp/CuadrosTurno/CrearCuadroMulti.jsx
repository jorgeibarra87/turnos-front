import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon, Plus, X, Edit, CalendarClock } from 'lucide-react';
import axios from 'axios';
import { apiCuadroService } from '../Services/apiCuadroService';

export default function CrearCuadroMulti() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Detectar modo edición
    const isEditMode = searchParams.get('edit') === 'true';
    const cuadroId = searchParams.get('id');
    const procesosFromUrl = searchParams.get('procesos');

    const [procesos, setProcesos] = useState([]);
    const [procesosDisponibles, setProcesosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProceso, setSelectedProceso] = useState("");
    const [cuadroOriginal, setCuadroOriginal] = useState(null);
    const [loadingCuadro, setLoadingCuadro] = useState(false);

    // Cargar datos del cuadro para edición
    useEffect(() => {
        const loadCuadroData = async () => {
            if (!isEditMode || !cuadroId) return;

            try {
                setLoadingCuadro(true);

                const cuadroData = await apiCuadroService.cuadros.getById(cuadroId);
                setCuadroOriginal(cuadroData);

                const procesosData = await apiCuadroService.cuadros.getProcesos(cuadroId);
                const procesosIds = procesosData.map(p =>
                    (p.idProceso || p.id || p.procesoId || p.idProcesoAtencion)?.toString()
                ).filter(id => id);

                setProcesos(procesosIds);
            } catch (err) {
                console.error('Error al cargar datos del cuadro:', err);
                setError('Error al cargar datos del cuadro');
            } finally {
                setLoadingCuadro(false);
            }
        };

        loadCuadroData();
    }, [isEditMode, cuadroId]);

    // Cargar procesos disponibles
    useEffect(() => {
        const fetchProcesos = async () => {
            try {
                setLoading(true);
                const procesosData = await apiCuadroService.auxiliares.getProcesos();
                setProcesosDisponibles(procesosData);
            } catch (err) {
                console.error('Error al cargar procesos:', err);
                setError('Error al cargar procesos disponibles');
            } finally {
                setLoading(false);
            }
        };

        fetchProcesos();
    }, []);

    const handleAddProceso = () => {
        if (selectedProceso && !procesos.includes(selectedProceso)) {
            setProcesos([...procesos, selectedProceso]);
            setSelectedProceso("");
        }
    };

    const handleRemoveProceso = (procesoToRemove) => {
        setProcesos(procesos.filter(p => p !== procesoToRemove));
    };

    const getContinueUrl = () => {
        const params = new URLSearchParams({
            procesos: JSON.stringify(procesos)
        });

        if (isEditMode) {
            params.append('edit', 'true');
            params.append('id', cuadroId);
        }

        return `/crearCuadroMulti2?${params.toString()}`;
    };


    const getBackUrl = () => {
        if (isEditMode) {
            return `/crearCuadro/editar/${cuadroId}`;
        }
        return "/crearCuadro";
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
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-2 max-w-3xl w-full mx-4'>
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                    <CalendarClock size={40} className="text-primary-green-husj" />
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        {isEditMode ? 'Editar Multiprocesos Cuadro de Turno' : 'Configurar Multiprocesos Cuadro de Turno'}
                    </h1>
                </div>
                {/* Información de edición */}
                {isEditMode && cuadroOriginal && (
                    <div className='text-sm bg-blue-50 border border-blue-200 rounded px-4 py-2 w-full mb-4'>
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

                <div className='w-full space-y-2'>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Agregar Procesos</h3>

                        {loading ? (
                            <p>Cargando procesos disponibles...</p>
                        ) : error ? (
                            <p className="text-red-500">Error: {error}</p>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={selectedProceso}
                                    onChange={(e) => setSelectedProceso(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccione un proceso</option>
                                    {procesosDisponibles
                                        .filter(proceso => !procesos.includes(proceso.idProceso.toString()))
                                        .map((proceso) => (
                                            <option key={proceso.idProceso} value={proceso.idProceso.toString()}>
                                                {proceso.nombre}
                                            </option>
                                        ))}
                                </select>
                                <button
                                    onClick={handleAddProceso}
                                    disabled={!selectedProceso}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-1"
                                >
                                    <Plus size={18} /> Agregar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Procesos seleccionados ({procesos.length})</h3>

                        {procesos.length === 0 ? (
                            <p className="text-gray-500">No hay procesos agregados</p>
                        ) : (
                            <ul className="space-y-2">
                                {procesos.map((procesoId) => {
                                    const proceso = procesosDisponibles.find(p => p.idProceso.toString() === procesoId.toString());
                                    return (
                                        <li key={procesoId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span>{proceso?.nombre || `Proceso ID: ${procesoId}`}</span>
                                            <button
                                                onClick={() => handleRemoveProceso(procesoId)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={18} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link to={getContinueUrl()}>
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${procesos.length > 0
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={procesos.length === 0}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Continuar
                        </button>
                    </Link>

                    {/* <Link to={getBackUrl()}>
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors">
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                    </Link> */}

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