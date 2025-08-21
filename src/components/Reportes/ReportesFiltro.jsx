import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../ui/Card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportesFiltro() {
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [cuadroId, setCuadroId] = useState(1);
    const [reporte, setReporte] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [cuadros, setCuadros] = useState([]); // lista de cuadros desde backend

    useEffect(() => {
        // cargar lista de cuadros para el select
        axios.get("http://localhost:8080/cuadro-turnos")
            .then(res => setCuadros(res.data))
            .catch(err => console.error("Error cargando cuadros:", err));
    }, []);

    const fetchReporte = () => {
        axios.get(`http://localhost:8080/reportes/${anio}/${mes}/${cuadroId}`)
            .then(res => {
                setReporte(res.data);
                setCurrentPage(1); // Resetear a primera página
            })
            .catch(err => console.error("Error cargando reporte:", err));
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        if (!reporte || !reporte.detalleTurnos.length) {
            alert('No hay datos para exportar');
            return;
        }

        // Preparar los datos para Excel
        const excelData = [];

        // Agregar información del reporte
        excelData.push({
            'Usuario': `REPORTE DE TURNOS - ${reporte.mes}/${reporte.anio}`,
            'Total Turnos': '',
            'Total Horas': '',
            'Jornada': '',
            'Fecha Inicio': '',
            'Hora Inicio': '',
            'Fecha Fin': '',
            'Hora Fin': '',
            'Horas': ''
        });

        excelData.push({
            'Usuario': `Total Turnos: ${reporte.detalleTurnos.length}`,
            'Total Turnos': `Total Horas: ${reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0)}`,
            'Total Horas': '',
            'Jornada': '',
            'Fecha Inicio': '',
            'Hora Inicio': '',
            'Fecha Fin': '',
            'Hora Fin': '',
            'Horas': ''
        });

        // Agregar fila vacía
        excelData.push({
            'Usuario': '',
            'Total Turnos': '',
            'Total Horas': '',
            'Jornada': '',
            'Fecha Inicio': '',
            'Hora Inicio': '',
            'Fecha Fin': '',
            'Hora Fin': '',
            'Horas': ''
        });

        // Agrupar turnos por usuario
        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) {
                acc[usuario] = [];
            }
            acc[usuario].push(turno);
            return acc;
        }, {});

        // Crear filas para Excel
        Object.entries(turnosPorUsuario).forEach(([usuario, turnos]) => {
            const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

            // Agregar fila de encabezado del usuario
            excelData.push({
                'Usuario': usuario,
                'Total Turnos': `${turnos.length} turnos`,
                'Total Horas': `${totalHoras} horas`,
                'Jornada': '',
                'Fecha Inicio': '',
                'Hora Inicio': '',
                'Fecha Fin': '',
                'Hora Fin': '',
                'Horas': ''
            });

            // Agregar turnos del usuario
            turnos
                .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                .forEach(turno => {
                    excelData.push({
                        'Usuario': '',
                        'Total Turnos': '',
                        'Total Horas': '',
                        'Jornada': turno.jornada || 'N/A',
                        'Fecha Inicio': formatearFecha(turno.fechaInicio),
                        'Hora Inicio': formatearHora(turno.fechaInicio),
                        'Fecha Fin': formatearFecha(turno.fechaFin),
                        'Hora Fin': formatearHora(turno.fechaFin),
                        'Horas': turno.horas || 0
                    });
                });

            // Agregar fila vacía para separación
            excelData.push({
                'Usuario': '',
                'Total Turnos': '',
                'Total Horas': '',
                'Jornada': '',
                'Fecha Inicio': '',
                'Hora Inicio': '',
                'Fecha Fin': '',
                'Hora Fin': '',
                'Horas': ''
            });
        });

        // Crear libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Turnos');

        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 20 }, // Usuario
            { wch: 15 }, // Total Turnos
            { wch: 15 }, // Total Horas
            { wch: 12 }, // Jornada
            { wch: 15 }, // Fecha Inicio
            { wch: 12 }, // Hora Inicio
            { wch: 15 }, // Fecha Fin
            { wch: 12 }, // Hora Fin
            { wch: 8 }   // Horas
        ];
        worksheet['!cols'] = colWidths;

        // Generar archivo Excel
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `Reporte_Turnos_${reporte.anio}_${String(reporte.mes).padStart(2, '0')}.xlsx`);
    };

    // Función para exportar a PDF
    const exportToPDF = () => {
        if (!reporte || !reporte.detalleTurnos.length) {
            alert('No hay datos para exportar');
            return;
        }

        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`Reporte de Turnos - ${String(reporte.mes).padStart(2, '0')}/${reporte.anio}`, 14, 22);

        // Resumen
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const totalTurnos = reporte.detalleTurnos.length;
        const totalHoras = reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0);

        doc.text(`Total Turnos: ${totalTurnos}`, 14, 35);
        doc.text(`Total Horas: ${totalHoras}`, 14, 42);

        // Línea separadora
        doc.line(14, 47, 196, 47);

        let yPosition = 55;

        // Agrupar turnos por usuario
        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) {
                acc[usuario] = [];
            }
            acc[usuario].push(turno);
            return acc;
        }, {});

        // Generar tabla para cada usuario
        Object.entries(turnosPorUsuario).forEach(([usuario, turnos]) => {
            const totalHorasUsuario = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

            // Verificar si hay espacio en la página
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            // Encabezado del usuario
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${usuario}`, 14, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`(${turnos.length} turnos - ${totalHorasUsuario} horas)`, 14, yPosition + 6);
            yPosition += 15;

            // Preparar datos de la tabla
            const tableData = turnos
                .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                .map(turno => [
                    turno.jornada || 'N/A',
                    formatearFecha(turno.fechaInicio),
                    formatearHora(turno.fechaInicio),
                    formatearFecha(turno.fechaFin),
                    formatearHora(turno.fechaFin),
                    (turno.horas || 0).toString()
                ]);

            // Crear tabla autoTable
            autoTable(doc, {
                head: [['Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']],
                body: tableData,
                startY: yPosition,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: 14, right: 14 },
                columnStyles: {
                    0: { cellWidth: 20 }, // Jornada
                    1: { cellWidth: 25 }, // Fecha Inicio
                    2: { cellWidth: 20 }, // Hora Inicio
                    3: { cellWidth: 25 }, // Fecha Fin
                    4: { cellWidth: 20 }, // Hora Fin
                    5: { cellWidth: 15, halign: 'center' } // Horas
                }
            });

            yPosition = doc.lastAutoTable.finalY + 20;
        });

        // Pie de página con fecha de generación
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 14, 285);
        }

        // Guardar PDF
        doc.save(`Reporte_Turnos_${reporte.anio}_${String(reporte.mes).padStart(2, '0')}.pdf`);
    };


    // Funciones de paginación
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Función para generar números de página visibles
    const getVisiblePageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
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

    // Lógica de paginación para personas
    let totalPages = 1;
    let currentPersonas = [];
    let startIndex = 0;
    let endIndex = 0;
    let totalPersonas = 0;

    if (reporte && reporte.detalleTurnos.length > 0) {
        // Agrupar turnos por usuario para paginación
        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) {
                acc[usuario] = [];
            }
            acc[usuario].push(turno);
            return acc;
        }, {});

        const personas = Object.keys(turnosPorUsuario);
        totalPersonas = personas.length;
        totalPages = Math.ceil(personas.length / itemsPerPage);
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = startIndex + itemsPerPage;
        currentPersonas = personas.slice(startIndex, endIndex);
    }

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

                    <div className="flex gap-2">
                        <button
                            onClick={fetchReporte}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors"
                        >
                            Generar Reporte
                        </button>

                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <>
                                <button
                                    onClick={exportToExcel}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 transition-colors flex items-center gap-2"
                                >
                                    📊 Excel
                                </button>

                                <button
                                    onClick={exportToPDF}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 transition-colors flex items-center gap-2"
                                >
                                    📄 PDF
                                </button>
                            </>
                        )}
                    </div>
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
                        {/* Selector de elementos por página */}
                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-sm text-gray-600">Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value={1}>1</option>
                                    <option value={3}>3</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                </select>
                                <span className="text-sm text-gray-600">personas por página</span>
                            </div>
                        )}
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

                                    return currentPersonas.map((usuario) => {
                                        const turnos = turnosPorUsuario[usuario];
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

                        {/* Información de paginación y controles */}
                        {reporte && totalPersonas > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                                {/* Información de registros */}
                                <div className="text-sm text-gray-600">
                                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalPersonas)} de {totalPersonas} personas
                                </div>

                                {/* Controles de paginación */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        {/* Botón anterior */}
                                        <button
                                            onClick={goToPrevious}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded ${currentPage === 1
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            title="Página anterior"
                                        >
                                            ❮
                                        </button>

                                        {/* Números de página */}
                                        {getVisiblePageNumbers().map((pageNumber, index) => (
                                            <button
                                                key={index}
                                                onClick={() => pageNumber !== '...' && goToPage(pageNumber)}
                                                disabled={pageNumber === '...'}
                                                className={`px-3 py-1 rounded text-sm ${pageNumber === currentPage
                                                    ? 'bg-blue-500 text-white'
                                                    : pageNumber === '...'
                                                        ? 'text-gray-400 cursor-default'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}

                                        {/* Botón siguiente */}
                                        <button
                                            onClick={goToNext}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded ${currentPage === totalPages
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            title="Página siguiente"
                                        >
                                            ❯
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}

