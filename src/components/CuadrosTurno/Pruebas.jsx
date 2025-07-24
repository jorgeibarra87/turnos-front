import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User2, CheckIcon, CircleXIcon, Save, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pruebas() {
    const navigate = useNavigate();

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

    // Función para manejar el cambio de categoría
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        setSelectedOption(""); // Resetear la opción seleccionada
        setOptions([]); // Limpiar las opciones anteriores
        setError(""); // Limpiar errores

        // Resetear equipos también
        setSelectedEquipo({ id: "", nombre: "" });
    };

    // useEffect para cargar datos cuando cambia la categoría
    useEffect(() => {
        const fetchOptions = async () => {
            if (!selectedCategory) {
                setOptions([]);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Determinar qué endpoint llamar según la categoría
                let endpoint = '';
                let idField = '';

                switch (selectedCategory) {
                    case 'Macroproceso':
                        endpoint = 'http://localhost:8080/macroprocesos';
                        idField = 'idMacroproceso';
                        break;
                    case 'Proceso':
                        endpoint = 'http://localhost:8080/procesos';
                        idField = 'idProceso';
                        break;
                    case 'Servicio':
                        endpoint = 'http://localhost:8080/servicio';
                        idField = 'idServicio';
                        break;
                    case 'Seccion':
                        endpoint = 'http://localhost:8080/seccionesServicio';
                        idField = 'idSeccionServicio';
                        break;
                    case 'Subseccion':
                        endpoint = 'http://localhost:8080/subseccionesServicio';
                        idField = 'idSubseccionServicio';
                        break;
                    case 'Multiproceso':
                        endpoint = 'http://localhost:8080/procesosAtencion';
                        idField = 'idProcesoAtencion';
                        break;
                    default:
                        setLoading(false);
                        return;
                }

                setOptionId(idField);
                const response = await axios.get(endpoint);
                setOptions(response.data);

            } catch (err) {
                setError(err.message);
                console.error('Error al cargar opciones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [selectedCategory]); // Se ejecuta cuando cambia selectedCategory

    // useEffect para cargar equipos cuando se selecciona una categoría
    useEffect(() => {
        const fetchEquipos = async () => {
            if (!selectedCategory) {
                setEquipos([]);
                return;
            }

            try {
                setLoadingEquipos(true);
                setErrorEquipos("");
                const response = await axios.get('http://localhost:8080/equipo');

                if (response.data && Array.isArray(response.data)) {
                    // Asegurarnos de que los equipos tienen idEquipo y nombre
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
                setErrorEquipos('Error al cargar los equipos');
                console.error('Error al cargar equipos:', err);
                setEquipos([]);
            } finally {
                setLoadingEquipos(false);
            }
        };

        fetchEquipos();
    }, [selectedCategory]); // Se ejecuta cuando cambia selectedCategory

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
        if (!selectedCategory || !selectedOption || !selectedEquipo.nombre) return '';

        let nombreBase = '';
        nombreBase += selectedCategory + '_';
        nombreBase += selectedOption.nombre;
        nombreBase += '_' + selectedEquipo.nombre;
        return `CT_01_${nombreBase}`;
    };

    // Función para mostrar el cuadro de turno
    const handleMostrarCuadro = async () => {
        setShowCuadro(true);
        setLoadingMiembros(true);
        setErrorCuadro(null);

        try {
            const response = await axios.get(`http://localhost:8080/equipo/${selectedEquipo.id}/miembros-perfil`);
            setMiembros(response.data);
        } catch (error) {
            console.error("Error al obtener miembros del equipo:", error);
            setErrorCuadro("Error al cargar los miembros del equipo");
            setMiembros([]);
        } finally {
            setLoadingMiembros(false);
        }
    };

    // Función para guardar el cuadro
    const handleGuardarCuadro = async () => {
        setSaving(true);
        setErrorCuadro(null);

        try {
            const cuadroData = {
                categoria: selectedCategory.toLowerCase(),
                anio: "2025",
                mes: "07",
                turnoExcepcion: false,
                idEquipo: parseInt(selectedEquipo.id),
            };

            // Establecer el ID correcto según la categoría
            if (selectedCategory === 'Macroproceso') {
                cuadroData.idMacroproceso = selectedOption[optionId];
            } else if (selectedCategory === 'Proceso') {
                cuadroData.idProceso = selectedOption[optionId];
            } else if (selectedCategory === 'Servicio') {
                cuadroData.idServicio = selectedOption[optionId];
            } else if (selectedCategory === 'Sección') {
                cuadroData.idSeccionServicio = selectedOption[optionId];
            } else if (selectedCategory === 'Subsección') {
                cuadroData.idSubseccionServicio = selectedOption[optionId];
            }

            const response = await axios.post('http://localhost:8080/cuadro-turnos/crear-total', cuadroData);

            console.log('Cuadro guardado:', response.data);
            alert('Cuadro de turno guardado exitosamente');

            // Resetear todo para crear un nuevo cuadro
            handleVolver();

        } catch (err) {
            setErrorCuadro('Error al guardar el cuadro de turno');
            console.error('Error:', err);
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

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {!showCuadro ? (
                // Vista de selecciones
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-3xl text-center font-bold'>Gestión Cuadros de Turno</div>
                    <div className='text-lg text-center font-semibold'>Seleccione una categoría para Cuadros de Turno</div>

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
                        {selectedCategory && (
                            <p className="mt-2 text-xs text-gray-600">Categoría seleccionada: {selectedCategory}</p>
                        )}
                    </div>

                    {/* Segundo select - Opciones dinámicas */}
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

                    {/* Tercer select - Equipos */}
                    {selectedCategory && (
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
                    <div className='flex justify-center items-center gap-4 mt-4'>
                        <button
                            onClick={handleMostrarCuadro}
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedOption && selectedEquipo.id
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedOption || !selectedEquipo.id}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Crear Cuadro
                        </button>
                        <Link to="/">
                            <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                                <CircleXIcon size={20} color="white" strokeWidth={2} />
                                Cancelar
                            </button>
                        </Link>
                    </div>
                </div>
            ) : (
                // Vista del cuadro de turno
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4'>
                    {/* Header */}
                    <div className='text-3xl font-bold text-gray-800 text-center'>
                        Gestión de Turnos:
                    </div>

                    {/* Cuadro de Turno Info */}
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-800'>Cuadro de Turno:</div>
                        <div className='text-lg font-semibold text-blue-600 bg-gray-50 px-4 py-2 rounded mt-1'>
                            {generaNombreCuadro()}
                        </div>
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
                            {saving ? 'Guardando...' : 'Guardar Cuadro'}
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