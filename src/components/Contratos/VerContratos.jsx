import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CheckIcon, CircleXIcon, Save, ArrowLeft, Edit, Plus, Trash2, X, Calendar, FileText, User, Clock, Briefcase, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CrearContrato() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Función para detectar modo edición y extraer ID
    const detectEditMode = () => {
        const pathname = location.pathname;
        const editMatch = pathname.match(/\/editar\/(\d+)/);

        if (editMatch) {
            return {
                isEditMode: true,
                contratoId: editMatch[1]
            };
        }

        const editFromQuery = searchParams.get('edit') === 'true';
        const idFromQuery = searchParams.get('id');

        if (editFromQuery && idFromQuery) {
            return {
                isEditMode: true,
                contratoId: idFromQuery
            };
        }

        return {
            isEditMode: false,
            contratoId: null
        };
    };

    const { isEditMode, contratoId } = detectEditMode();

    // Estados principales del contrato
    const [contratoData, setContratoData] = useState({
        numContrato: '',
        supervisor: '',
        apoyoSupervision: '',
        objeto: '',
        contratista: '',
        fechaInicio: '',
        fechaTerminacion: '',
        anio: new Date().getFullYear(),
        observaciones: ''
    });

    // Estados para gestión de elementos relacionados
    /* const [tiposAtencion, setTiposAtencion] = useState([]);
    const [tiposTurno, setTiposTurno] = useState([]); */
    const [especialidades, setEspecialidades] = useState([]);
    const [procesos, setProcesos] = useState([]);

    // Estados para elementos seleccionados
    /* const [tiposAtencionSeleccionados, setTiposAtencionSeleccionados] = useState([]);
    const [tiposTurnoSeleccionados, setTiposTurnoSeleccionados] = useState([]); */
    const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState([]);
    const [procesosSeleccionados, setProcesosSeleccionados] = useState([]);

    // Estados para formularios
    const [showMainForm, setShowMainForm] = useState(true);
    const [showRelatedManager, setShowRelatedManager] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const [selectorType, setSelectorType] = useState('');

    // Estados de loading y errores
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [loadingData, setLoadingData] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
        if (isEditMode && contratoId) {
            loadContratoForEdit();
        }
    }, [isEditMode, contratoId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [especialidadesRes, procesosRes] = await Promise.all([
                /* axios.get('http://localhost:8080/tipoatencion'),
                axios.get('http://localhost:8080/tipoturno'), */
                axios.get('http://localhost:8080/titulosFormacionAcademica'),
                axios.get('http://localhost:8080/procesosContrato')
            ]);

            /*             setTiposAtencion(tiposAtencionRes.data || []);
                        setTiposTurno(tiposTurnoRes.data || []); */
            setEspecialidades(especialidadesRes.data || []);
            setProcesos(procesosRes.data || []);
        } catch (err) {
            setError('Error al cargar datos iniciales');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadContratoForEdit = async () => {
        try {
            setLoadingData(true);
            const response = await axios.get(`http://localhost:8080/contrato/contratoTotal/${contratoId}`);
            const contratoCompleto = response.data;

            setContratoData({
                numContrato: contratoCompleto.numContrato || '',
                supervisor: contratoCompleto.supervisor || '',
                apoyoSupervision: contratoCompleto.apoyoSupervision || '',
                objeto: contratoCompleto.objeto || '',
                contratista: contratoCompleto.contratista || '',
                fechaInicio: contratoCompleto.fechaInicio || '',
                fechaTerminacion: contratoCompleto.fechaTerminacion || '',
                anio: contratoCompleto.anio || new Date().getFullYear(),
                observaciones: contratoCompleto.observaciones || ''
            });

            // Cargar elementos relacionados seleccionados
            /* if (contratoCompleto.tiposAtencionIds) {
                const tiposSeleccionados = tiposAtencion.filter(tipo =>
                    contratoCompleto.tiposAtencionIds.includes(tipo.idTipoAtencion)
                );
                setTiposAtencionSeleccionados(tiposSeleccionados);
            }

            if (contratoCompleto.tiposTurnoIds) {
                const turnosSeleccionados = tiposTurno.filter(turno =>
                    contratoCompleto.tiposTurnoIds.includes(turno.idTipoTurno)
                );
                setTiposTurnoSeleccionados(turnosSeleccionados);
            } */

            if (contratoCompleto.titulosIds) {
                const especialidadesSelec = especialidades.filter(esp =>
                    contratoCompleto.titulosIds.includes(esp.idTitulo)
                );
                setEspecialidadesSeleccionadas(especialidadesSelec);
            }

            if (contratoCompleto.procesosIds) {
                const procesosSelec = procesos.filter(proc =>
                    contratoCompleto.procesosIds.includes(proc.idProcesoContrato)
                );
                setProcesosSeleccionados(procesosSelec);
            }

        } catch (err) {
            setError('Error al cargar datos del contrato');
            console.error('Error:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (field, value) => {
        setContratoData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMostrarGestorRelacionados = () => {
        setShowMainForm(false);
        setShowRelatedManager(true);
    };

    const handleMostrarSelector = (tipo) => {
        setSelectorType(tipo);
        setShowSelector(true);
    };

    const handleAgregarElemento = (elemento, tipo) => {
        switch (tipo) {
            case 'especialidad':
                if (!especialidadesSeleccionadas.find(e => e.idTitulo === elemento.idTitulo)) {
                    setEspecialidadesSeleccionadas(prev => [...prev, elemento]);
                }
                break;
            case 'proceso':
                if (!procesosSeleccionados.find(p => p.idProcesoContrato === elemento.idProcesoContrato)) {
                    setProcesosSeleccionados(prev => [...prev, elemento]);
                }
                break;
        }
    };

    const handleRemoverElemento = (id, tipo) => {
        switch (tipo) {
            case 'especialidad':
                setEspecialidadesSeleccionadas(prev => prev.filter(e => e.idTitulo !== id));
                break;
            case 'proceso':
                setProcesosSeleccionados(prev => prev.filter(p => p.idProcesoContrato !== id));
                break;
        }
    };

    const handleGuardarContrato = async () => {
        if (!contratoData.numContrato.trim()) {
            setError('El número de contrato es requerido');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const contratoCompleto = {
                ...contratoData,
                titulosIds: especialidadesSeleccionadas.map(e => e.idTitulo),
                procesosIds: procesosSeleccionados.map(p => p.idProcesoContrato)
            };

            if (isEditMode) {
                await axios.put(`http://localhost:8080/contrato/actualizar/${contratoId}`, contratoCompleto);
                alert('Contrato actualizado exitosamente');
            } else {
                await axios.post('http://localhost:8080/contrato/guardar', contratoCompleto);
                alert('Contrato creado exitosamente');
            }

            navigate('/contratos');

        } catch (err) {
            setError(err.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el contrato`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleVolver = () => {
        if (showSelector) {
            setShowSelector(false);
            setSelectorType('');
        } else if (showRelatedManager) {
            setShowRelatedManager(false);
            setShowMainForm(true);
        }
    };

    if (loadingData) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando datos del contrato...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    const getSelectorData = () => {
        switch (selectorType) {
            case 'especialidad':
                return {
                    title: 'Especialidades',
                    data: especialidades.filter(e => !especialidadesSeleccionadas.find(sel => sel.idTitulo === e.idTitulo)),
                    nameField: 'titulo',
                    idField: 'idTitulo'
                };
            case 'proceso':
                return {
                    title: 'Procesos',
                    data: procesos.filter(p => !procesosSeleccionados.find(sel => sel.idProcesoContrato === p.idProcesoContrato)),
                    nameField: 'detalle',
                    idField: 'idProcesoContrato'
                };
            default:
                return { title: '', data: [], nameField: '', idField: '' };
        }
    };

    const selectorData = getSelectorData();

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {showMainForm ? (
                // Formulario principal del contrato
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        {isEditMode ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
                    </div>

                    {isEditMode && (
                        <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>
                            <div className='flex items-center justify-center gap-2 mb-1'>
                                <Edit size={14} className="text-orange-600" />
                                <span className='font-semibold text-orange-800'>Modificando contrato existente</span>
                            </div>
                            <div className='text-gray-700'>
                                <div><span className='font-medium'>ID:</span> {contratoId}</div>
                            </div>
                        </div>
                    )}

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Año */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Año
                            </label>
                            <select
                                value={contratoData.anio}
                                onChange={(e) => handleInputChange('anio', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Número de Contrato */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="inline mr-2" />
                                Número Contrato *
                            </label>
                            <input
                                type="text"
                                value={contratoData.numContrato}
                                onChange={(e) => handleInputChange('numContrato', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: 001-2025"
                            />
                        </div>

                        {/* Supervisor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Supervisor
                            </label>
                            <input
                                type="text"
                                value={contratoData.supervisor}
                                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre del supervisor"
                            />
                        </div>

                        {/* Apoyo Supervisión */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Apoyo Supervisión
                            </label>
                            <input
                                type="text"
                                value={contratoData.apoyoSupervision}
                                onChange={(e) => handleInputChange('apoyoSupervision', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre del apoyo"
                            />
                        </div>

                        {/* Contratista */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Briefcase size={16} className="inline mr-2" />
                                Contratista
                            </label>
                            <input
                                type="text"
                                value={contratoData.contratista}
                                onChange={(e) => handleInputChange('contratista', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre del contratista"
                            />
                        </div>

                        {/* Fecha Inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={contratoData.fechaInicio}
                                onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Fecha Terminación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Fecha Terminación
                            </label>
                            <input
                                type="date"
                                value={contratoData.fechaTerminacion}
                                onChange={(e) => handleInputChange('fechaTerminacion', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Objeto */}
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Target size={16} className="inline mr-2" />
                            Objeto
                        </label>
                        <textarea
                            value={contratoData.objeto}
                            onChange={(e) => handleInputChange('objeto', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción del objeto del contrato"
                        />
                    </div>

                    {/* Observaciones */}
                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText size={16} className="inline mr-2" />
                            Observaciones
                        </label>
                        <textarea
                            value={contratoData.observaciones}
                            onChange={(e) => handleInputChange('observaciones', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observaciones adicionales"
                        />
                    </div>

                    {error && (
                        <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                            {error}
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={handleMostrarGestorRelacionados}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Gestionar Elementos Relacionados
                        </button>
                        <Link to="/contratos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : showRelatedManager && !showSelector ? (
                // Gestor de elementos relacionados
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        Gestión de Elementos Relacionados
                    </div>

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-6'>

                        {/* Especialidades */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>Especialidades</h3>
                                <button
                                    onClick={() => handleMostrarSelector('especialidad')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 text-sm"
                                >
                                    <Plus size={14} />
                                    Agregar
                                </button>
                            </div>
                            <div className='space-y-2 max-h-32 overflow-y-auto'>
                                {especialidadesSeleccionadas.length === 0 ? (
                                    <p className='text-gray-500 text-sm'>No hay especialidades seleccionadas</p>
                                ) : (
                                    especialidadesSeleccionadas.map((esp) => (
                                        <div key={esp.idTitulo} className='flex justify-between items-center bg-white p-2 rounded border'>
                                            <span className='text-sm'>{esp.titulo}</span>
                                            <button
                                                onClick={() => handleRemoverElemento(esp.idTitulo, 'especialidad')}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Procesos */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>Procesos</h3>
                                <button
                                    onClick={() => handleMostrarSelector('proceso')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 text-sm"
                                >
                                    <Plus size={14} />
                                    Agregar
                                </button>
                            </div>
                            <div className='space-y-2 max-h-32 overflow-y-auto'>
                                {procesosSeleccionados.length === 0 ? (
                                    <p className='text-gray-500 text-sm'>No hay procesos seleccionados</p>
                                ) : (
                                    procesosSeleccionados.map((proceso) => (
                                        <div key={proceso.idProcesoContrato} className='flex justify-between items-center bg-white p-2 rounded border'>
                                            <span className='text-sm'>{proceso.detalle}</span>
                                            <button
                                                onClick={() => handleRemoverElemento(proceso.idProcesoContrato, 'proceso')}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de resumen */}
                    <div className='w-full'>
                        <h3 className='text-xl font-semibold text-gray-800 mb-4'>Resumen de Elementos Relacionados</h3>
                        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                                <div className='grid grid-cols-4 gap-4 font-semibold text-gray-700'>
                                    <div>Especialidades (Perfil)</div>
                                    <div>Procesos</div>
                                </div>
                            </div>
                            <div className='divide-y divide-gray-200'>
                                {/* Crear filas basadas en el máximo número de elementos */}
                                {Array.from({
                                    length: Math.max(
                                        especialidadesSeleccionadas.length,
                                        procesosSeleccionados.length,
                                        1
                                    )
                                }).map((_, index) => (
                                    <div key={index} className='px-4 py-3 hover:bg-gray-50'>
                                        <div className='grid grid-cols-4 gap-4 items-center text-sm'>
                                            <div>
                                                {especialidadesSeleccionadas[index] ? (
                                                    <span className='inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full'>
                                                        {especialidadesSeleccionadas[index].titulo}
                                                    </span>
                                                ) : '-'}
                                            </div>
                                            <div>
                                                {procesosSeleccionados[index] ? (
                                                    <span className='inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full'>
                                                        {procesosSeleccionados[index].detalle}
                                                    </span>
                                                ) : '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                            {error}
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={handleGuardarContrato}
                            disabled={saving || !contratoData.numContrato.trim()}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !contratoData.numContrato.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            <Save size={20} color="white" strokeWidth={2} />
                            {saving ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Contrato' : 'Crear Contrato')}
                        </button>
                        <button
                            onClick={handleVolver}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver al Formulario
                        </button>
                        <Link to="/contratos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : showSelector ? (
                // Selector de elementos
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                    <div className='text-2xl font-bold text-gray-800 text-center'>
                        Seleccionar {selectorData.title}
                    </div>

                    <div className='text-center text-sm text-gray-600'>
                        Selecciona los elementos que deseas agregar al contrato
                    </div>

                    {selectorData.data.length === 0 ? (
                        <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-full'>
                            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className='text-gray-500'>No hay elementos disponibles</p>
                            <p className='text-sm text-gray-400'>Todos los elementos ya han sido agregados</p>
                        </div>
                    ) : (
                        <div className='w-full bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                                <div className='grid grid-cols-2 gap-4 font-semibold text-gray-700'>
                                    <div>Nombre</div>
                                    <div className='text-center'>Acción</div>
                                </div>
                            </div>
                            <div className='divide-y divide-gray-200 max-h-60 overflow-y-auto'>
                                {selectorData.data.map((elemento) => (
                                    <div key={elemento[selectorData.idField]} className='px-4 py-3 hover:bg-gray-50'>
                                        <div className='grid grid-cols-2 gap-4 items-center'>
                                            <div className='flex items-center gap-2'>
                                                <span className='font-medium'>{elemento[selectorData.nameField]}</span>
                                            </div>
                                            <div className='text-center'>
                                                <button
                                                    onClick={() => {
                                                        handleAgregarElemento(elemento, selectorType);
                                                        // Opcional: cerrar el selector después de agregar
                                                        // setShowSelector(false);
                                                    }}
                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center gap-1 mx-auto transition-colors"
                                                >
                                                    <Plus size={14} />
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={() => setShowSelector(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver a Gestión
                        </button>
                        <Link to="/contratos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
}