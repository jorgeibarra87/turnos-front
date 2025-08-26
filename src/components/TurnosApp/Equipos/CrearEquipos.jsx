import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckIcon, CircleXIcon, Save, User, ArrowLeft, Edit, Plus, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiEquipoService } from '../Services/apiEquipoService';
import { apiCuadroService } from '../Services/apiCuadroService';

export default function CrearEquipo() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

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
    const [showEquipoForm, setShowEquipoForm] = useState(false);
    const [equipoNombre, setEquipoNombre] = useState("");
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

                // Cargar datos del equipo
                const equipoData = await apiEquipoService.equipos.getById(equipoId);
                setEquipoOriginal(equipoData);
                setEquipoNombre(equipoData.nombre || "");

                const nombreParts = equipoData.nombre?.split('_');
                if (nombreParts && nombreParts.length >= 3 && nombreParts[0] === 'Equipo') {
                    setSelectedCategory(nombreParts[1]);
                }
                // Cargar perfiles primero para tener la información disponible
                await loadPerfiles();
                // Luego cargar personas del equipo
                await loadPersonasEquipo(equipoId);

            } catch (err) {
                setError('Error al cargar los datos del equipo');
            } finally {
                setLoadingEquipoData(false);
            }
        };
        loadEquipoForEdit();
    }, [isEditMode, equipoId]);

    // API: Personas cargadas de equipo
    const loadPersonasEquipo = async (idEquipo) => {
        try {
            // Usar el endpoint que ya devuelve miembros con perfil
            const personas = await apiEquipoService.equipos.getMiembrosPerfil(idEquipo);
            //console.log('Personas cargadas con perfil:', personas);
            if (!personas || personas.length === 0) {
                setPersonasEquipo([]);
                return;
            }
            // Los títulos vienen en un array, formatear correctamente
            const personasFormateadas = personas.map(persona => ({
                ...persona,
                perfil: persona.titulos && persona.titulos.length > 0
                    ? persona.titulos.join(', ') // Unir múltiples títulos con coma
                    : 'Sin perfil asignado',
                idTitulo: persona.titulos && persona.titulos.length > 0 ? persona.titulos[0] : null // Usar el primer título como ID
            }));
            //console.log('Personas formateadas:', personasFormateadas);
            setPersonasEquipo(personasFormateadas);

        } catch (err) {
            console.error('Error al cargar personas del equipo:', err);

            //si getMiembrosPerfil falla, usar getUsuariosEquipo
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
            setPerfiles([]); // Valor por defecto en caso de error
        } finally {
            setLoadingPerfiles(false);
        }
    };

    // Usuarios por perfil
    const loadUsuariosPorPerfil = async (idTitulo) => {
        try {
            setLoadingUsuarios(true);
            const usuariosData = await apiEquipoService.auxiliares.getUsuariosPorPerfil(idTitulo);

            // Filtrar usuarios que ya están en el equipo
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

    // Cambio categoría (cargar opciones)
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        if (!loadingEquipoData) {
            setSelectedOption("");
            setOptions([]);
            setError("");
        }
    };

    //Opciones por categoría usando apiEquipoService
    useEffect(() => {
        const fetchOptions = async () => {
            if (!selectedCategory) {
                setOptions([]);
                return;
            }

            try {
                setLoading(true);
                setError("");

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

    // Generar nombre
    const generarNombreEquipo = () => {
        if (!selectedCategory || !selectedOption) return '';
        const timestamp = Date.now().toString().slice(-2);
        return `Equipo_${selectedCategory}_${selectedOption.nombre}_${timestamp}`;
    };

    // Mostrar gestor personas
    const handleMostrarGestorPersonas = () => {
        setShowPersonasManager(true);
        if (!isEditMode) {
            const nombreGenerado = generarNombreEquipo();
            setEquipoNombre(nombreGenerado);
        }
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

    // Guardar equipo usando apiEquipoService
    const handleGuardarEquipo = async () => {
        setSaving(true);
        setErrorEquipo(null);
        try {
            const equipoData = {
                nombre: equipoNombre.trim(),
                categoria: selectedCategory,
                subcategoria: selectedOption?.nombre || null,
            };

            if (!equipoData.nombre) {
                throw new Error('El nombre del equipo es requerido');
            }

            let equipoIdFinal = equipoId;

            if (isEditMode) {
                await apiEquipoService.equipos.updateNombre(equipoId, equipoData);
            } else {
                const created = await apiEquipoService.equipos.createCompleto(equipoData);
                equipoIdFinal = created.idEquipo;
            }

            //Usar apiEquipoService para usuarios
            if (personasEquipo.length > 0) {
                const personasIds = personasEquipo.map(p => p.idPersona);
                await apiEquipoService.equipos.updateUsuariosEquipo(equipoIdFinal, personasIds);
            }

            alert(`Equipo ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
            navigate('/equipos');
        } catch (err) {
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
        if (showPerfilSelector) handleCerrarSelectorPerfil();
        else if (showPersonasManager) setShowPersonasManager(false);
        else setShowEquipoForm(false);
        setEquipoNombre("");
        setErrorEquipo(null);
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {!showEquipoForm && !showPersonasManager ? (
                // Vista de selecciones inicial
                <div className='bg-white p-4 rounded-lg flex flex-col justify-center items-center gap-4 max-w-xl w-full mx-4'>
                    <div className='text-3xl text-center font-bold'>
                        {isEditMode ? 'Editar Equipo' : 'Gestión de Equipos'}
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
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        {isEditMode ? 'Editando Equipo' : 'Creando Nuevo Equipo'}
                    </div>

                    {isEditMode && (
                        <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>
                            <div className='flex items-center justify-center gap-2 mb-1'>
                                <Edit size={14} className="text-orange-600" />
                                <span className='font-semibold text-orange-800'>Modificando equipo existente</span>
                            </div>
                            <div className='text-gray-700'>
                                <div><span className='font-medium'>ID:</span> {equipoId}</div>
                            </div>
                        </div>
                    )}

                    <div className='text-center text-sm text-gray-600 space-y-1'>
                        <div><strong>Categoría:</strong> {selectedCategory}</div>
                        <div><strong>{selectedCategory}:</strong> {selectedOption.nombre}</div>
                        <div><strong>Nombre del Equipo:</strong> {equipoNombre}</div>
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
                            disabled={saving || !equipoNombre.trim()}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !equipoNombre.trim()
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
                    <div className='text-2xl font-bold text-gray-800 text-center'>
                        Seleccionar Perfil y Usuario
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

                            {loadingUsuarios ? (
                                <div className='bg-gray-50 border border-gray-300 rounded-lg p-4 text-center'>
                                    <p className='text-gray-500'>Cargando usuarios...</p>
                                </div>
                            ) : usuariosDisponibles.length === 0 ? (
                                <div className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                                    <User size={32} className="mx-auto text-gray-400 mb-2" />
                                    <button
                                        onClick="/#"
                                        className="mx-auto px-4 py-2 my-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors"
                                    >
                                        <UserPlus size={16} />
                                        Sincronizar Persona
                                    </button>
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
            ) : (
                // Vista del formulario del equipo
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4'>
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        {isEditMode ? 'Editando Equipo' : 'Creando Nuevo Equipo'}
                    </div>

                    {isEditMode && (
                        <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg'>
                            <div className='flex items-center justify-center gap-2 mb-1'>
                                <Edit size={14} className="text-orange-600" />
                                <span className='font-semibold text-orange-800'>Modificando equipo existente</span>
                            </div>
                            <div className='space-y-1 text-gray-700'>
                                <div><span className='font-medium'>ID:</span> {equipoId}</div>
                            </div>
                        </div>
                    )}

                    <div className='text-center text-sm text-gray-600 space-y-1'>
                        <div><strong>Categoría:</strong> {selectedCategory}</div>
                        <div><strong>{selectedCategory}:</strong> {selectedOption.nombre}</div>
                    </div>

                    <div className='w-full max-w-2xl space-y-4'>
                        <div>
                            <label htmlFor="equipo-nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre Actual del Equipo
                            </label>
                            <div><strong>{equipoNombre}</strong></div>
                        </div>
                    </div>

                    {errorEquipo && (
                        <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                            {errorEquipo}
                        </div>
                    )}

                    <div className='flex justify-center items-center gap-4 mt-6'>
                        <button
                            onClick={handleGuardarEquipo}
                            disabled={saving || !equipoNombre.trim()}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !equipoNombre.trim()
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
            )}
        </div>
    );
};