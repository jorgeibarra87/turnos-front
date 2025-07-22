import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, CircleXIcon } from 'lucide-react';

export default function CrearCuadro() {
    const [selectedOption, setSelectedOption] = useState("");

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div className='absolute inset-0  bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5 max-w-lg w-full mx-4'>
                <div className='text-3xl text-center font-bold'>Gestión Cuadros de Turno</div>
                <div className='text-lg text-center font-semibold'>Seleccione una categoría para Cuadros de Turno</div>

                <div className="w-full">
                    <label htmlFor="select" className="block text-sm font-medium text-gray-700 mb-2">
                        Selecciona una opción
                    </label>
                    <select
                        id="select"
                        value={selectedOption}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Selecciona --</option>
                        <option value="Macroproceso">Macroproceso</option>
                        <option value="Proceso">Proceso</option>
                        <option value="Servicio">Servicio</option>
                        <option value="Seccion">Sección</option>
                        <option value="Subseccion">Subsección</option>
                        <option value="Multiproceso">Multiproceso</option>
                    </select>
                    {selectedOption && (
                        <p className="mt-2 text-xs text-gray-600">Seleccionaste: {selectedOption}</p>
                    )}
                </div>

                <div className='flex justify-center items-center gap-4 mt-4'>
                    <Link
                        to={selectedOption ?
                            (selectedOption === 'Multiproceso' ?
                                `/crearCuadroMulti?categoria=${encodeURIComponent(selectedOption)}` :
                                `/crearCuadro2?categoria=${encodeURIComponent(selectedOption)}`) :
                            "#"}
                    >
                        <button
                            className={`px-6 py-2 text-white rounded-lg flex justify-center items-center gap-2 transition-colors ${selectedOption
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!selectedOption}
                        >
                            <CheckIcon size={20} color="white" strokeWidth={2} />
                            Aceptar
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