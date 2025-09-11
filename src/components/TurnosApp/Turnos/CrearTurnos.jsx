import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CheckIcon, CircleXIcon, Save, User, ArrowLeft, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiTurnoService } from '../Services/apiTurnoService';

export default function CrearTurnos() {
    const [searchParams] = useSearchParams();
    const [selectedCuadro, setSelectedCuadro] = useState({ id: "", nombre: "" });
    const [cuadros, setCuadros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCuadros = async () => {
            try {
                setLoading(true);
                setError(null);

                // Usar servicio
                const cuadrosFormateados = await apiTurnoService.auxiliares.getCuadrosFormateados();
                setCuadros(cuadrosFormateados);

            } catch (err) {
                setError('Error al cargar los cuadros');
                console.error('Error al cargar cuadros:', err);
                setCuadros([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCuadros();
    }, []);

    // Función para manejar el cambio en el select de cuadros
    const handleCuadroChange = (e) => {
        const cuadroId = e.target.value;
        const cuadroSeleccionado = cuadros.find(cuadro =>
            cuadro.idCuadroTurno.toString() === cuadroId.toString()
        );

        if (cuadroSeleccionado) {
            setSelectedCuadro({
                id: cuadroSeleccionado.idCuadroTurno,
                nombre: cuadroSeleccionado.nombre,
                idEquipo: cuadroSeleccionado.idEquipo
            });
        } else {
            setSelectedCuadro({ id: "", nombre: "", idEquipo: null });
        }
    };

    console.log("selectedCuadro", selectedCuadro);

    const getNextStepUrl = () => {
        if (!selectedCuadro.id) return "#";

        const params = new URLSearchParams({
            cuadroId: selectedCuadro.id,
            cuadroNombre: selectedCuadro.nombre,
            equipoId: selectedCuadro.idEquipo
        });

        const nextRoute = '/GestionTurnos';
        return `${nextRoute}?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-xl w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Gestión de Turnos</div>

                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Selecciona un Cuadro de turno para gestionar los turnos
                    </div>
                    {/* ✅ INFORMACIÓN SOBRE CÁLCULO AUTOMÁTICO */}
                    <div className='text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200'>
                        <div className='font-medium text-blue-800 mb-1'>ℹ️ Cálculo Automático Habilitado</div>
                        <div className='text-xs space-y-1'>
                            <div><strong>Jornada:</strong> Se calcula automáticamente según la hora de inicio</div>
                            <div><strong>Tipo:</strong> Se determina según las horas de duración del turno</div>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <label htmlFor="cuadro-select" className="block text-sm font-bold text-gray-700 mb-2">
                        Selecciona un Cuadro
                    </label>

                    {loading ? (
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-center">
                            <p className="text-gray-500">Cargando cuadros...</p>
                        </div>
                    ) : error ? (
                        <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50">
                            <p className="text-red-500 text-center">{error}</p>
                        </div>
                    ) : (
                        <select
                            id="cuadro-select"
                            value={selectedCuadro.id}
                            onChange={handleCuadroChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona un cuadro --</option>
                            {cuadros.map((cuadro, index) => (
                                <option key={cuadro.idCuadroTurno || index} value={cuadro.idCuadroTurno}>
                                    {cuadro.nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedCuadro.id && (
                        <div className="space-y-2 mt-3">
                            <p className="text-xs font-extralight text-gray-700 p-2">
                                <strong>Cuadro seleccionado:</strong> {selectedCuadro.nombre}
                            </p>

                            {/* ✅ MOSTRAR REGLAS DE JORNADAS */}
                            <div className="text-xs bg-gray-50 p-3 rounded border">
                                <div className="font-medium text-gray-800 mb-2">📋 Reglas de Jornadas Automáticas:</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><strong>🌅 Mañana:</strong> 06:00 - 11:59</div>
                                    <div><strong>🌆 Tarde:</strong> 12:00 - 17:59</div>
                                    <div><strong>🌙 Noche:</strong> 18:00 - 05:59</div>
                                    <div><strong>⏰ 24 Horas:</strong> Turnos completos</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link to={getNextStepUrl()}>
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedCuadro.id
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedCuadro.id}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Gestionar
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
