import React from 'react';
import { Eye, Edit, Trash2, CopyPlusIcon, CopyPlus, UsersIcon, BoxesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CrearCuadro from './CuadrosTurno/CrearCuadro';

export default function TurnosTable() {
    const [cuadros, setCuadros] = useState([]);

    useEffect(() => {
        loadCuadros();
    }, []);

    const loadCuadros = async () => {
        const result = await axios.get("http://localhost:8080/cuadro-turnos");
        console.log(result.data);
        setCuadros(result.data);
    };
    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className='m-10 text-5xl text-center font-bold'>Gestion Cuadros de Turno</div>
            <Link to="/crearCuadro">
                <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 flex items-center gap-2">
                    <CopyPlus size={22} color="white" strokeWidth={2} />
                    Crear Cuadro de Turno
                </button>
            </Link>
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3">Cuadro</th>
                        <th className="p-3 flex items-center gap-2"><UsersIcon />Equipo</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cuadros.map((cuadro) => (
                        <tr key={cuadro.idCuadroTurno} className="border-b">
                            <td className="p-3 text-xs">{cuadro.nombre}</td>
                            <td className="p-3 text-xs">{cuadro?.nombreEquipo || 'Sin equipo'}</td>
                            <td className="p-3 space-x-3">
                                <button title="Ver"><Eye size={18} className="text-gray-600 hover:text-blue-600" /></button>
                                <button title="Editar"><Edit size={18} className="text-gray-600 hover:text-yellow-600" /></button>
                                <button title="Eliminar"><Trash2 size={18} className="text-gray-600 hover:text-red-600" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
