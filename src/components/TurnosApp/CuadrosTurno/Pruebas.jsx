import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Save, User, ArrowLeft, Edit, CircleXIcon, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pruebas() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Función para detectar modo edición y extraer ID
    const detectEditMode = () => {
        const pathname = location.pathname;
        console.log('Pathname actual:', pathname);

        const editMatch = pathname.match(/\/editar-turno\/(\d+)/);

        if (editMatch) {
            console.log('Modo edición detectado. ID:', editMatch[1]);
            return {
                isEditMode: true,
                turnoId: editMatch[1]
            };
        }

        const editFromQuery = searchParams.get('edit') === 'true';
        const idFromQuery = searchParams.get('id');

        if (editFromQuery && idFromQuery) {
            console.log('Modo edición desde query params. ID:', idFromQuery);
            return {
                isEditMode: true,
                turnoId: idFromQuery
            };
        }

        console.log('Modo creación detectado');
        return {
            isEditMode: false,
            turnoId: null
        };
    };

    const { isEditMode, turnoId } = detectEditMode();

    // Estados principales del formulario
    const [cuadroTurno, setCuadroTurno] = useState("");
    const [equipo, setEquipo] = useState("");
    const [fechaHoraInicio, setFechaHoraInicio] = useState("");
    const [fechaHoraFin, setFechaHoraFin] = useState("");
    const [selectedPersona, setSelectedPersona] = useState("");
    const [jornada, setJornada] = useState("Mañana (M)");
    const [tipoTurno, setTipoTurno] = useState("Presencial");

    // Estados para cargar datos
    const [personasEquipo, setPersonasEquipo] = useState([]);
    const [loadingPersonas, setLoadingPersonas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Estados para datos del cuadro y equipo desde URL
    const [cuadroData, setCuadroData] = useState({
        id: "",
        nombre: "",
        equipoId: ""
    });

    // Estados para modo edición
    const [loadingTurnoData, setLoadingTurnoData] = useState(false);
    const [turnoOriginal, setTurnoOriginal] = useState(null);

    // Calcular total de horas
    const calcularTotalHoras = () => {
        if (!fechaHoraInicio || !fechaHoraFin) return 0;

        const inicio = new Date(fechaHoraInicio);
        const fin = new Date(fechaHoraFin);

        if (fin <= inicio) return 0;

        const diffMs = fin - inicio;
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.round(diffHours * 100) / 100; // Redondear a 2 decimales
    };

    // useEffect para obtener datos de la URL
    useEffect(() => {
        const cuadroId = searchParams.get('cuadroId');
        const cuadroNombre = searchParams.get('cuadroNombre');
        const equipoId = searchParams.get('equipoId');

        if (cuadroId && cuadroNombre && equipoId) {
            setCuadroData({
                id: cuadroId,
                nombre: cuadroNombre,
                equipoId: equipoId
            });

            // Cargar personas del equipo
            loadPersonasEquipo(equipoId);
        }
    }, [searchParams]);

    // useEffect para cargar datos del turno si estamos en modo edición
    useEffect(() => {
        const loadTurnoForEdit = async () => {
            if (!isEditMode || !turnoId) {
                console.log('No es modo edición o no hay ID');
                return;
            }

            console.log('Cargando turno para editar. ID:', turnoId);

            try {
                setLoadingTurnoData(true);
                const response = await axios.get(`http://localhost:8080/turno/${turnoId}`);
                const turnoData = response.data;

                console.log('Datos del turno cargados:', turnoData);
                setTurnoOriginal(turnoData);

                // Poblar el formulario con los datos del turno
                setCuadroTurno(turnoData.cuadroTurno || "");
                setEquipo(turnoData.equipo || "");
                setFechaHoraInicio(turnoData.fechaHoraInicio || "");
                setFechaHoraFin(turnoData.fechaHoraFin || "");
                setSelectedPersona(turnoData.idPersona || "");
                setJornada(turnoData.jornada || "Mañana (M)");
                setTipoTurno(turnoData.tipoTurno || "Presencial");

                // Si tenemos equipoId del turno, cargar personas
                if (turnoData.equipoId) {
                    setCuadroData(prev => ({
                        ...prev,
                        equipoId: turnoData.equipoId
                    }));
                    loadPersonasEquipo(turnoData.equipoId);
                }

            } catch (err) {
                console.error('Error al cargar turno para editar:', err);
                setError('Error al cargar los datos del turno');
            } finally {
                setLoadingTurnoData(false);
            }
        };

        loadTurnoForEdit();
    }, [isEditMode, turnoId]);

    // Función para cargar personas del equipo
    const loadPersonasEquipo = async (equipoId) => {
        try {
            setLoadingPersonas(true);
            const response = await axios.get(`http://localhost:8080/usuario/equipo/${equipoId}/usuarios`);
            setPersonasEquipo(response.data || []);

            // Establecer nombre del equipo
            if (response.data && response.data.length > 0) {
                // Asumiendo que el nombre del equipo viene en la respuesta o podemos obtenerlo
                const equipoResponse = await axios.get(`http://localhost:8080/equipo/${equipoId}`);
                setEquipo(equipoResponse.data.nombre || `Equipo_${equipoId}`);
            }
        } catch (err) {
            console.error('Error al cargar personas del equipo:', err);
            setError('Error al cargar las personas del equipo');
        } finally {
            setLoadingPersonas(false);
        }
    };

    // Función para formatear fecha para input datetime-local
    const formatDateForInput = (dateTimeString) => {
        if (!dateTimeString) return "";
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 16);
    };

    // Función para guardar el turno
    const handleGuardarTurno = async () => {
        setSaving(true);
        setError("");

        try {
            // Validaciones
            if (!fechaHoraInicio || !fechaHoraFin || !selectedPersona) {
                throw new Error('Todos los campos son requeridos');
            }

            if (new Date(fechaHoraFin) <= new Date(fechaHoraInicio)) {
                throw new Error('La fecha/hora de fin debe ser posterior a la de inicio');
            }

            const turnoData = {
                cuadroTurno: cuadroData.nombre,
                idCuadroTurno: cuadroData.id,
                equipo: equipo,
                idEquipo: cuadroData.equipoId,
                fechaHoraInicio: fechaHoraInicio,
                fechaHoraFin: fechaHoraFin,
                idPersona: selectedPersona,
                jornada: jornada,
                tipoTurno: tipoTurno,
                totalHoras: calcularTotalHoras()
            };

            let response;

            if (isEditMode) {
                // Actualizar turno existente
                response = await axios.put(`http://localhost:8080/turno/${turnoId}`, turnoData);
            } else {
                // Crear nuevo turno
                response = await axios.post('http://localhost:8080/turno', turnoData);
            }

            alert(`Turno ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
            navigate('/turnos'); // Ajusta la ruta según tu aplicación

        } catch (err) {
            setError(err.response?.data?.message || err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el turno`);
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Mostrar loading si estamos cargando datos para editar
    if (isEditMode && loadingTurnoData) {
        return (
            <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                    <div className='text-2xl font-bold'>Cargando datos del turno...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-4 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
                <div className='text-3xl font-bold text-gray-800 text-center'>
                    {isEditMode ? 'Editar Turno' : 'Crear Turno'}
                </div>

                {isEditMode && turnoId && (
                    <div className='text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 w-full'>
                        <div className='flex items-center gap-2 mb-2'>
                            <Edit size={16} className="text-blue-600" />
                            <span className='font-semibold text-blue-800'>Modo Edición Turno</span>
                        </div>
                        <div className='text-xs text-gray-700'>
                            <div><span className='font-medium'>ID:</span> {turnoId}</div>
                        </div>
                    </div>
                )}

                <div className='w-full space-y-4'>
                    {/* Cuadro de Turno */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cuadro de Turno:
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                                {cuadroData.nombre || 'No especificado'}
                            </div>
                        </div>

                        {/* Equipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Equipo:
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                                {equipo || 'Cargando...'}
                            </div>
                        </div>
                    </div>

                    {/* Fechas y Horas */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="fecha-inicio" className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha/Hora Inicio:
                            </label>
                            <input
                                type="datetime-local"
                                id="fecha-inicio"
                                value={formatDateForInput(fechaHoraInicio)}
                                onChange={(e) => setFechaHoraInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="fecha-fin" className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha/Hora Fin:
                            </label>
                            <input
                                type="datetime-local"
                                id="fecha-fin"
                                value={formatDateForInput(fechaHoraFin)}
                                onChange={(e) => setFechaHoraFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Persona */}
                    <div>
                        <label htmlFor="persona-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Persona:
                        </label>
                        {loadingPersonas ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                <p className="text-gray-500 text-sm">Cargando personas...</p>
                            </div>
                        ) : (
                            <select
                                id="persona-select"
                                value={selectedPersona}
                                onChange={(e) => setSelectedPersona(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Selecciona Persona</option>
                                {personasEquipo.map((persona) => (
                                    <option key={persona.idPersona} value={persona.idPersona}>
                                        {persona.nombreCompleto} - {persona.documento}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Jornada y Tipo de Turno */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="jornada-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Jornada:
                            </label>
                            <select
                                id="jornada-select"
                                value={jornada}
                                onChange={(e) => setJornada(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Mañana (M)">Mañana (M)</option>
                                <option value="Tarde (T)">Tarde (T)</option>
                                <option value="Noche (N)">Noche (N)</option>
                                <option value="24 Horas">24 Horas</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tipo-turno-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo Turno:
                            </label>
                            <select
                                id="tipo-turno-select"
                                value={tipoTurno}
                                onChange={(e) => setTipoTurno(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Mixto">Mixto</option>
                            </select>
                        </div>
                    </div>

                    {/* Total de Horas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Horas:
                        </label>
                        <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-sm font-semibold text-blue-800 flex items-center gap-2">
                            <Clock size={16} />
                            {calcularTotalHoras()} horas
                        </div>
                    </div>
                </div>

                {error && (
                    <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center text-sm'>
                        {error}
                    </div>
                )}

                <div className='flex justify-center items-center gap-4 mt-6'>
                    <button
                        onClick={handleGuardarTurno}
                        disabled={saving || !fechaHoraInicio || !fechaHoraFin || !selectedPersona}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving || !fechaHoraInicio || !fechaHoraFin || !selectedPersona
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        <Save size={20} color="white" strokeWidth={2} />
                        {saving ? (isEditMode ? 'Actualizando...' : 'Guardando...') : 'Guardar'}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} color="white" strokeWidth={2} />
                        Volver
                    </button>

                    <Link to="/turnos">
                        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex justify-center items-center gap-2 transition-colors">
                            <CircleXIcon size={20} color="white" strokeWidth={2} />
                            Cancelar
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};