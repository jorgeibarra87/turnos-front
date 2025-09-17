import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CircleXIcon, Save, User, ArrowLeft, Edit, Plus, UserPlus, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiEquipoService } from '../Services/apiEquipoService';
import SincronizarPersona from './SincronizarPersona';

export default function CrearEquipo() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [showSincronizarPersona, setShowSincronizarPersona] = useState(false);

    // Función para manejar persona sincronizada
    const handlePersonaSincronizada = (personaSincronizada) => {
        setPersonasEquipo(prev => [...prev, personaSincronizada]);
        setShowSincronizarPersona(false);
    };

    // Detectar modo edición e id
    const detectEditMode = () => {
        const pathname = location.pathname;
        const editMatch = pathname.match(/\/editar\/(\d+)/);
        if (editMatch) {
            return { isEditMode: true, equipoId: editMatch[1] };
        }
        const editFromQuery = searchParams.get('edit') === 'true';
        const idFromQuery = searchParams.get('id');
        if (editFromQuery && idFromQuery) {
            return { isEditMode: true, equipoId: idFromQuery };
        }
        return { isEditMode: false, equipoId: null };
    };

    const { isEditMode, equipoId } = detectEditMode();

    // Estados
    const [selectedCategory, setSelectedCategory] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [optionId, setOptionId] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorEquipo, setErrorEquipo] = useState(null);
    const [loadingEquipoData, setLoadingEquipoData] = useState(false);
    const [equipoOriginal, setEquipoOriginal] = useState(null);

    // Gestión de personas
    const [showPersonasManager, setShowPersonasManager] = useState(false);
    const [personasEquipo, setPersonasEquipo] = useState([]);
    const [showPerfilSelector, setShowPerfilSelector] = useState(false);
    const [perfiles, setPerfiles] = useState([]);
    const [selectedPerfil, setSelectedPerfil] = useState("");
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loadingPerfiles, setLoadingPerfiles] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    // Cargar datos para edición
    useEffect(() => {
        const loadEquipoForEdit = async () => {
            if (!isEditMode || !equipoId) return;
            try {
                setLoadingEquipoData(true);
                setError("");

                const equipoData = await apiEquipoService.equipos.getById(equipoId);
                setEquipoOriginal(equipoData);

                //Extraer categoría
                const nombreParts = equipoData.nombre?.split('_');
                if (nombreParts && nombreParts.length >= 3 && nombreParts[0] === 'EQUIPO') {
                    const categoriaFromName = nombreParts[1];

                    const categoriaFormatted = categoriaFromName.charAt(0).toUpperCase() + categoriaFromName.slice(1).toLowerCase();
                    console.log('Categoría extraída del nombre:', categoriaFromName, '-> Formateada:', categoriaFormatted);
                    setSelectedCategory(categoriaFormatted);
                }

                await loadPerfiles();
                await loadPersonasEquipo(equipoId);

            } catch (err) {
                console.error('Error al cargar equipo:', err);
                setError('Error al cargar los datos del equipo');
            } finally {
                setLoadingEquipoData(false);
            }
        };
        loadEquipoForEdit();
    }, [isEditMode, equipoId]);

    // Personas cargadas de equipo
    const loadPersonasEquipo = async (idEquipo) => {
        try {
            const personas = await apiEquipoService.equipos.getMiembrosPerfil(idEquipo);
            if (!personas || personas.length === 0) {
                setPersonasEquipo([]);
                return;
            }
            const personasFormateadas = personas.map(persona => ({
                ...persona,
                perfil: persona.titulos && persona.titulos.length > 0
                    ? persona.titulos.join(', ')
                    : 'Sin perfil asignado',
                idTitulo: persona.titulos && persona.titulos.length > 0 ? persona.titulos[0] : null,
                documento: persona.documento ? persona.documento : null
            }));
            setPersonasEquipo(personasFormateadas);
        } catch (err) {
            console.error('Error al cargar personas del equipo:', err);
            try {
                const personasBasicas = await apiEquipoService.equipos.getUsuariosEquipo(idEquipo);
                const personasSinPerfil = personasBasicas.map(persona => ({
                    ...persona,
                    perfil: 'Perfil no disponible',
                    idTitulo: null
                }));
                setPersonasEquipo(personasSinPerfil);
            } catch (Err) {
                console.error('Error:', Err);
                setPersonasEquipo([]);
            }
        }
    };

    // Perfiles
    const loadPerfiles = async () => {
        try {
            setLoadingPerfiles(true);
            const perfilesData = await apiEquipoService.auxiliares.getPerfiles();
            setPerfiles(perfilesData || []);
        } catch (err) {
            console.error('Error al cargar perfiles:', err);
            setError('Error al cargar los perfiles disponibles');
            setPerfiles([]);
        } finally {
            setLoadingPerfiles(false);
        }
    };

    // Usuarios por perfil
    const loadUsuariosPorPerfil = async (idTitulo) => {
        try {
            setLoadingUsuarios(true);
            const usuariosData = await apiEquipoService.auxiliares.getUsuariosPorPerfil(idTitulo);
            const usuariosYaEnEquipo = personasEquipo.map(p => p.idPersona);
            const usuariosFiltered = usuariosData.filter(
                user => !usuariosYaEnEquipo.includes(user.idPersona)
            );
            setUsuariosDisponibles(usuariosFiltered);
        } catch (err) {
            setError('Error al cargar usuarios disponibles');
        } finally {
            setLoadingUsuarios(false);
        }
    };

    // Cambio categoría
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        if (!loadingEquipoData) {
            setSelectedOption("");
            setOptions([]);
            setError("");
        }
    };

    // Opciones por categoría
    useEffect(() => {
        const fetchOptions = async () => {
            // No llamar API si no hay categoría seleccionada
            if (!selectedCategory || selectedCategory.trim() === '') {
                setOptions([]);
                setError(""); // Limpiar error
                return;
            }

            try {
                setLoading(true);
                setError("");

                console.log('Enviando categoría al backend:', selectedCategory);

                const optionsData = await apiEquipoService.auxiliares.getByCategoria(selectedCategory);

                const idFields = {
                    'Macroproceso': 'idMacroproceso',
                    'Proceso': 'idProceso',
                    'Servicio': 'idServicio',
                    'Seccion': 'idSeccionServicio',
                    'Subseccion': 'idSubseccionServicio'
                };

                setOptionId(idFields[selectedCategory]);
                setOptions(optionsData);

                // Para modo edición, buscar la opción seleccionada
                if (isEditMode && equipoOriginal && optionsData.length > 0) {
                    const nombreParts = equipoOriginal.nombre?.split('_');
                    if (nombreParts && nombreParts.length >= 3) {
                        const optionName = nombreParts[2];
                        const foundOption = optionsData.find(option =>
                            option.nombre === optionName
                        );
                        if (foundOption) setSelectedOption(foundOption);
                    }
                }
            } catch (err) {
                console.error('Error al cargar opciones:', err);
                setError('Error al cargar opciones: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [selectedCategory, equipoOriginal]);

    // Cambios en segundo select
    const handleOptionChange = (e) => {
        const selectedId = e.target.value;
        const selectedObj = options.find(option =>
            option[optionId]?.toString() === selectedId
        );
        setSelectedOption(selectedObj || "");
    };

    // Mostrar gestor personas
    const handleMostrarGestorPersonas = () => {
        setShowPersonasManager(true);
        loadPerfiles();
    };

    // Mostrar selector perfil
    const handleMostrarSelectorPerfil = () => {
        setShowPerfilSelector(true);
        setSelectedPerfil("");
        setUsuariosDisponibles([]);
    };

    // Cambiar perfil y usuarios por perfil
    const handlePerfilChange = (e) => {
        const perfilId = e.target.value;
        setSelectedPerfil(perfilId);
        if (perfilId) {
            loadUsuariosPorPerfil(perfilId);
        } else {
            setUsuariosDisponibles([]);
        }
    };

    // Agregar persona equipo
    const handleAgregarPersonaAlEquipo = (usuario) => {
        const perfilSeleccionado = perfiles.find(p => p.idTitulo.toString() === selectedPerfil);
        const nuevaPersona = {
            idPersona: usuario.idPersona,
            nombreCompleto: usuario.nombreCompleto,
            documento: usuario.documento,
            perfil: perfilSeleccionado?.titulo || 'Sin título',
            idTitulo: selectedPerfil
        };
        setPersonasEquipo(prev => [...prev, nuevaPersona]);
        setUsuariosDisponibles(prev =>
            prev.filter(u => u.idPersona !== usuario.idPersona)
        );
    };

    // Remover persona
    const handleRemoverPersonaDelEquipo = (idPersona) => {
        setPersonasEquipo(prev => prev.filter(p => p.idPersona !== idPersona));
    };

    // Cerrar selector perfil
    const handleCerrarSelectorPerfil = () => {
        setShowPerfilSelector(false);
        setSelectedPerfil("");
        setUsuariosDisponibles([]);
    };

    // Guardar equipo
    const handleGuardarEquipo = async () => {
        setSaving(true);
        setErrorEquipo(null);
        try {
            // Enviar datos
            const selectionData = {
                categoria: selectedCategory,
                subcategoria: selectedOption?.nombre || null,
            };

            console.log('Enviando datos al backend:', selectionData);

            let equipoIdFinal = equipoId;

            if (isEditMode) {
                const equipoActualizado = await apiEquipoService.equipos.updateWithGeneratedName(equipoId, selectionData);
                equipoIdFinal = equipoActualizado.idEquipo;
                console.log('Equipo actualizado:', equipoActualizado.idEquipo);
            } else {
                const equipoCreado = await apiEquipoService.equipos.createWithGeneratedName(selectionData);
                equipoIdFinal = equipoCreado.idEquipo;
            }

            // Actualizar usuarios del equipo
            if (personasEquipo.length > 0) {
                const personasIds = personasEquipo.map(p => p.idPersona);
                await apiEquipoService.equipos.updateUsuariosEquipo(equipoIdFinal, personasIds);
            }

            alert(`Equipo ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
            navigate('/equipos');
        } catch (err) {
            console.error('Error al guardar equipo:', err);
            setErrorEquipo(
                err.response?.data?.message ||
                err.message ||
                `Error al ${isEditMode ? 'actualizar' : 'crear'} el equipo`
            );
        } finally {
            setSaving(false);
        }
    };

    // Volver
    const handleVolver = () => {
        if (showPerfilSelector) {
            handleCerrarSelectorPerfil();
        } else if (showPersonasManager) {
            setShowPersonasManager(false);
        }
        setErrorEquipo(null);
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {!showPersonasManager ? (
                // Vista de selecciones inicial
                <div className='bg-white p-4 rounded-lg flex flex-col justify-center items-center gap-4 max-w-xl w-full mx-4'>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                        <Users size={40} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            {isEditMode ? 'Editar Equipo' : 'Gestión de Equipos'}
                        </h1>
                    </div>
                    <div className='text-lg text-center font-semibold'>
                        {isEditMode ? 'Modifica los datos del equipo' : 'Selecciona una categoría para el equipo'}
                    </div>

                    {isEditMode && equipoId && (
                        <div className='text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 w-full'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Edit size={16} className="text-blue-600" />
                                <span className='font-semibold text-blue-800'>Modo Edición Equipo</span>
                            </div>
                            <div className='text-xs text-gray-700'>
                                <div><span className='font-medium'>ID:</span> {equipoId}</div>
                                <div>
                                    <span className='font-medium'>Nombre actual:</span>
                                    <span className='ml-1 font-mono text-xs bg-white px-2 py-1 rounded border'>
                                        {equipoOriginal?.nombre || 'Cargando...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selectores de categoría */}
                    <div className="w-full">
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona una categoría para el equipo
                        </label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona una categoría --</option>
                            <option value="Macroproceso">Macroproceso</option>
                            <option value="Proceso">Proceso</option>
                            <option value="Servicio">Servicio</option>
                            <option value="Seccion">Sección</option>
                            <option value="Subseccion">Subsección</option>
                        </select>
                        {selectedCategory && (
                            <p className="mt-2 text-xs text-gray-600">Categoría seleccionada: {selectedCategory}</p>
                        )}
                    </div>

                    {selectedCategory && (
                        <div className="w-full">
                            <label htmlFor="option-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Selecciona un {selectedCategory}
                            </label>

                            {loading ? (
                                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                                    <p className="text-gray-500">Cargando opciones...</p>
                                </div>
                            ) : error ? (
                                <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50">
                                    <p className="text-red-500">Error al cargar opciones: {error}</p>
                                </div>
                            ) : (
                                <select
                                    id="option-select"
                                    value={selectedOption ? selectedOption[optionId] || '' : ''}
                                    onChange={handleOptionChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Selecciona un {selectedCategory} --</option>
                                    {options.map((option) => (
                                        <option key={option[optionId]} value={option[optionId]}>
                                            {option.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedOption && (
                                <p className="mt-2 text-xs text-gray-600">
                                    Seleccionaste: {selectedOption.nombre}
                                </p>
                            )}
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-4'>
                        <button
                            onClick={handleMostrarGestorPersonas}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedOption
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedOption}
                        >
                            <UserPlus size={20} color="white" strokeWidth={2} />
                            Gestionar Personas
                        </button>
                        <Link to="/equipos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : showPersonasManager && !showPerfilSelector ? (
                // VISTA DEL GESTOR DE PERSONAS
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                        <Users size={40} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            {isEditMode ? 'Editando Equipo' : 'Creando Nuevo Equipo'}
                        </h1>
                    </div>

                    {isEditMode && (
                        <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>
                            <div className='flex items-center justify-center gap-2 mb-1'>
                                <Edit size={14} className="text-orange-600" />
                                <span className='font-semibold text-orange-800'>Modificando equipo existente</span>
                            </div>
                            <div className='text-gray-700'>
                                <div><span className='font-medium'>ID:</span> {equipoId}</div>
                                <div><span className='font-medium'>Nombre actual:</span> {equipoOriginal?.nombre}</div>
                            </div>
                        </div>
                    )}

                    <div className='text-center text-sm text-gray-600 space-y-1'>
                        <div><strong>Categoría:</strong> {selectedCategory}</div>
                        <div><strong>{selectedCategory}:</strong> {selectedOption?.nombre}</div>
                        {/* <div className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
                            <em>📝 El nombre del equipo se generará automáticamente al guardar</em>
                        </div> */}
                    </div>

                    {/* SECCIÓN DE PERSONAS DEL EQUIPO */}
                    <div className='w-full max-w-4xl'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-xl font-semibold text-gray-800'>Personas del Equipo</h3>
                            <button
                                onClick={handleMostrarSelectorPerfil}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                            >
                                <UserPlus size={16} />
                                Agregar Persona
                            </button>
                        </div>

                        {personasEquipo.length === 0 ? (
                            <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                                <User size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className='text-gray-500'>No hay personas asignadas al equipo</p>
                                <p className='text-sm text-gray-400'>Haz clic en "Agregar Persona" para comenzar</p>
                            </div>
                        ) : (
                            <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                                <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                                    <div className='grid grid-cols-4 gap-4 font-semibold text-gray-700'>
                                        <div>Nombre</div>
                                        <div>Documento</div>
                                        <div>Perfil</div>
                                        <div className='text-center'>Acciones</div>
                                    </div>
                                </div>
                                <div className='divide-y divide-gray-200'>
                                    {personasEquipo.map((persona, index) => (
                                        <div key={index} className='px-4 py-3 hover:bg-gray-50'>
                                            <div className='grid grid-cols-4 gap-4 items-center'>
                                                <div className='flex items-center gap-2'>
                                                    <User size={16} className="text-gray-400" />
                                                    <span className='font-medium'>{persona.nombreCompleto}</span>
                                                </div>
                                                <div className='text-gray-600'>{persona.documento}</div>
                                                <div>
                                                    <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                                                        {persona.perfil}
                                                    </span>
                                                </div>
                                                <div className='text-center'>
                                                    <button
                                                        onClick={() => handleRemoverPersonaDelEquipo(persona.idPersona)}
                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {errorEquipo && (
                        <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                            {errorEquipo}
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={handleGuardarEquipo}
                            disabled={saving}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            <Save size={20} color="white" strokeWidth={2} />
                            {saving ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Equipo' : 'Crear Equipo')}
                        </button>
                        <button
                            onClick={handleVolver}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                        <Link to="/equipos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : showPerfilSelector ? (
                // VISTA DEL SELECTOR DE PERFIL Y USUARIOS
                <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                        <Users size={40} className="text-primary-green-husj" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Seleccionar Perfil y Usuario
                        </h1>
                    </div>

                    <div className='text-center text-sm text-gray-600'>
                        Selecciona un perfil para ver los usuarios disponibles
                    </div>

                    {/* Selector de Perfil */}
                    <div className="w-full max-w-md">
                        <label htmlFor="perfil-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona un Perfil
                        </label>
                        {loadingPerfiles ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                                <p className="text-gray-500">Cargando perfiles...</p>
                            </div>
                        ) : (
                            <select
                                id="perfil-select"
                                value={selectedPerfil}
                                onChange={handlePerfilChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Selecciona un perfil --</option>
                                {perfiles.map((perfil) => (
                                    <option key={perfil.idTitulo} value={perfil.idTitulo}>
                                        {perfil.titulo}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Lista de Usuarios Disponibles */}
                    {selectedPerfil && (
                        <div className='w-full'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                                Usuarios Disponibles
                            </h3>
                            <button
                                onClick={() => setShowSincronizarPersona(true)}
                                className="mx-auto px-4 py-2 my-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                            >
                                <UserPlus size={16} />
                                Sincronizar Persona
                            </button>

                            {loadingUsuarios ? (
                                <div className='bg-gray-50 border border-gray-300 rounded-lg p-4 text-center'>
                                    <p className='text-gray-500'>Cargando usuarios...</p>
                                </div>
                            ) : usuariosDisponibles.length === 0 ? (
                                <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                                    <p className='text-gray-500'>No hay usuarios disponibles con este perfil</p>
                                    <p className='text-sm text-gray-400'>O todos los usuarios ya están en el equipo</p>
                                </div>
                            ) : (
                                <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                                    <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
                                        <div className='grid grid-cols-4 gap-4 font-semibold text-gray-700'>
                                            <div>Nombre</div>
                                            <div>Documento</div>
                                            <div>Perfil</div>
                                            <div className='text-center'>Acción</div>
                                        </div>
                                    </div>
                                    <div className='divide-y divide-gray-200 max-h-60 overflow-y-auto'>
                                        {usuariosDisponibles.map((usuario) => (
                                            <div key={usuario.idPersona} className='px-4 py-3 hover:bg-gray-50'>
                                                <div className='grid grid-cols-4 gap-4 items-center'>
                                                    <div className='flex items-center gap-2'>
                                                        <User size={16} className="text-gray-400" />
                                                        <span className='font-medium'>{usuario.nombreCompleto}</span>
                                                    </div>
                                                    <div className='text-gray-600'>{usuario.documento}</div>
                                                    <div>
                                                        <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                                                            {perfiles.find(p => p.idTitulo.toString() === selectedPerfil)?.titulo || 'Sin título'}
                                                        </span>
                                                    </div>
                                                    <div className='text-center'>
                                                        <button
                                                            onClick={() => handleAgregarPersonaAlEquipo(usuario)}
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
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={handleCerrarSelectorPerfil}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver a Gestión
                        </button>
                        <Link to="/equipos">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : null}

            {showSincronizarPersona && (
                <SincronizarPersona
                    onClose={() => setShowSincronizarPersona(false)}
                    onPersonaSincronizada={handlePersonaSincronizada}
                />
            )}
        </div>
    );
}
