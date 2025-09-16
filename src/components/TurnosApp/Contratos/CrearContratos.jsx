import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckIcon, CircleXIcon, Save, ArrowLeft, Edit, Plus, Trash2, X, Calendar, FileText, User, Clock, Briefcase, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../Services/apiContratoService';

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
    const [especialidades, setEspecialidades] = useState([]);
    const [procesos, setProcesos] = useState([]);

    // Estados para elementos seleccionados
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


    // Cargar datos iniciales usando apiService
    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError('');

            const [especialidadesData, procesosData] = await Promise.all([
                apiService.contratos.getTitulosFormacionAcademica(),
                apiService.contratos.getProcesosDisponibles()
            ]);

            setEspecialidades(especialidadesData);
            setProcesos(procesosData);
        } catch (err) {
            console.error('Error al cargar datos iniciales:', err);
            setError('Error al cargar datos iniciales');
        } finally {
            setLoading(false);
        }
    };


    const loadContratoForEdit = async () => {
        try {
            setLoadingData(true);
            setError('');

            // Cargar datos básicos del contrato usando apiService
            const contratoCompleto = await apiService.contratos.getContratoCompleto(contratoId);

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

            // Cargar especialidades y procesos relacionados usando apiService
            try {
                const especialidadesDelContrato = await apiService.contratos.getEspecialidades(contratoId);
                setEspecialidadesSeleccionadas(especialidadesDelContrato);
            } catch (error) {
                console.warn('Error al cargar especialidades del contrato:', error);
                setEspecialidadesSeleccionadas([]);
            }

            try {
                const procesosDelContrato = await apiService.contratos.getProcesos(contratoId);
                setProcesosSeleccionados(procesosDelContrato);
            } catch (error) {
                console.warn('Error al cargar procesos del contrato:', error);
                setProcesosSeleccionados([]);
            }

        } catch (err) {
            console.error('Error al cargar datos del contrato:', err);
            setError('Error al cargar datos del contrato');
        } finally {
            setLoadingData(false);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Cargar datos del contrato para edición cuando los datos iniciales estén listos
    useEffect(() => {
        if (isEditMode && contratoId && especialidades.length > 0 && procesos.length > 0) {
            loadContratoForEdit();
        }
    }, [isEditMode, contratoId, especialidades.length, procesos.length]);

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
                // Verificar campos
                const existeEspecialidad = especialidadesSeleccionadas.find(e =>
                    e.idTitulo === elemento.idTitulo ||
                    e.id === elemento.idTitulo ||
                    e.idTitulo === elemento.id ||
                    (e.titulo === elemento.titulo && e.titulo)
                );

                if (!existeEspecialidad) {
                    setEspecialidadesSeleccionadas(prev => [...prev, elemento]);
                }
                break;
            case 'proceso':
                // Verificar campos
                const existeProcesoEnContrato = procesosSeleccionados.find(p =>
                    p.idProceso === elemento.idProceso ||
                    p.id === elemento.idProceso ||
                    p.idProceso === elemento.id ||
                    (p.nombre === elemento.nombre && p.nombre)
                );

                if (!existeProcesoEnContrato) {
                    setProcesosSeleccionados(prev => [...prev, elemento]);
                }
                break;
        }
    };

    const handleRemoverElemento = (id, tipo) => {
        switch (tipo) {
            case 'especialidad':
                setEspecialidadesSeleccionadas(prev => prev.filter(e =>
                    e.idTitulo !== id && e.id !== id
                ));
                break;
            case 'proceso':
                setProcesosSeleccionados(prev => prev.filter(p =>
                    p.idProceso !== id && p.id !== id
                ));
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

            // Extraer IDs
            const titulosIds = especialidadesSeleccionadas.map(e => e.idTitulo || e.id).filter(id => id !== undefined);
            const procesosIds = procesosSeleccionados.map(p => p.idProceso || p.id).filter(id => id !== undefined);

            const contratoCompleto = {
                ...contratoData,
                titulosIds: titulosIds,
                procesosIds: procesosIds
            };

            //console.log('Datos a enviar:', contratoCompleto); // Para debug

            if (isEditMode) {
                // Usar apiService
                await apiService.contratos.updateCompleto(contratoId, contratoCompleto);
                alert('Contrato actualizado exitosamente');
            } else {
                // Usar apiService
                await apiService.contratos.createCompleto(contratoCompleto);
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

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No definida';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return fecha;
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
                    data: especialidades.filter(e => {
                        // excluir los que ya están en la lista de especialidades Seleccionadas del contrato actual
                        return !especialidadesSeleccionadas.find(sel =>
                            sel.idTitulo === e.idTitulo ||
                            sel.id === e.idTitulo ||
                            sel.idTitulo === e.id ||
                            (sel.titulo === e.titulo && sel.titulo)
                        );
                    }),
                    nameField: 'titulo',
                    idField: 'idTitulo'
                };
            case 'proceso':
                return {
                    title: 'Procesos',
                    // filtrar los que ya están seleccionados en este contrato específico
                    data: procesos.filter(p => {
                        // excluir los que ya están en la lista de procesosSeleccionados del contrato actual
                        return !procesosSeleccionados.find(sel =>
                            sel.idProceso === p.idProceso ||
                            sel.id === p.idProceso ||
                            sel.idProceso === p.id ||
                            (sel.nombre === p.nombre && sel.nombre)
                        );
                    }),
                    nameField: 'nombre',
                    idField: 'idProceso'
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
                    <div className="flex items-center justify-center gap-2 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb- pt-4 mb-6 w-fit mx-auto">
                        <FileText size={30} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            {isEditMode ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
                        </h1>
                    </div>

                    {isEditMode && (
                        <div className='p-4 text-2xl text-center font-bold'>
                            <div className="flex items-center justify-center gap-2 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                                <FileText size={30} className="text-primary-green-husj" />
                                <h1 className="text-2xl font-extrabold text-gray-800">
                                    Editar Contrato:
                                </h1>
                            </div>
                            <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>

                                <div className='flex items-center justify-center gap-2 mb-1'>
                                    <Edit size={14} className="text-orange-600" />
                                    <span className='font-semibold text-orange-800'>Modificando contrato existente</span>
                                </div>
                                <div className='text-gray-700'>
                                    <div><span className='font-medium'>ID:</span> {contratoId}</div>
                                </div>
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
                            className="px-6 py-2 bg-primary-green-husj text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Gestionar Elementos Relacionados
                        </button>
                        <Link to="/contratos">
                            <button className="px-6 py-2 bg-primary-red2-husj text-white rounded-lg hover:bg-red-700 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : showRelatedManager && !showSelector ? (
                // Gestor de elementos relacionados
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                    <div className="flex items-center justify-center gap-2 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                        <FileText size={30} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Gestión de Elementos Relacionados
                        </h1>
                    </div>

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-6'>

                        {/* Especialidades */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>Especialidades</h3>
                                <button
                                    onClick={() => handleMostrarSelector('especialidad')}
                                    className="px-3 py-1 bg-primary-blue1-husj text-white rounded hover:bg-primary-blue3-husj flex items-center gap-1 text-sm"
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
                                        <div key={esp.idTitulo || esp.id} className='flex justify-between items-center bg-white p-2 rounded border'>
                                            <span className='text-sm'>{esp.titulo}</span>
                                            <button
                                                onClick={() => handleRemoverElemento(esp.idTitulo || esp.id, 'especialidad')}
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
                                    className="px-3 py-1 bg-primary-blue1-husj text-white rounded hover:bg-primary-blue3-husj flex items-center gap-1 text-sm"
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
                                        <div key={proceso.idProceso || proceso.id} className='flex justify-between items-center bg-white p-2 rounded border'>
                                            <span className='text-sm'>{proceso.nombre}</span>
                                            <button
                                                onClick={() => handleRemoverElemento(proceso.idProceso || proceso.id, 'proceso')}
                                                className="text-primary-red2-husj hover:text-red-700"
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
                        <div className='bg-white rounded-lg border'>
                            <div className='bg-gray-800 text-white'>
                                <div className='grid grid-cols-2'>
                                    <div className='px-4 py-3 font-semibold text-center border-r border-gray-600'>
                                        Especialidades (Perfil)
                                    </div>
                                    <div className='px-4 py-3 font-semibold text-center'>
                                        Procesos
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 min-h-[200px]'>
                                {/* Especialidades */}
                                <div className='border-r border-gray-200 p-4'>
                                    {especialidadesSeleccionadas.length > 0 ? (
                                        <div className='space-y-2'>
                                            {especialidadesSeleccionadas.map((especialidad, index) => (
                                                <div key={index} className='text-sm text-gray-700 py-1 border-b border-gray-100 last:border-b-0'>
                                                    {especialidad.titulo || especialidad.descripcion || 'Sin nombre'}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-gray-500 text-center py-8'>
                                            Sin especialidades
                                        </div>
                                    )}
                                </div>

                                {/* Procesos */}
                                <div className='p-4'>
                                    {procesosSeleccionados.length > 0 ? (
                                        <div className='space-y-2'>
                                            {procesosSeleccionados.map((proceso, index) => (
                                                <div key={index} className='text-sm text-gray-700 py-1 border-b border-gray-100 last:border-b-0'>
                                                    {proceso.nombre || proceso.nombre || 'Sin nombre'}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-gray-500 text-center py-8'>
                                            Sin procesos
                                        </div>
                                    )}
                                </div>
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
                    <div className="flex items-center justify-center gap-2 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                        <FileText size={30} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Seleccionar {selectorData.title}
                        </h1>
                    </div>

                    <div className='text-center text-sm text-gray-600'>
                        Selecciona los elementos que deseas agregar al contrato
                    </div>

                    {selectorData.data.length === 0 ? (
                        <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-full'>
                            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className='text-gray-500'>No hay elementos disponibles</p>
                            <p className='text-sm text-gray-400'>
                                {selectorType === 'proceso'
                                    ? 'Todos los procesos disponibles ya han sido agregados a este contrato'
                                    : 'Todos los elementos ya han sido agregados'
                                }
                            </p>
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
                                                        // cerrar el selector después de agregar
                                                        // setShowSelector(false);
                                                    }}
                                                    className="px-3 py-1 bg-primary-green-husj text-white text-sm rounded hover:bg-green-600 flex items-center gap-1 mx-auto transition-colors"
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
                            <button className="px-6 py-2 bg-primary-red-husj text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
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