import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, CircleXIcon, User } from 'lucide-react';
import axios from 'axios';

export default function CrearCuadro5() {
    const [searchParams] = useSearchParams();
    const categoria = searchParams.get('categoria');
    const seleccion = searchParams.get('seleccion');
    const equipo = searchParams.get('equipoID');
    const equipoTalento = searchParams.get('equipoTalento');

    const [equipoData, setEquipoData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Generar el nombre del cuadro de turno
    const generateCuadroName = () => {
        const prefix = "CT";
        const categoriaShort = categoria ? categoria.substring(0, 3) : "Cat";
        const seleccionShort = seleccion ? seleccion.replace(/\s+/g, '_') : "Sel";
        const equipoShort = equipo ? equipo.replace(/\s+/g, '_') : "Eq";
        const equipoTalentoShort = equipoTalento ? equipoTalento.replace(/\s+/g, '_') : "ET";

        return `${prefix}_${categoriaShort}_${seleccionShort}_${equipoShort}_${equipoTalentoShort}_01`;
    };

    useEffect(() => {
        // Simular datos del equipo de talento humano
        // En un caso real, estos datos vendrían de una API
        const mockEquipoData = [
            {
                id: 1,
                perfil: "Cardiólogo",
                nombre: "Pedro Muñoz"
            },
            {
                id: 2,
                perfil: "Cardiólogo",
                nombre: "Jose Flores"
            },
            {
                id: 3,
                perfil: "Cardiólogo",
                nombre: "Sofia Navia"
            }
        ];

        setEquipoData(mockEquipoData);
    }, []);

    const handleGuardarCuadro = async () => {
        setSaving(true);
        setError(null);

        try {
            const cuadroData = {
                nombre: generateCuadroName(),
                categoria,
                seleccion,
                equipo,
                equipoTalento,
                equipoTalentoHumano: equipoData
            };

            // Simulación de guardado - reemplazar con llamada real a la API
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Cuadro guardado:', cuadroData);

            // Redirigir o mostrar mensaje de éxito
            alert('Cuadro de turno guardado exitosamente');

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
            equipo: equipo || ''
        });

        return categoria === 'Multiproceso'
            ? `/CrearCuadroMulti?${params.toString()}`
            : `/crearCuadro4?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-6 max-w-4xl w-full mx-4'>

                {/* Header */}
                <div className='text-center space-y-2'>
                    <div className='text-3xl font-bold text-gray-800'>Gestión de Turnos:</div>


                </div>

                {/* Cuadro de Turno Info */}
                <div className='text-center space-y-2'>
                    <div className='text-3xl font-bold text-gray-800'>Cuadro de Turno:</div>
                    <div className='text-lg font-semibold text-blue-600 bg-gray-50 px-4 py-2 rounded'>
                        {generateCuadroName()}
                    </div>
                </div>

                {/* Resumen de selecciones previas */}
                <div className='text-center space-y-1 text-sm text-gray-600'>
                    <div><strong>Categoría:</strong> {categoria}</div>
                    <div><strong>{categoria}:</strong> {seleccion}</div>
                    <div><strong>Equipo:</strong> {equipo}</div>
                </div>

                {/* Equipo de Talento Humano Table */}
                <div className='w-full'>
                    <div className='text-center text-lg font-semibold mb-4 bg-blue-100 py-2 rounded'>
                        Equipo de Talento Humano:
                    </div>

                    <div className='border border-gray-300 rounded-lg overflow-hidden'>
                        <table className='w-full'>
                            <tbody>
                                {equipoData.map((persona, index) => (
                                    <tr key={persona.id} className='border-b border-gray-200 hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-center border-r border-gray-200'>
                                            <User size={24} className='text-gray-600 mx-auto' />
                                        </td>
                                        <td className='px-4 py-3 font-medium text-gray-700 border-r border-gray-200'>
                                            Perfil: {persona.perfil}
                                        </td>
                                        <td className='px-4 py-3 text-gray-700'>
                                            Nombre: {persona.nombre}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='w-full p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center'>
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
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