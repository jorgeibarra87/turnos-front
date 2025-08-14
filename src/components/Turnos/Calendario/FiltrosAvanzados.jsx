import React from 'react';
import { Calendar, User, Settings } from 'lucide-react';

const FiltrosAvanzados = ({ filtros, setFiltros, cuadrosTurno, procesos, perfiles }) => {
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Settings size={16} />
                Filtros Avanzados
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rango de fechas */}
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha Desde:</label>
                    <input
                        type="date"
                        value={filtros.fechaDesde || ''}
                        onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Fecha Hasta:</label>
                    <input
                        type="date"
                        value={filtros.fechaHasta || ''}
                        onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Estado del turno */}
                <div>
                    <label className="block text-sm font-medium mb-1">Estado:</label>
                    <select
                        value={filtros.estado || ''}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="abierto">Abierto</option>
                        <option value="cerrado">Cerrado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                {/* Jornada */}
                <div>
                    <label className="block text-sm font-medium mb-1">Jornada:</label>
                    <select
                        value={filtros.jornada || ''}
                        onChange={(e) => setFiltros({ ...filtros, jornada: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las jornadas</option>
                        <option value="Diurna">Diurna</option>
                        <option value="Nocturna">Nocturna</option>
                        <option value="Mixta">Mixta</option>
                    </select>
                </div>

                {/* Horas mínimas */}
                <div>
                    <label className="block text-sm font-medium mb-1">Horas Mínimas:</label>
                    <input
                        type="number"
                        min="0"
                        max="24"
                        value={filtros.horasMinimas || ''}
                        onChange={(e) => setFiltros({ ...filtros, horasMinimas: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                </div>

                {/* Buscar por nombre */}
                <div>
                    <label className="block text-sm font-medium mb-1">Buscar Persona:</label>
                    <input
                        type="text"
                        value={filtros.nombrePersona || ''}
                        onChange={(e) => setFiltros({ ...filtros, nombrePersona: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de la persona..."
                    />
                </div>
            </div>
        </div>
    );
};

export default FiltrosAvanzados;
