import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiReporteService } from '../Services/apiReporteService';
import ExcelJS from 'exceljs';
import { FilePlus2 } from "lucide-react";

export default function ReportesFiltro() {
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [cuadroId, setCuadroId] = useState(1);
    const [personaSeleccionada, setPersonaSeleccionada] = useState('');
    const [reporte, setReporte] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [cuadros, setCuadros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCuadros = async () => {
            try {
                setLoading(true);
                const cuadrosData = await apiReporteService.auxiliares.getCuadrosTurno();
                setCuadros(cuadrosData);
                if (cuadrosData.length > 0 && !cuadroId) {
                    setCuadroId(cuadrosData[0].idCuadroTurno);
                }
            } catch (err) {
                setError("Error al cargar los cuadros de turno");
            } finally {
                setLoading(false);
            }
        };
        loadCuadros();
    }, []);

    const fetchReporte = async () => {
        try {
            setLoading(true);
            setError(null);
            const reporteData = await apiReporteService.reportes.getReporte(anio, mes, cuadroId);
            setReporte(reporteData);
            setCurrentPage(1);
            setPersonaSeleccionada('');
        } catch (err) {
            setError("Error al cargar el reporte. Verifique los parámetros seleccionados.");
            setReporte(null);
        } finally {
            setLoading(false);
        }
    };

    const getPersonasUnicas = () => {
        if (!reporte || !reporte.detalleTurnos.length) return [];
        const personas = new Set();
        reporte.detalleTurnos.forEach(turno => personas.add(turno.usuario || "Sin asignar"));
        return Array.from(personas).sort();
    };

    // Función para obtener el nombre del mes en español
    const obtenerNombreMes = (mes) => {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || '';
    };

    // Exportación mejorada a Excel con ExcelJS
    const exportToExcel = async () => {
        if (!reporte || !reporte.detalleTurnos.length) {
            alert('No hay datos para exportar');
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte Turnos');

            // Obtener nombre del cuadro
            const cuadroSeleccionado = cuadros.find(c => c.idCuadroTurno == cuadroId);
            const nombreMes = obtenerNombreMes(mes);
            const nombreCuadro = cuadroSeleccionado ? cuadroSeleccionado.nombre : "CUADRO DE TURNOS";
            // Construir el título completo
            const tituloCompleto = `Reporte: ${nombreMes} ${anio} - Cuadro: ${nombreCuadro.toUpperCase()}`;


            // Título principal
            worksheet.mergeCells('A1:I1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = tituloCompleto;
            titleCell.font = { bold: true, size: 16, color: { argb: 'FF2F5496' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' }
            };

            // Agregar fila vacía
            worksheet.addRow([]);

            // Encabezados de columna
            const headers = ['Usuario', 'Total Turnos', 'Total Horas', 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas'];
            const headerRow = worksheet.addRow(headers);

            // Estilo de encabezados
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FF09599D' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFB9D6F2' }
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF09599D' } },
                    left: { style: 'thin', color: { argb: 'FF09599D' } },
                    bottom: { style: 'thin', color: { argb: 'FF09599D' } },
                    right: { style: 'thin', color: { argb: 'FF09599D' } }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // Agrupar turnos por usuario
            const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                const usuario = turno.usuario || "Sin asignar";
                if (!acc[usuario]) acc[usuario] = [];
                acc[usuario].push(turno);
                return acc;
            }, {});

            // Aplicar filtro de persona si está seleccionada
            const usuariosParaExportar = personaSeleccionada
                ? { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] || [] }
                : turnosPorUsuario;

            // Agregar datos por usuario
            Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
                if (!turnos || turnos.length === 0) return;

                const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

                // Fila de encabezado del usuario
                const userHeaderRow = worksheet.addRow([
                    usuario,
                    `${turnos.length} turnos`,
                    `${totalHoras} horas`,
                    '', '', '', '', '', ''
                ]);

                // Estilo del encabezado del usuario
                userHeaderRow.getCell(1).font = { bold: true, color: { argb: 'FF2F5496' } };
                userHeaderRow.getCell(2).font = { bold: true, color: { argb: 'FF2F5496' } };
                userHeaderRow.getCell(3).font = { bold: true, color: { argb: 'FF2F5496' } };

                // Agregar turnos del usuario
                turnos
                    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                    .forEach((turno, index) => {
                        const row = worksheet.addRow([
                            '',
                            '',
                            '',
                            turno.jornada || 'N/A',
                            formatearFecha(turno.fechaInicio),
                            formatearHora(turno.fechaInicio),
                            formatearFecha(turno.fechaFin),
                            formatearHora(turno.fechaFin),
                            turno.horas || 0
                        ]);

                        // Aplicar bordes a todas las celdas de datos
                        row.eachCell((cell) => {
                            cell.border = {
                                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                                right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                            };
                            // Fondo alternado
                            if (index % 2 === 0) {
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'FFF8F9FA' }
                                };
                            }
                        });

                        // Centrar la columna de horas
                        row.getCell(9).alignment = { horizontal: 'center' };
                    });

                // Fila vacía para separación
                worksheet.addRow(['', '', '', '', '', '', '', '', '']);
            });

            // Ajustar ancho de columnas
            worksheet.columns = [
                { width: 22 }, // Usuario
                { width: 18 }, // Total Turnos
                { width: 18 }, // Total Horas
                { width: 12 }, // Jornada
                { width: 15 }, // Fecha Inicio
                { width: 12 }, // Hora Inicio
                { width: 15 }, // Fecha Fin
                { width: 12 }, // Hora Fin
                { width: 9 }   // Horas
            ];

            // Generar archivo
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, `Reporte_Turnos_${reporte.anio}_${String(reporte.mes).padStart(2, '0')}.xlsx`);

        } catch (err) {
            console.error('Error al exportar a Excel:', err);
            // Fallback a la versión antigua si ExcelJS falla
            exportToExcelFallback();
        }
    };

    // Función de respaldo con XLSX (versión anterior)
    const exportToExcelFallback = async () => {
        const cuadroSeleccionado = cuadros.find(c => c.idCuadroTurno == cuadroId);
        const nombreCuadro = cuadroSeleccionado ? cuadroSeleccionado.nombre : "CUADRO DE TURNOS";

        const excelData = [];
        excelData.push({
            'Usuario': nombreCuadro.toUpperCase(),
            'Total Turnos': '', 'Total Horas': '', 'Jornada': '',
            'Fecha Inicio': '', 'Hora Inicio': '', 'Fecha Fin': '', 'Hora Fin': '', 'Horas': ''
        });
        excelData.push({
            'Usuario': '', 'Total Turnos': '', 'Total Horas': '', 'Jornada': '',
            'Fecha Inicio': '', 'Hora Inicio': '', 'Fecha Fin': '', 'Hora Fin': '', 'Horas': ''
        });

        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) acc[usuario] = [];
            acc[usuario].push(turno);
            return acc;
        }, {});

        const usuariosParaExportar = personaSeleccionada
            ? { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] || [] }
            : turnosPorUsuario;

        Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
            if (!turnos || turnos.length === 0) return;
            const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);
            excelData.push({
                'Usuario': usuario,
                'Total Turnos': `${turnos.length} turnos`,
                'Total Horas': `${totalHoras} horas`,
                'Jornada': '', 'Fecha Inicio': '', 'Hora Inicio': '',
                'Fecha Fin': '', 'Hora Fin': '', 'Horas': ''
            });
            turnos.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                .forEach(turno => {
                    excelData.push({
                        'Usuario': '', 'Total Turnos': '', 'Total Horas': '',
                        'Jornada': turno.jornada || 'N/A',
                        'Fecha Inicio': formatearFecha(turno.fechaInicio),
                        'Hora Inicio': formatearHora(turno.fechaInicio),
                        'Fecha Fin': formatearFecha(turno.fechaFin),
                        'Hora Fin': formatearHora(turno.fechaFin),
                        'Horas': turno.horas || 0
                    });
                });
            excelData.push({
                'Usuario': '', 'Total Turnos': '', 'Total Horas': '', 'Jornada': '',
                'Fecha Inicio': '', 'Hora Inicio': '', 'Fecha Fin': '', 'Hora Fin': '', 'Horas': ''
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet['!cols'] = [
            { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
            { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 9 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Turnos');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(data, `Reporte_Turnos_${reporte.anio}_${String(reporte.mes).padStart(2, '0')}.xlsx`);
    };

    // Exportación PDF mejorada
    const exportToPDF = async () => {
        if (!reporte || !reporte.detalleTurnos.length) {
            alert('No hay datos para exportar');
            return;
        }
        try {
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "A4"
            });
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(`Reporte de Turnos - ${String(reporte.mes).padStart(2, '0')}/${reporte.anio}`, 40, 50);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const totalTurnos = reporte.detalleTurnos.length;
            const totalHoras = reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0);
            doc.text(`Total Turnos: ${totalTurnos}`, 40, 75);
            doc.text(`Total Horas: ${totalHoras}`, 220, 75);
            doc.line(40, 85, 800, 85);

            let yPosition = 106;
            const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                const usuario = turno.usuario || "Sin asignar";
                if (!acc[usuario]) acc[usuario] = [];
                acc[usuario].push(turno);
                return acc;
            }, {});
            const usuariosParaExportar = personaSeleccionada
                ? { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] || [] }
                : turnosPorUsuario;

            Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
                if (!turnos || turnos.length === 0) return;
                const totalHorasUsuario = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);
                if (yPosition > 540) {
                    doc.addPage();
                    yPosition = 40;
                }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`${usuario} (${turnos.length} turnos - ${totalHorasUsuario} horas)`, 40, yPosition);
                yPosition += 18;

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
                autoTable(doc, {
                    head: [['Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']],
                    body: tableData,
                    startY: yPosition,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2
                    },
                    headStyles: {
                        fillColor: [185, 214, 242],
                        textColor: [9, 89, 157],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    margin: { left: 40, right: 40 },
                    tableWidth: 'auto',
                    columnStyles: {
                        0: { cellWidth: 70 },
                        1: { cellWidth: 80 },
                        2: { cellWidth: 60 },
                        3: { cellWidth: 85 },
                        4: { cellWidth: 60 },
                        5: { cellWidth: 45, halign: 'center' }
                    }
                });
                yPosition = doc.lastAutoTable.finalY + 20;
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 40, 585);
            }
            doc.save(`Reporte_Turnos_${reporte.anio}_${String(reporte.mes).padStart(2, '0')}.pdf`);
        } catch (err) {
            alert('Error al exportar el archivo PDF');
        }
    };

    // Paginación y filtro por persona
    let totalPages = 1, currentPersonas = [], startIndex = 0, endIndex = 0, totalPersonas = 0;
    if (reporte && reporte.detalleTurnos.length > 0) {
        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) acc[usuario] = [];
            acc[usuario].push(turno);
            return acc;
        }, {});
        let personas = Object.keys(turnosPorUsuario);
        if (personaSeleccionada) {
            personas = personas.filter(persona => persona === personaSeleccionada);
        }
        totalPersonas = personas.length;
        totalPages = Math.ceil(personas.length / itemsPerPage);
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = startIndex + itemsPerPage;
        currentPersonas = personas.slice(startIndex, endIndex);
    }
    const goToPage = (page) => setCurrentPage(page);
    const goToPrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const goToNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const getVisiblePageNumbers = () => {
        const delta = 2, range = [], rangeWithDots = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) range.push(i);
        if (currentPage - delta > 2) rangeWithDots.push(1, '...');
        else rangeWithDots.push(1);
        rangeWithDots.push(...range);
        if (currentPage + delta < totalPages - 1) rangeWithDots.push('...', totalPages);
        else if (totalPages > 1) rangeWithDots.push(totalPages);
        return rangeWithDots;
    };
    const formatearFecha = (fecha) => !fecha ? "N/A" : new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const formatearHora = (fecha) => !fecha ? "N/A" : new Date(fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const COLORS = ["#4CAF50", "#FF9800", "#2196F3"];

    return (
        <div className="p-6 space-y-6">
            {/* Filtros */}
            <Card className="shadow-lg">
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                    <FilePlus2 size={40} className="text-primary-green-husj" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Reportes
                    </h1>
                </div>
                <CardContent className="flex flex-wrap gap-4 items-center p-4">
                    {/* Año */}
                    <div>
                        <label className="block text-sm font-semibold">Año</label>
                        <select className="border rounded p-1" value={anio} onChange={e => setAnio(e.target.value)}>
                            {[2023, 2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    {/* Mes */}
                    <div>
                        <label className="block text-sm font-semibold">Mes</label>
                        <select className="border rounded p-1" value={mes} onChange={e => setMes(e.target.value)}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    {/* Cuadro */}
                    <div>
                        <label className="block text-sm font-semibold">Cuadro</label>
                        <select className="border rounded p-1" value={cuadroId} onChange={e => setCuadroId(e.target.value)}>
                            {cuadros.map(c => (
                                <option key={c.idCuadroTurno} value={c.idCuadroTurno}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    {/* Persona */}
                    <div>
                        <label className="block text-sm font-semibold">Persona</label>
                        <select className="border rounded p-1" value={personaSeleccionada} onChange={e => setPersonaSeleccionada(e.target.value)}>
                            <option value="">Todas las personas</option>
                            {getPersonasUnicas().map(persona => (
                                <option key={persona} value={persona}>{persona}</option>
                            ))}
                        </select>
                    </div>
                    {/* Botones */}
                    <div className="flex gap-2">
                        <button onClick={fetchReporte} className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors">
                            Generar Reporte
                        </button>
                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <>
                                <button
                                    onClick={exportToExcel}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 transition-colors flex items-center gap-2"
                                >📊 Excel</button>
                                <button
                                    onClick={exportToPDF}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 transition-colors flex items-center gap-2"
                                >📄 PDF</button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
            {/* Reporte */}
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
                                    <p className="text-2xl">{reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0)}</p>
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
                                            nombre, horas
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
                    {/* Detalle de personas */}
                    <Card className="shadow-lg">
                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <div className="flex items-center justify-end gap-2 p-4">
                                <span className="text-sm text-gray-600">Mostrar:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                            <h2 className="text-lg font-bold mb-4">
                                Detalle de Turnos {personaSeleccionada ? `- ${personaSeleccionada}` : 'por Persona'}
                            </h2>
                            <div className="overflow-x-auto">
                                {(() => {
                                    const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                                        const usuario = turno.usuario || "Sin asignar";
                                        if (!acc[usuario]) acc[usuario] = [];
                                        acc[usuario].push(turno);
                                        return acc;
                                    }, {});
                                    return currentPersonas.map((usuario) => {
                                        const turnos = turnosPorUsuario[usuario];
                                        const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);
                                        return (
                                            <div key={usuario} className="mb-6">
                                                <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
                                                    <h3 className="text-lg font-semibold">{usuario}</h3>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>Turnos: {turnos.length}</span>
                                                        <span>Total Horas: {totalHoras}</span>
                                                    </div>
                                                </div>
                                                <table className="w-full border-collapse border border-gray-300 rounded-b-lg overflow-hidden">
                                                    <thead>
                                                        <tr className="bg-blue-100 text-blue-800">
                                                            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Jornada</th>
                                                            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Fecha Inicio</th>
                                                            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Hora Inicio</th>
                                                            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Fecha Fin</th>
                                                            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Hora Fin</th>
                                                            <th className="border border-gray-400 px-4 py-2 text-center font-semibold">Horas</th>
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
                                                                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{turno.horas || 0}</td>
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
                        {reporte && totalPersonas > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                                <div className="text-sm text-gray-600">
                                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalPersonas)} de {totalPersonas} personas
                                    {personaSeleccionada && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            Filtrado: {personaSeleccionada}
                                        </span>
                                    )}
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={goToPrevious}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                            title="Página anterior"
                                        >❮</button>
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
                                            >{pageNumber}</button>
                                        ))}
                                        <button
                                            onClick={goToNext}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                            title="Página siguiente"
                                        >❯</button>
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
