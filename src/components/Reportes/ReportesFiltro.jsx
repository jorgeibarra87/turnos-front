import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../ui/Card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ReportesFiltro() {
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [cuadroId, setCuadroId] = useState(1);
    const [reporte, setReporte] = useState(null);

    const [cuadros, setCuadros] = useState([]); // lista de cuadros desde backend

    useEffect(() => {
        // cargar lista de cuadros para el select
        axios.get("http://localhost:8080/cuadro-turnos")
            .then(res => setCuadros(res.data))
            .catch(err => console.error("Error cargando cuadros:", err));
    }, []);

    const fetchReporte = () => {
        axios.get(`http://localhost:8080/reportes/${anio}/${mes}/${cuadroId}`)
            .then(res => setReporte(res.data))
            .catch(err => console.error("Error cargando reporte:", err));
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatearHora = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const COLORS = ["#4CAF50", "#FF9800", "#2196F3"];

    return (
        <div className="p-6 space-y-6">
            {/* Filtros */}
            <Card className="shadow-lg">
                <CardContent className="flex flex-wrap gap-4 items-center p-4">
                    <div>
                        <label className="block text-sm font-semibold">Año</label>
                        <select
                            className="border rounded p-1"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold">Mes</label>
                        <select
                            className="border rounded p-1"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold">Cuadro</label>
                        <select
                            className="border rounded p-1"
                            value={cuadroId}
                            onChange={(e) => setCuadroId(e.target.value)}
                        >
                            {cuadros.map(c => (
                                <option key={c.idCuadroTurno} value={c.idCuadroTurno}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchReporte}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
                    >
                        Generar Reporte
                    </button>
                </CardContent>
            </Card>

            {/* Contenido del Reporte */}
            {reporte && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Resumen */}
                        <Card className="col-span-2 shadow-lg">
                            <CardContent className="flex justify-around p-6 text-center">
                                <div>
                                    <h2 className="text-xl font-bold">Año</h2>
                                    <p className="text-2xl">{reporte.anio}</p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Mes</h2>
                                    <p className="text-2xl">{reporte.mes}</p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Turnos</h2>
                                    <p className="text-2xl">{reporte.detalleTurnos.length}</p>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Horas Totales</h2>
                                    <p className="text-2xl">
                                        {reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        {console.log('reporte: ', reporte)}
                        {/* Horas por persona */}
                        <Card className="shadow-lg">
                            <CardContent className="p-4">
                                <h2 className="text-lg font-bold mb-4">Horas por Persona</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={Object.entries(reporte.horasPorUsuario).map(([nombre, horas]) => ({
                                            nombre,
                                            horas
                                        }))}
                                    >
                                        <XAxis dataKey="nombre" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="horas" fill="#4CAF50" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Distribución por jornada */}
                        <Card className="shadow-lg">
                            <CardContent className="p-4">
                                <h2 className="text-lg font-bold mb-4">Distribución por Jornada</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={["Mañana", "Tarde", "Noche"].map(j => ({
                                                jornada: j,
                                                valor: reporte.detalleTurnos.filter(t => t.jornada === j).length
                                            }))}
                                            dataKey="valor"
                                            nameKey="jornada"
                                            outerRadius={100}
                                            label
                                        >
                                            {["Mañana", "Tarde", "Noche"].map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla de Detalle de Turnos Agrupada por Persona */}
                    <Card className="shadow-lg">
                        <CardContent className="p-4">
                            <h2 className="text-lg font-bold mb-4">Detalle de Turnos por Persona</h2>
                            <div className="overflow-x-auto">
                                {(() => {
                                    // Agrupar turnos por usuario
                                    const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                                        const usuario = turno.usuario || "Sin asignar";
                                        if (!acc[usuario]) {
                                            acc[usuario] = [];
                                        }
                                        acc[usuario].push(turno);
                                        return acc;
                                    }, {});

                                    return Object.entries(turnosPorUsuario).map(([usuario, turnos]) => {
                                        const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

                                        return (
                                            <div key={usuario} className="mb-6">
                                                {/* Encabezado del usuario */}
                                                <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
                                                    <h3 className="text-lg font-semibold">{usuario}</h3>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>Turnos: {turnos.length}</span>
                                                        <span>Total Horas: {totalHoras}</span>
                                                    </div>
                                                </div>

                                                {/* Tabla de turnos del usuario */}
                                                <table className="w-full border-collapse border border-gray-300 rounded-b-lg overflow-hidden">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Jornada</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Fecha Inicio</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Hora Inicio</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Fecha Fin</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Hora Fin</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Horas</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {turnos
                                                            .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                                                            .map((turno, index) => (
                                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                    <td className="border border-gray-300 px-4 py-2">
                                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${turno.jornada === "Mañana" ? "bg-green-100 text-green-800" :
                                                                            turno.jornada === "Tarde" ? "bg-orange-100 text-orange-800" :
                                                                                turno.jornada === "Noche" ? "bg-blue-100 text-blue-800" :
                                                                                    "bg-gray-100 text-gray-800"
                                                                            }`}>
                                                                            {turno.jornada || "N/A"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2">{formatearFecha(turno.fechaInicio)}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{formatearHora(turno.fechaInicio)}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{formatearFecha(turno.fechaFin)}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{formatearHora(turno.fechaFin)}</td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                                                        {turno.horas || 0}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    });
                                })()}

                                {reporte.detalleTurnos.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No hay turnos registrados para el período seleccionado
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}