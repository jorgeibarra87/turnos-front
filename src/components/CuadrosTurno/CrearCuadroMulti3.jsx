import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CircleXIcon, User, Edit } from 'lucide-react';
import axios from 'axios';

export default function CrearCuadroMulti3() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const categoria = searchParams.get('categoria') || 'Multiproceso';
    const procesos = searchParams.get('procesos');
    const equipoId = searchParams.get('equipoId');
    const equipoNombre = searchParams.get('equipoNombre');
    const isEditMode = searchParams.get('edit') === 'true';
    const cuadroId = searchParams.get('id');

    const [miembros, setMiembros] = useState([]);
    const [procesosData, setProcesosData] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [loadingProcesos, setLoadingProcesos] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [cuadroOriginal, setCuadroOriginal] = useState(null);

    // Cargar datos del cuadro original si estamos editando
    useEffect(() => {
        const loadCuadroData = async () => {
            if (!isEditMode || !cuadroId) return;

            try {
                const response = await axios.get(`http://localhost:8080/cuadro-turnos/${cuadroId}`);
                setCuadroOriginal(response.data);
            } catch (err) {
                console.error('Error al cargar cuadro original:', err);
            }
        };

        loadCuadroData();
    }, [isEditMode, cuadroId]);

    // Cargar miembros del equipo
    useEffect(() => {
        const fetchMiembros = async () => {
            if (!equipoId) return;

            try {
                setLoadingMiembros(true);
                const response = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros-perfil`);
                setMiembros(response.data);
            } catch (err) {
                console.error("Error al obtener miembros del equipo:", err);
                setError("Error al cargar los miembros del equipo");
                setMiembros([]);
            } finally {
                setLoadingMiembros(false);
            }
        };

        fetchMiembros();
    }, [equipoId]);

    // Cargar datos de los procesos
    useEffect(() => {
        const fetchProcesosData = async () => {
            if (!procesos) return;

            try {
                setLoadingProcesos(true);
                const procesosIds = JSON.parse(procesos);
                const procesosPromises = procesosIds.map(id =>
                    axios.get(`http://localhost:8080/procesos/${id}`)
                );
                const responses = await Promise.all(procesosPromises);
                setProcesosData(responses.map(response => response.data));
            } catch (err) {
                console.error("Error al cargar datos de procesos:", err);
                setError("Error al cargar información de los procesos");
                setProcesosData([]);
            } finally {
                setLoadingProcesos(false);
            }
        };

        fetchProcesosData();
    }, [procesos]);

    // Manejar guardar cuadro multiproceso
    const handleGuardarCuadro = async () => {
        setSaving(true);
        setError(null);

        try {
            const procesosIds = JSON.parse(procesos);

            const cuadroData = {
                categoria: categoria.toLowerCase(),
                anio: isEditMode && cuadroOriginal ? cuadroOriginal.anio : "2025",
                mes: isEditMode && cuadroOriginal ? cuadroOriginal.mes : "07",
                turnoExcepcion: isEditMode && cuadroOriginal ? cuadroOriginal.turnoExcepcion : false,
                idEquipo: parseInt(equipoId),
                idsProcesosAtencion: procesosIds.map(id => parseInt(id))
            };

            let response;
            if (isEditMode) {
                // Actualizar cuadro multiproceso existente
                response = await axios.put(`http://localhost:8080/cuadro-turnos/${cuadroId}/editar-total`, cuadroData);
                alert('Cuadro multiproceso actualizado exitosamente');
            } else {
                // Crear nuevo cuadro multiproceso
                response = await axios.post('http://localhost:8080/cuadro-turnos/crear-total', cuadroData);
                alert('Cuadro multiproceso guardado exitosamente');
            }

            console.log('Cuadro multiproceso guardado/actualizado:', response.data);
            navigate('/');

        } catch (err) {
            setError(`Error al ${isEditMode ? 'actualizar' : 'guardar'} el cuadro multiproceso`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    const getBackUrl = () => {
        const params = new URLSearchParams({
            procesos: procesos || '',
            categoria: categoria
        });

        if (isEditMode) {
            params.append('edit', 'true');
            params.append('id', cuadroId);
        }

        return `/crearCuadroMulti2?${params.toString()}`;
    };

    const generarNombreCuadro = () => {
        if (!procesosData.length || !equipoNombre) return '';

        const procesosNombres = procesosData.map(p => p.nombre).join('_');
        return `CT_Multiproceso_${procesosNombres}_${equipoNombre}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4'>
                {/* Header */}
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {isEditMode ? 'Editando Cuadro Multiproceso' : 'Crear Cuadro Multiproceso'}
                </div>

                {/* Información de edición */}
                {isEditMode && cuadroOriginal && (
                    <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>
                        <div className='flex items-center justify-center gap-2 mb-1'>
                            <Edit size={14} className="text-orange-600" />
                            <span className='font-semibold text-orange-800'>Modificando cuadro existente</span>
                        </div>
                        <div className='space-y-1 text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {cuadroId}</div>
                            <div>
                                <span className='font-medium'>Nombre actual:</span>
                                <span className='ml-1 font-mono text-xs bg-white px-2 py-1 rounded border'>
                                    {cuadroOriginal.nombre}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumen de configuración */}
                <div className='text-center text-sm text-gray-600 space-y-2'>
                    <div><strong>Categoría:</strong> {categoria}</div>
                    <div><strong>Equipo:</strong> {equipoNombre}</div>
                    <div>
                        <strong>Procesos seleccionados ({procesosData.length}):</strong>
                        <div className='text-xs mt-1'>
                            {loadingProcesos ? (
                                'Cargando procesos...'
                            ) : procesosData.length > 0 ? (
                                procesosData.map(proceso => proceso.nombre).join(', ')
                            ) : (
                                'No se pudieron cargar los procesos'
                            )}
                        </div>
                    </div>
                    {!isEditMode && (
                        <div className='mt-3 p-2 bg-blue-50 rounded'>
                            <strong>Nombre del cuadro:</strong>
                            <div className='font-mono text-xs mt-1'>{generarNombreCuadro()}</div>
                        </div>
                    )}
                </div>

                {/* Tabla de miembros */}
                <div className='w-full'>
                    <div className='text-center text-2xl font-bold bg-blue-300 py-2 border-black rounded'>
                        Equipo de Talento Humano
                    </div>

                    {loadingMiembros ? (
                        <div className="w-full p-8 text-center">
                            <p className="text-gray-500 text-lg">Cargando miembros del equipo...</p>
                        </div>
                    ) : (
                        <div className='border rounded-lg overflow-hidden'>
                            <table className='w-full text-left'>
                                <thead className='bg-blue-100 text-gray-800'>
                                    <tr>
                                        <th className='px-4 py-1 text-center'></th>
                                        <th className='px-4 py-1'>Perfil</th>
                                        <th className='px-4 py-1'>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {miembros.map((miembro, index) => (
                                        <tr key={index} className='border-t border-gray-200 hover:bg-gray-50'>
                                            <td className='px-4 py-3 text-center'>
                                                <User size={22} className='text-gray-600 mx-auto' />
                                            </td>
                                            <td className='px-4 py-3 text-gray-700'>
                                                {miembro.titulos?.join(', ') || 'Sin perfil'}
                                            </td>
                                            <td className='px-4 py-3 text-gray-700'>
                                                {miembro.nombreCompleto}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                        {error}
                    </div>
                )}

                {/* Botones */}
                <div className='flex justify-center items-center gap-4 mt-6'>
                    <button
                        onClick={handleGuardarCuadro}
                        disabled={saving || loadingMiembros}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || loadingMiembros
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        <Save size={20} color="white" strokeWidth={2} />
                        {saving
                            ? (isEditMode ? 'Actualizando...' : 'Guardando...')
                            : (isEditMode ? 'Actualizar Cuadro' : 'Guardar Cuadro')
                        }
                    </button>

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