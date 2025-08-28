import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CheckIcon, CircleXIcon, Save, User, ArrowLeft, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiTurnoService } from '../Services/apiTurnoService';

export default function CrearTurnos() {

    const [searchParams] = useSearchParams();
    //const procesos = searchParams.get('procesos');
    //const seleccion = searchParams.get('seleccion');
    //const seleccionId = searchParams.get('seleccionId');
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

    // Función para manejar el cambio en el select de cuadros;
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
        //console.log("seleccionId:", seleccionId);
        const nextRoute = '/GestionTurnos';
        return `${nextRoute}?${params.toString()}`;
    };

    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-xl w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Gestion de Turnos</div>

                <div className='text-center space-y-2'>
                    <div className='text-lg font-semibold text-blue-600'>
                        Selecciona un Cuadro de turno para gestionar los turnos
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
                        <p className="text-xs ffont-extralight text-gray-700 p-2">Cuadro seleccionado:{selectedCuadro.nombre}</p>
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

                    {/* <Link to={`#`}>
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex justify-center items-center gap-2 transition-colors">
                            <ArrowLeft size={20} color="white" strokeWidth={2} />
                            Volver
                        </button>
                    </Link> */}

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
};