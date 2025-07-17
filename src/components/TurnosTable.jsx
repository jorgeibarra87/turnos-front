import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const TurnosTable = ({ turnos }) => (
    <div className="p-6 bg-white shadow rounded">
        <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Crear Cuadro de Turno
        </button>

        <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-white">
                <tr>
                    <th className="p-3">Cuadro</th>
                    <th className="p-3">Equipo</th>
                    <th className="p-3">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {turnos.map((t) => (
                    <tr key={t.id} className="border-b">
                        <td className="p-3">{t.cuadroTurno}</td>
                        <td className="p-3">{t.equipo}</td>
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

export default TurnosTable;