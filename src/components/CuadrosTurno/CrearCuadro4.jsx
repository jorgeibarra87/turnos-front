import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CircleXIcon, User } from 'lucide-react';
import axios from 'axios';

export default function CrearCuadro4() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const seleccion = searchParams.get('seleccion');
    const seleccionIdNum = searchParams.get('seleccionId');
    const equipoId = searchParams.get("equipoId");
    const equipoNombre = searchParams.get("equipoNombre");
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    //console.log("seleccionId:", seleccionId);

    const generaNombreCuadro = () => {
        let nombreBase = '';
        nombreBase += categoria + '_';
        nombreBase += seleccion;
        //nombreBase += seleccionId;
        nombreBase += '_' + equipoNombre;
        return `CT_01_${nombreBase}`;
    };

    useEffect(() => {
        const fetchMiembros = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/equipo/${equipoId}/miembros-perfil`);
                setMiembros(response.data);
            } catch (error) {
                console.error("Error al obtener miembros del equipo:", error);
                setMiembros([]);
            } finally {
                setLoading(false);
            }
        };

        if (equipoId) {
            fetchMiembros();
        }
    }, [equipoId]);

    const handleGuardarCuadro = async () => {
        setSaving(true);
        setError(null);

        try {
            const cuadroData = {
                categoria: categoria.toLowerCase(), // El backend espera en minúsculas
                anio: "2025",
                mes: "07",
                turnoExcepcion: false,
                idEquipo: parseInt(equipoId),
            };

            // Establecer el ID correcto según la categoría
            const idSeleccion = parseInt(seleccion);
            if (categoria === 'Macroproceso') {
                cuadroData.idMacroproceso = seleccionIdNum;
            } else if (categoria === 'Proceso') {
                cuadroData.idProceso = seleccionIdNum;
            } else if (categoria === 'Servicio') {
                cuadroData.idServicio = seleccionIdNum;
            } else if (categoria === 'Sección') {
                cuadroData.idSeccionServicio = seleccionIdNum;
            } else if (categoria === 'Subsección') {
                cuadroData.idSubseccionServicio = seleccionIdNum;
            }

            const response = await axios.post('http://localhost:8080/cuadro-turnos/crear-total', cuadroData);

            console.log('Cuadro guardado:', response.data);
            alert('Cuadro de turno guardado exitosamente');
            navigate('/CrearCuadro');
        } catch (err) {
            setError('Error al guardar el cuadro de turno');
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    const getPreviousStepUrl = () => {
        const params = new URLSearchParams({
            categoria: categoria || '',
            seleccion: seleccion || '',
            equipo: equipoNombre || ''
        });

        return categoria === 'Multiproceso'
            ? `/CrearCuadroMulti?${params.toString()}`
            : `/crearCuadro4?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
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
                    <div><strong>Categoría:</strong> {categoria}</div>
                    <div><strong>{categoria}:</strong> {seleccion}</div>
                    <div><strong>Equipo:</strong> {equipoNombre}</div>
                </div>

                {/* Tabla */}
                <div className='w-full'>
                    <div className='text-center text-2xl font-bold bg-blue-300 py-2 border-black rounded'>
                        Equipo de Talento Humano:
                    </div>

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
                        disabled={saving}
                        className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${saving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        <Save size={20} color="white" strokeWidth={2} />
                        {saving ? 'Guardando...' : 'Guardar Cuadro'}
                    </button>
                    <Link to={`/crearCuadro3?categoria=${encodeURIComponent(categoria)}&seleccion=${encodeURIComponent(seleccion)}`}>
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
