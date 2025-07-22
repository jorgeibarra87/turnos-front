import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckIcon, CircleXIcon, Plus, X } from 'lucide-react';
import axios from 'axios';

export default function CrearCuadro3() {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const seleccion = searchParams.get('seleccion');
    const [procesos, setProcesos] = useState([]);
    const [procesosDisponibles, setProcesosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProceso, setSelectedProceso] = useState("");

    useEffect(() => {
        const fetchProcesos = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/procesos');
                setProcesosDisponibles(response.data);
            } catch (err) {
                setError(err.message);
                console.error('Error al cargar procesos:', err);
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

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-2 max-w-3xl w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Configurar Multiprocesos Cuadro de Turno</div>

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
                                    {procesosDisponibles.map((proceso) => (
                                        <option key={proceso.id} value={proceso.id}>
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
                                    const proceso = procesosDisponibles.find(p => p.id === procesoId);
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
                    <Link
                        to={{
                            pathname: "/crearCuadro4",
                            search: `?categoria=${encodeURIComponent(categoria)}&seleccion=${encodeURIComponent(seleccion)}&procesos=${encodeURIComponent(JSON.stringify(procesos))}`
                        }}
                    >
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