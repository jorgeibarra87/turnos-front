import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckIcon, CircleXIcon, Save, User, ArrowLeft, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiCuadroService } from '../Services/apiCuadroService';

export default function CrearCuadro() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Función para detectar modo edición y extraer ID
    const detectEditMode = () => {
        const pathname = location.pathname;
        console.log('Pathname actual:', pathname);

        const editMatch = pathname.match(/\/editar\/(\d+)/);

        if (editMatch) {
            console.log('Modo edición detectado. ID:', editMatch[1]);
            return {
                isEditMode: true,
                cuadroId: editMatch[1]
            };
        }

        const editFromQuery = searchParams.get('edit') === 'true';
        const idFromQuery = searchParams.get('id');

        if (editFromQuery && idFromQuery) {
            console.log('Modo edición desde query params. ID:', idFromQuery);
            return {
                isEditMode: true,
                cuadroId: idFromQuery
            };
        }

        console.log('Modo creación detectado');
        return {
            isEditMode: false,
            cuadroId: null
        };
    };

    const { isEditMode, cuadroId } = detectEditMode();
    const cuadroIdToEdit = cuadroId;

    // Estados para la categoría (primer select)
    const [selectedCategory, setSelectedCategory] = useState("");

    // Estados para las opciones del segundo select
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [optionId, setOptionId] = useState("");

    // Estados para los equipos (tercer select)
    const [equipos, setEquipos] = useState([]);
    const [selectedEquipo, setSelectedEquipo] = useState({ id: "", nombre: "" });
    const [loadingEquipos, setLoadingEquipos] = useState(false);
    const [errorEquipos, setErrorEquipos] = useState("");

    // Estados para el cuadro de turno
    const [showCuadro, setShowCuadro] = useState(false);
    const [miembros, setMiembros] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorCuadro, setErrorCuadro] = useState(null);

    // Estados específicos para edición
    const [loadingCuadroData, setLoadingCuadroData] = useState(false);
    const [cuadroOriginal, setCuadroOriginal] = useState(null);

    // useEffect para cargar datos del cuadro si estamos en modo edición
    useEffect(() => {
        const loadCuadroForEdit = async () => {
            if (!isEditMode || !cuadroIdToEdit) {
                console.log('No es modo edición o no hay ID');
                return;
            }

            console.log('Cargando cuadro para editar. ID:', cuadroIdToEdit);

            try {
                setLoadingCuadroData(true);

                // Usar apiService
                const cuadroData = await apiCuadroService.cuadros.getById(cuadroIdToEdit);

                console.log('Datos del cuadro cargados:', cuadroData);
                setCuadroOriginal(cuadroData);

                // Si es un cuadro multiproceso, redirigir al flujo correcto
                if (cuadroData.categoria?.toLowerCase() === 'multiproceso') {
                    console.log('Detectado cuadro multiproceso, redirigiendo...');

                    setTimeout(async () => {
                        try {
                            //Usar apiService para obtener procesos
                            const procesosData = await apiCuadroService.cuadros.getProcesos(cuadroIdToEdit);
                            const procesosIds = procesosData.map(p => p.idProceso || p.id);

                            console.log('Procesos encontrados:', procesosIds);
                            navigate(`/crearCuadroMulti?edit=true&id=${cuadroIdToEdit}&procesos=${encodeURIComponent(JSON.stringify(procesosIds))}`);

                        } catch (procesosError) {
                            console.error('Error al cargar procesos del cuadro multiproceso:', procesosError);
                            navigate(`/crearCuadroMulti?edit=true&id=${cuadroIdToEdit}`);
                        }
                    }, 100);

                    return;
                }

                // Resto de la lógica para cuadros
                setSelectedCategory(cuadroData.categoria.charAt(0).toUpperCase() + cuadroData.categoria.slice(1));
                setSelectedEquipo({
                    id: cuadroData.idEquipo.toString(),
                    nombre: cuadroData.equipoNombre || ""
                });

                const categoryMapping = {
                    'macroproceso': { key: 'idMacroproceso', value: cuadroData.idMacroproceso },
                    'proceso': { key: 'idProceso', value: cuadroData.idProceso },
                    'servicio': { key: 'idServicio', value: cuadroData.idServicio },
                    'seccion': { key: 'idSeccionServicio', value: cuadroData.idSeccionesServicio },
                    'subseccion': { key: 'idSubseccionServicio', value: cuadroData.idSubseccionServicio }
                };

                const mapping = categoryMapping[cuadroData.categoria.toLowerCase()];
                if (mapping && mapping.value) {
                    setOptionId(mapping.key);
                }

            } catch (err) {
                console.error('Error al cargar cuadro para editar:', err);
                setError('Error al cargar los datos del cuadro');
            } finally {
                setLoadingCuadroData(false);
            }
        };

        loadCuadroForEdit();
    }, [isEditMode, cuadroIdToEdit, navigate]);

    // Función para manejar el cambio de categoría
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);

        if (newCategory === 'Multiproceso') {
            navigate('/crearCuadroMulti');
            return;
        }

        if (!loadingCuadroData) {
            setSelectedOption("");
            setOptions([]);
            setError("");
            setSelectedEquipo({ id: "", nombre: "" });
        }
    };

    // useEffect para cargar datos cuando cambia la categoría
    useEffect(() => {
        const fetchOptions = async () => {
            if (!selectedCategory || selectedCategory === 'Multiproceso') {
                setOptions([]);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Usar apiService
                const data = await apiCuadroService.auxiliares.getDataByCategoria(selectedCategory);
                setOptions(data);

                // Determinar qué campo ID usar según la categoría
                const idFields = {
                    'Macroproceso': 'idMacroproceso',
                    'Proceso': 'idProceso',
                    'Servicio': 'idServicio',
                    'Seccion': 'idSeccionServicio',
                    'Subseccion': 'idSubseccionServicio'
                };

                setOptionId(idFields[selectedCategory]);

                // Si estamos en modo edición y tenemos datos, preseleccionar la opción
                if (isEditMode && cuadroOriginal && data.length > 0) {
                    const categoryMapping = {
                        'Macroproceso': cuadroOriginal.idMacroproceso,
                        'Proceso': cuadroOriginal.idProceso,
                        'Servicio': cuadroOriginal.idServicio,
                        'Seccion': cuadroOriginal.idSeccionServicio,
                        'Subseccion': cuadroOriginal.idSubseccionServicio
                    };

                    const valueToFind = categoryMapping[selectedCategory];
                    if (valueToFind) {
                        const foundOption = data.find(option =>
                            option[idFields[selectedCategory]] === valueToFind
                        );
                        if (foundOption) {
                            setSelectedOption(foundOption);
                        }
                    }
                }

            } catch (err) {
                setError('Error al cargar opciones: ' + err.message);
                console.error('Error al cargar opciones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [selectedCategory, cuadroOriginal]);

    // useEffect para cargar equipos usando apiService
    useEffect(() => {
        const fetchEquipos = async () => {
            if (!selectedCategory || selectedCategory === 'Multiproceso') {
                setEquipos([]);
                return;
            }

            try {
                setLoadingEquipos(true);
                setErrorEquipos("");

                // Usar apiService
                const equiposData = await apiCuadroService.auxiliares.getEquipos();
                setEquipos(equiposData);

                // Si estamos en modo edición, preseleccionar el equipo
                if (isEditMode && cuadroOriginal && equiposData.length > 0) {
                    const equipoEncontrado = equiposData.find(equipo =>
                        equipo.idEquipo.toString() === cuadroOriginal.idEquipo.toString()
                    );
                    if (equipoEncontrado) {
                        setSelectedEquipo({
                            id: equipoEncontrado.idEquipo,
                            nombre: equipoEncontrado.nombre
                        });
                    }
                }

            } catch (err) {
                setErrorEquipos('Error al cargar los equipos');
                console.error('Error al cargar equipos:', err);
                setEquipos([]);
            } finally {
                setLoadingEquipos(false);
            }
        };

        fetchEquipos();
    }, [selectedCategory, cuadroOriginal]);

    // Función para manejar el cambio en el segundo select
    const handleOptionChange = (e) => {
        const selectedId = e.target.value;
        const selectedObj = options.find(option =>
            option[optionId]?.toString() === selectedId
        );
        setSelectedOption(selectedObj || "");
    };

    // Función para manejar el cambio en el select de equipos
    const handleEquipoChange = (e) => {
        const equipoId = e.target.value;
        const equipoSeleccionado = equipos.find(equipo =>
            equipo.idEquipo.toString() === equipoId.toString()
        );

        if (equipoSeleccionado) {
            setSelectedEquipo({
                id: equipoSeleccionado.idEquipo,
                nombre: equipoSeleccionado.nombre
            });
        } else {
            setSelectedEquipo({ id: "", nombre: "" });
        }
    };

    // Función para generar el nombre del cuadro
    const generaNombreCuadro = () => {
        if (isEditMode && cuadroOriginal?.nombre) {
            return (
                <div>
                    <div className='text-sm text-gray-500 mb-1'>Nombre actual:</div>
                    <div className='font-medium'>{cuadroOriginal.nombre}</div>
                    {selectedCategory && selectedOption && selectedEquipo.nombre && (
                        <>
                            <div className='text-sm text-gray-500 mt-2 mb-1'>Nuevo nombre al guardar:</div>
                            <div className='font-medium'>
                                {`CT_${selectedCategory}_${selectedOption.nombre}_${selectedEquipo.nombre}`}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        if (!selectedCategory || !selectedOption || !selectedEquipo.nombre) return '';
        return `CT_${selectedCategory}_${selectedOption.nombre}_${selectedEquipo.nombre}`;
    };

    // Función para mostrar el cuadro usando apiService
    const handleMostrarCuadro = async () => {
        setShowCuadro(true);
        setLoadingMiembros(true);
        setErrorCuadro(null);

        try {
            // Usar apiService
            const miembrosData = await apiCuadroService.auxiliares.getMiembrosEquipo(selectedEquipo.id);
            setMiembros(miembrosData);
        } catch (error) {
            console.error("Error al obtener miembros del equipo:", error);
            setErrorCuadro("Error al cargar los miembros del equipo");
            setMiembros([]);
        } finally {
            setLoadingMiembros(false);
        }
    };

    // Función para guardar el cuadro usando apiService
    const handleGuardarCuadro = async () => {
        setSaving(true);
        setErrorCuadro(null);
        const fechaActual = new Date();

        try {
            const cuadroData = {
                categoria: selectedCategory.toLowerCase(),
                anio: isEditMode ? cuadroOriginal.anio : fechaActual.getFullYear(),
                mes: isEditMode ? cuadroOriginal.mes : fechaActual.getMonth() + 1,
                turnoExcepcion: isEditMode ? cuadroOriginal.turnoExcepcion : false,
                idEquipo: parseInt(selectedEquipo.id),
            };

            // Establecer el ID correcto según la categoría
            if (selectedCategory === 'Macroproceso') {
                cuadroData.idMacroproceso = selectedOption[optionId];
            } else if (selectedCategory === 'Proceso') {
                cuadroData.idProceso = selectedOption[optionId];
            } else if (selectedCategory === 'Servicio') {
                cuadroData.idServicio = selectedOption[optionId];
            } else if (selectedCategory === 'Seccion') {
                cuadroData.idSeccionServicio = selectedOption[optionId];
            } else if (selectedCategory === 'Subseccion') {
                cuadroData.idSubseccionServicio = selectedOption[optionId];
            }

            // Usar apiService en lugar de axios directo
            if (isEditMode) {
                await apiCuadroService.cuadros.updateCompleto(cuadroIdToEdit, cuadroData);
                alert('Cuadro de turno actualizado exitosamente');
            } else {
                await apiCuadroService.cuadros.createCompleto(cuadroData);
                alert('Cuadro de turno guardado exitosamente');
            }

            console.log('Cuadro guardado/actualizado exitosamente');
            navigate('/');

        } catch (err) {
            console.error('Error al guardar/actualizar cuadro:', err);

            // Manejo de errores
            if (err.response?.status === 409) {
                setErrorCuadro('Ya existe un cuadro con esta configuración');
            } else if (err.response?.status === 400) {
                setErrorCuadro(err.response?.data?.message || 'Datos inválidos');
            } else {
                setErrorCuadro(`Error al ${isEditMode ? 'actualizar' : 'guardar'} el cuadro de turno`);
            }
        } finally {
            setSaving(false);
        }
    };

    // Función para volver a las selecciones
    const handleVolver = () => {
        setShowCuadro(false);
        setMiembros([]);
        setErrorCuadro(null);
    };

    // Mostrar loading si estamos cargando datos para editar
    if (isEditMode && loadingCuadroData) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando datos del cuadro...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    // Mostrar loading específico para multiproceso mientras se redirige
    if (isEditMode && cuadroOriginal?.categoria?.toLowerCase() === 'multiproceso') {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Redirigiendo a edición multiproceso...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    <div className='text-sm text-gray-600'>Cargando procesos del cuadro</div>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {!showCuadro ? (
                // Vista de selecciones
                <div className='bg-white p-4 rounded-lg flex flex-col justify-center items-center gap-4 max-w-xl w-full mx-4'>
                    <div className='text-3xl text-center font-bold'>
                        {isEditMode ? 'Editar Cuadro de Turno' : 'Gestión Cuadros de Turno'}
                    </div>
                    <div className='text-lg text-center font-semibold'>
                        {isEditMode ? 'Modifica los datos del cuadro' : 'Seleccione una categoría para Cuadros de Turno'}
                    </div>

                    {/* Mostrar ID y nombre en modo edición */}
                    {isEditMode && cuadroIdToEdit && (
                        <div className='text-xs bg-blue-50 border border-blue-200 rounded px-1 py-2 w-full'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Edit size={16} className="text-blue-600" />
                                <span className='font-semibold text-blue-800'>Modo Edición Cuadro de Turno</span>
                            </div>
                            <div className='text-xs text-gray-700'>
                                <div><span className='text-xs'>ID:</span> {cuadroIdToEdit}</div>
                                <div>
                                    <span className='text-xs'>Nombre:</span>
                                    <span className='font-mono text-xs py-1 rounded'>
                                        {cuadroOriginal?.nombre || 'Cargando...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Primer select - Categorías */}
                    <div className="w-full">
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona una categoría
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
                            <option value="Multiproceso">Multiproceso</option>
                        </select>
                        {selectedCategory && selectedCategory !== 'Multiproceso' && (
                            <p className="mt-2 text-xs text-gray-600">Categoría seleccionada: {selectedCategory}</p>
                        )}
                    </div>

                    {/* Segundo select - Opciones dinámicas */}
                    {selectedCategory && selectedCategory !== 'Multiproceso' && (
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

                    {/* Tercer select - Equipos */}
                    {selectedCategory && selectedCategory !== 'Multiproceso' && (
                        <div className="w-full">
                            <label htmlFor="equipo-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Selecciona un Equipo
                            </label>

                            {loadingEquipos ? (
                                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                                    <p className="text-gray-500">Cargando equipos...</p>
                                </div>
                            ) : errorEquipos ? (
                                <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50">
                                    <p className="text-red-500">{errorEquipos}</p>
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
                                <p className="mt-2 text-xs text-gray-600">
                                    Equipo seleccionado: {selectedEquipo.nombre}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Botones de acción */}
                    {selectedCategory !== 'Multiproceso' && (
                        <div className='flex justify-center items-center gap-4 mt-4'>
                            <button
                                onClick={handleMostrarCuadro}
                                className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedOption && selectedEquipo.id
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={!selectedOption || !selectedEquipo.id}
                            >
                                {isEditMode ? <Edit size={20} color="white" strokeWidth={2} /> : <CheckIcon size={20} color="white" strokeWidth={2} />}
                                {isEditMode ? 'Editar Cuadro' : 'Crear Cuadro'}
                            </button>
                            <Link to="/">
                                <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                    <CircleXIcon size={20} color="white" strokeWidth={2} />
                                    Cancelar
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                // Vista del cuadro de turno
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4'>
                    {/* Header */}
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        {isEditMode ? 'Editando Cuadro de Turno' : 'Gestión de Turnos'}:
                    </div>

                    {/* Cuadro de Turno Info */}
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-800'>Crear Cuadro de Turno:</div>
                        {/* Información de edición*/}
                        {isEditMode && (
                            <div className='text-sm bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg mt-3'>
                                <div className='flex items-center justify-center gap-2 mb-1'>
                                    <Edit size={14} className="text-orange-600" />
                                    <span className='font-semibold text-orange-800'>Modificando cuadro existente</span>
                                </div>
                                <div className='space-y-1 text-gray-700'>
                                    <div><span className='font-medium'>ID:</span> {cuadroIdToEdit}</div>
                                    <div>
                                        <span className='font-medium'>Nombre:</span>
                                        <span className='ml-1 font-mono text-xs bg-white px-2 py-1 rounded border'>
                                            {cuadroOriginal?.nombre || 'No disponible'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resumen */}
                    <div className='text-center text-sm text-gray-600 space-y-1'>
                        <div><strong>Categoría:</strong> {selectedCategory}</div>
                        <div><strong>{selectedCategory}:</strong> {selectedOption.nombre}</div>
                        <div><strong>Equipo:</strong> {selectedEquipo.nombre}</div>
                    </div>

                    {/* Tabla */}
                    <div className='w-full'>
                        <div className='text-center text-2xl font-bold bg-blue-300 py-2 border-black rounded'>
                            Equipo de Talento Humano:
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
                                                <td className='px-4 py-3 text-gray-700'>{miembro.titulos?.join(', ')}</td>
                                                <td className='px-4 py-3 text-gray-700'>{miembro.nombreCompleto}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {errorCuadro && (
                        <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                            {errorCuadro}
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
                            {saving ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Cuadro' : 'Guardar Cuadro')}
                        </button>
                        <button
                            onClick={handleVolver}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                        <Link to="/">
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
}
