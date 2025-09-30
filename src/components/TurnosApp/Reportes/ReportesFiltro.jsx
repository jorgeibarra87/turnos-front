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
import SearchableDropdown from '../Turnos/SearchableDropdown';

export default function ReportesFiltro() {
    // Array de meses
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

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
    const [selectedCuadro, setSelectedCuadro] = useState(null);
    const [selectedPersona, setSelectedPersona] = useState(null);

    // Función para manejar selección de cuadro
    const handleCuadroSelect = (cuadro) => {
        setSelectedCuadro(cuadro);
        setCuadroId(cuadro.idCuadroTurno);
    };

    // Función para limpiar selección de cuadro
    const handleCuadroClear = () => {
        setSelectedCuadro(null);
        if (cuadros.length > 0) {
            setCuadroId(cuadros[0].idCuadroTurno);
            setSelectedCuadro(cuadros[0]);
        }
    };

    // Función para manejar selección de persona
    const handlePersonaSelect = (persona) => {
        setSelectedPersona(persona);
        setPersonaSeleccionada(persona.nombre);
    };

    // Función para limpiar selección de persona
    const handlePersonaClear = () => {
        setSelectedPersona(null);
        setPersonaSeleccionada('');
    };

    // Función para preparar datos de personas para el dropdown
    const getPersonasParaDropdown = () => {
        if (!reporte || !reporte.detalleTurnos.length) return [];
        const personas = new Set();
        reporte.detalleTurnos.forEach(turno => personas.add(turno.usuario || "Sin asignar"));
        return Array.from(personas).sort().map(nombre => ({
            id: nombre,
            nombre: nombre
        }));
    };

    useEffect(() => {
        const loadCuadros = async () => {
            try {
                setLoading(true);
                const cuadrosData = await apiReporteService.auxiliares.getCuadrosTurno();
                setCuadros(cuadrosData);
                if (cuadrosData.length > 0) {
                    if (!cuadroId) {
                        setCuadroId(cuadrosData[0].idCuadroTurno);
                    }
                    // Encuentra el cuadro seleccionado inicialmente
                    const cuadroInicial = cuadrosData.find(c => c.idCuadroTurno == (cuadroId || cuadrosData[0].idCuadroTurno));
                    setSelectedCuadro(cuadroInicial);
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
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mes - 1];
    };

    // Exportación a Excel con ExcelJS (CÓDIGO COMPLETO)
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
            const nombreCuadro = cuadroSeleccionado ? cuadroSeleccionado.nombre : 'CUADRO DE TURNOS';

            // Encabezado completo
            // Título de la organización
            worksheet.mergeCells('A1:I1');
            const orgCell = worksheet.getCell('A1');
            orgCell.value = 'Hospital Universitario San José de Popayán - NIT 891580002-5';
            orgCell.font = { bold: true, size: 12, color: { argb: 'FF000000' } };
            orgCell.alignment = { horizontal: 'center', vertical: 'middle' };
            orgCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            // Título del reporte
            worksheet.mergeCells('A2:I2');
            const titleCell = worksheet.getCell('A2');
            titleCell.value = `Reporte ${nombreMes} ${anio} - Cuadro ${nombreCuadro.toUpperCase()}`;
            titleCell.font = { bold: true, size: 14, color: { argb: 'FF2F5496' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            titleCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            // Agregar fila vacía con bordes
            worksheet.mergeCells('A3:I3');
            const emptyCell = worksheet.getCell('A3');
            emptyCell.value = '';
            emptyCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            // Encabezados de columna
            const headers = ['Usuario', 'Total Turnos', 'Total Horas', 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas'];
            const headerRow = worksheet.addRow(headers);

            // Estilo de encabezados
            headerRow.eachCell((cell, colNumber) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
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
            const usuariosParaExportar = personaSeleccionada ?
                { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] } :
                turnosPorUsuario;

            // Agregar datos por usuario
            Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
                if (!turnos || turnos.length === 0) return;

                const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

                // Fila de encabezado del usuario
                const userHeaderRow = worksheet.addRow([
                    `Usuario: ${usuario}`,
                    `${turnos.length} turnos`,
                    `${totalHoras} horas`,
                    '', '', '', '', '', ''
                ]);

                // Estilo del encabezado del usuario con bordes
                userHeaderRow.eachCell((cell, colNumber) => {
                    if (colNumber <= 3) {
                        cell.font = { bold: true, color: { argb: 'FF2F5496' } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
                    }
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });

                // Agregar turnos del usuario
                turnos
                    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                    .forEach((turno, index) => {
                        const row = worksheet.addRow([
                            '', // Celda vacía para usuario
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
                        row.eachCell(cell => {
                            cell.border = {
                                top: { style: 'thin', color: { argb: 'FF000000' } },
                                left: { style: 'thin', color: { argb: 'FF000000' } },
                                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                                right: { style: 'thin', color: { argb: 'FF000000' } }
                            };
                            // Fondo alternado
                            if (index % 2 === 0) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
                            }
                        });

                        // Centrar ciertas columnas
                        row.getCell(4).alignment = { horizontal: 'center' }; // Jornada
                        row.getCell(5).alignment = { horizontal: 'center' }; // Fecha Inicio
                        row.getCell(6).alignment = { horizontal: 'center' }; // Hora Inicio
                        row.getCell(7).alignment = { horizontal: 'center' }; // Fecha Fin
                        row.getCell(8).alignment = { horizontal: 'center' }; // Hora Fin
                        row.getCell(9).alignment = { horizontal: 'center' }; // Horas
                    });

                // Fila vacía para separación con bordes
                const separatorRow = worksheet.addRow(['', '', '', '', '', '', '', '', '']);
                separatorRow.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });
            });

            // Ajustar ancho de columnas para nombres largos
            worksheet.columns = [
                { width: 35 }, // Usuario
                { width: 15 }, // Total Turnos
                { width: 15 }, // Total Horas
                { width: 12 }, // Jornada
                { width: 15 }, // Fecha Inicio
                { width: 12 }, // Hora Inicio
                { width: 15 }, // Fecha Fin
                { width: 12 }, // Hora Fin
                { width: 9 }   // Horas
            ];

            // Ajustar altura de las filas
            worksheet.eachRow((row, rowNumber) => {
                row.height = rowNumber <= 3 ? 20 : 16; // Más alto para encabezados
            });

            // Pie de página con información adicional
            const footerRowNum = worksheet.rowCount + 2;
            worksheet.mergeCells(`A${footerRowNum}:I${footerRowNum}`);
            const footerCell = worksheet.getCell(`A${footerRowNum}`);
            footerCell.value = `Generado el ${new Date().toLocaleDateString('es-ES')} - Para uso exclusivo de trámites y servicios prestados por Hospital Universitario San José de Popayán`;
            footerCell.font = { size: 10, italic: true };
            footerCell.alignment = { horizontal: 'center' };

            // Generar archivo
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `ReporteTurnos${reporte.anio}${String(reporte.mes).padStart(2, '0')}.xlsx`);

        } catch (err) {
            console.error('Error al exportar a Excel:', err);
            exportToExcelFallback();
        }
    };

    const exportToExcelFallback = async () => {
        // Fallback usando XLSX básico (código existente simplificado)
        const cuadroSeleccionado = cuadros.find(c => c.idCuadroTurno == cuadroId);
        const nombreCuadro = cuadroSeleccionado ? cuadroSeleccionado.nombre : 'CUADRO DE TURNOS';

        const excelData = [];
        excelData.push([`Usuario: ${nombreCuadro.toUpperCase()}`, 'Total Turnos', 'Total Horas', 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']);
        excelData.push(['Usuario', 'Total Turnos', 'Total Horas', 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']);

        const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
            const usuario = turno.usuario || "Sin asignar";
            if (!acc[usuario]) acc[usuario] = [];
            acc[usuario].push(turno);
            return acc;
        }, {});

        const usuariosParaExportar = personaSeleccionada ?
            { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] } :
            turnosPorUsuario;

        Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
            if (!turnos || turnos.length === 0) return;
            const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);
            excelData.push([`Usuario: ${usuario}`, `Total Turnos: ${turnos.length} turnos`, `Total Horas: ${totalHoras} horas`, 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']);

            turnos.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                .forEach(turno => {
                    excelData.push(['Usuario', 'Total Turnos', 'Total Horas', `Jornada: ${turno.jornada || 'N/A'}`, `Fecha Inicio: ${formatearFecha(turno.fechaInicio)}`, `Hora Inicio: ${formatearHora(turno.fechaInicio)}`, `Fecha Fin: ${formatearFecha(turno.fechaFin)}`, `Hora Fin: ${formatearHora(turno.fechaFin)}`, `Horas: ${turno.horas || 0}`]);
                });

            excelData.push(['Usuario', 'Total Turnos', 'Total Horas', 'Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']);
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 9 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Turnos");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `ReporteTurnos${reporte.anio}${String(reporte.mes).padStart(2, '0')}.xlsx`);
    };

    // Exportación PDF (CÓDIGO COMPLETO)
    const exportToPDF = async () => {
        if (!reporte || !reporte.detalleTurnos.length) {
            alert('No hay datos para exportar');
            return;
        }

        try {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

            // Encabezado
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Hospital Universitario San José de Popayán', 40, 30);
            doc.text('NIT 891580002-5', 40, 45);

            // título del cuadro
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            const cuadroSeleccionado = cuadros.find(c => c.idCuadroTurno == cuadroId);
            const nombreMes = obtenerNombreMes(mes);
            let nombreCuadro = cuadroSeleccionado ? cuadroSeleccionado.nombre : 'CUADRO DE TURNOS';

            // Truncar el nombre del cuadro si es muy largo
            if (nombreCuadro.length > 60) {
                nombreCuadro = nombreCuadro.substring(0, 57) + '...';
            }

            const tituloCompleto = `Reporte ${nombreMes} ${reporte.anio} - Cuadro ${nombreCuadro.toUpperCase()}`;

            // Dividir el título en múltiples líneas si es necesario
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxWidth = pageWidth - 80; // Margen de 40 a cada lado

            // Verificar si el título cabe en una línea
            const titleWidth = doc.getTextWidth(tituloCompleto);
            if (titleWidth > maxWidth) {
                // Dividir en dos líneas
                const linea1 = `Reporte ${nombreMes} ${reporte.anio}`;
                const linea2 = `Cuadro ${nombreCuadro.toUpperCase()}`;
                doc.text(linea1, 40, 65);
                doc.text(linea2, 40, 85);
            } else {
                // Título en una línea
                doc.text(tituloCompleto, 40, 70);
            }

            // Ajustar la posición del resumen según las líneas del título
            let yPosition = titleWidth > maxWidth ? 105 : 90;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const totalTurnos = reporte.detalleTurnos.length;
            const totalHoras = reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0);

            doc.text(`Total Turnos: ${totalTurnos}`, 40, yPosition);
            doc.text(`Total Horas: ${totalHoras}`, 220, yPosition);
            doc.line(40, yPosition + 10, 800, yPosition + 10);

            yPosition += 25;

            const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                const usuario = turno.usuario || "Sin asignar";
                if (!acc[usuario]) acc[usuario] = [];
                acc[usuario].push(turno);
                return acc;
            }, {});

            const usuariosParaExportar = personaSeleccionada ?
                { [personaSeleccionada]: turnosPorUsuario[personaSeleccionada] } :
                turnosPorUsuario;

            Object.entries(usuariosParaExportar).forEach(([usuario, turnos]) => {
                if (!turnos || turnos.length === 0) return;

                const totalHorasUsuario = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);

                // Verificar espacio disponible antes de agregar nueva sección
                if (yPosition > 500) {
                    doc.addPage();
                    yPosition = 40;
                }

                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');

                // nombre de usuario
                let nombreUsuario = usuario;
                const maxUserNameWidth = 600; // Ancho máximo para el nombre
                const userNameWidth = doc.getTextWidth(`${nombreUsuario} (${turnos.length} turnos) - ${totalHorasUsuario} horas`);

                if (userNameWidth > maxUserNameWidth) {
                    // Truncar el nombre del usuario si es muy largo
                    const availableWidth = maxUserNameWidth - doc.getTextWidth(` (${turnos.length} turnos) - ${totalHorasUsuario} horas`);
                    while (doc.getTextWidth(nombreUsuario) > availableWidth && nombreUsuario.length > 10) {
                        nombreUsuario = nombreUsuario.substring(0, nombreUsuario.length - 4) + '...';
                    }
                }

                doc.text(`${nombreUsuario} (${turnos.length} turnos) - ${totalHorasUsuario} horas`, 40, yPosition);
                yPosition += 20;

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

                // Tabla más grande
                autoTable(doc, {
                    head: [['Jornada', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas']],
                    body: tableData,
                    startY: yPosition,
                    styles: {
                        fontSize: 10,
                        cellPadding: 4,
                        lineColor: [68, 114, 196],
                        lineWidth: 0.5
                    },
                    headStyles: {
                        fillColor: [68, 114, 196],
                        textColor: [255, 255, 255],
                        fontSize: 11,
                        fontStyle: 'bold',
                        halign: 'center',
                        cellPadding: 5
                    },
                    bodyStyles: {
                        textColor: [51, 51, 51],
                        alternateRowStyles: { fillColor: [248, 249, 250] }
                    },
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
                    margin: { left: 40, right: 40 },
                    tableWidth: 'auto',
                    columnStyles: {
                        0: { cellWidth: 90, halign: 'center' },
                        1: { cellWidth: 95, halign: 'center' },
                        2: { cellWidth: 75, halign: 'center' },
                        3: { cellWidth: 95, halign: 'center' },
                        4: { cellWidth: 75, halign: 'center' },
                        5: { cellWidth: 55, halign: 'center', fontStyle: 'bold' }
                    },
                    // Dividir tabla automáticamente si no cabe en la página
                    didDrawPage: function (data) {
                        // Agregar numeración de página si hay múltiples páginas
                        if (doc.internal.getNumberOfPages() > 1) {
                            doc.setFontSize(8);
                            doc.setTextColor(100);
                            doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 20);
                        }
                    }
                });

                yPosition = doc.lastAutoTable.finalY + 25; // Más espacio entre secciones
            });

            // Pie de página responsivo
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);

                // Información del pie
                const fechaGeneracion = `Generado el ${new Date().toLocaleDateString('es-ES')}`;
                const numeroPagina = `Página ${i} de ${pageCount}`;
                const textoLegal = "Para uso exclusivo de trámites y servicios prestados por Hospital Universitario San José de Popayán";

                // Línea superior del pie de página
                doc.text(fechaGeneracion, 40, 575);
                doc.text(numeroPagina, doc.internal.pageSize.getWidth() - 100, 575);

                // Verificar si el texto cabe en una línea
                const legalWidth = doc.getTextWidth(textoLegal);
                const availableWidth = doc.internal.pageSize.getWidth() - 80;

                if (legalWidth <= availableWidth) {
                    doc.text(textoLegal, (doc.internal.pageSize.getWidth() - legalWidth) / 2, 590);
                } else {
                    // Dividir el texto en dos líneas si es muy largo
                    const words = textoLegal.split(' ');
                    let line1 = '';
                    let line2 = '';
                    let currentLine = 1;

                    words.forEach(word => {
                        const testLine = currentLine === 1 ? `${line1} ${word}` : `${line2} ${word}`;
                        if (doc.getTextWidth(testLine) > availableWidth && currentLine === 1) {
                            currentLine = 2;
                            line2 = word;
                        } else {
                            if (currentLine === 1) {
                                line1 += ` ${word}`;
                            } else {
                                line2 += ` ${word}`;
                            }
                        }
                    });

                    doc.text(line1.trim(), (doc.internal.pageSize.getWidth() - doc.getTextWidth(line1.trim())) / 2, 585);
                    doc.text(line2.trim(), (doc.internal.pageSize.getWidth() - doc.getTextWidth(line2.trim())) / 2, 595);
                }
            }

            doc.save(`ReporteTurnos${reporte.anio}${String(reporte.mes).padStart(2, '0')}.pdf`);

        } catch (err) {
            console.error('Error al exportar PDF:', err);
            alert(`Error al exportar el archivo PDF: ${err.message}`);
        }
    };

    // Resto del código (TablaMejorada, paginación, etc.) permanece igual...
    const TablaMejorada = ({ usuario, turnos, totalHoras }) => (
        <div className="mb-6 shadow-lg rounded-lg overflow-hidden border border-gray-200">
            {/* Encabezado del usuario */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    {/* Nombre */}
                    <h3 className="text-lg font-semibold break-words max-w-full sm:max-w-2xl">{usuario}</h3>
                    <div className="flex gap-6 text-sm bg-black bg-opacity-20 px-3 py-1 rounded">
                        <span className="font-medium">Turnos: <span className="text-green-300">{turnos.length}</span></span>
                        <span className="font-medium">Total Horas: <span className="text-blue-300">{totalHoras}</span></span>
                    </div>
                </div>
            </div>

            {/* Tabla responsive y bordes */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800 bg-blue-100">Jornada</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800 bg-blue-100">Fecha Inicio</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800 bg-blue-100">Hora Inicio</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800 bg-blue-100">Fecha Fin</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800 bg-blue-100">Hora Fin</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-800 bg-blue-100">Horas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos
                            .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
                            .map((turno, index) => (
                                <tr key={index} className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                    <td className="border border-gray-300 px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${turno.jornada === 'Mañana' ? 'bg-green-100 text-green-800 border border-green-200' :
                                            turno.jornada === 'Tarde' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                turno.jornada === 'Noche' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                            {turno.jornada || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{formatearFecha(turno.fechaInicio)}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-700 font-mono text-sm">{formatearHora(turno.fechaInicio)}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{formatearFecha(turno.fechaFin)}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-700 font-mono text-sm">{formatearHora(turno.fechaFin)}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-lg text-gray-800">
                                        <span className="bg-gray-100 px-2 py-1 rounded">{turno.horas || 0}</span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Resto del código de paginación y utilidades...
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

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const getVisiblePageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
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
        return !fecha ? 'N/A' : new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatearHora = (fecha) => {
        return !fecha ? 'N/A' : new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const COLORS = ['#4CAF50', '#FF9800', '#2196F3'];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Filtros */}
            <Card className="shadow-lg border-0">
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-6 w-fit mx-auto">
                    <FilePlus2 size={40} className="text-primary-green-husj" />
                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Reportes de Turnos
                    </h1>
                </div>
                <CardContent className="p-6 bg-white">
                    <div className="space-y-4">
                        {/* Primera fila: Año y Mes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-semibold mb-1">Año</label>
                                <select
                                    className="w-full h-10 px-4 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 box-border"
                                    value={anio}
                                    onChange={e => setAnio(e.target.value)}
                                >
                                    {[2023, 2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-semibold mb-1">Mes</label>
                                <select
                                    className="w-full h-10 px-4 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 box-border"
                                    value={mes}
                                    onChange={e => setMes(e.target.value)}
                                >
                                    {meses.map((m, index) => (
                                        <option key={index + 1} value={index + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Segunda fila: Cuadro y Persona */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-semibold mb-1">Cuadro</label>
                                <SearchableDropdown
                                    options={cuadros}
                                    placeholder="Seleccionar cuadro..."
                                    onSelect={handleCuadroSelect}
                                    onClear={handleCuadroClear}
                                    value={selectedCuadro?.nombre || ""}
                                    displayProperty="nombre"
                                    idProperty="idCuadroTurno"
                                    loading={loading}
                                    error={error}
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-semibold mb-1">Persona</label>
                                <SearchableDropdown
                                    options={getPersonasParaDropdown()}
                                    placeholder="Todas las personas"
                                    onSelect={handlePersonaSelect}
                                    onClear={handlePersonaClear}
                                    value={selectedPersona?.nombre || ""}
                                    displayProperty="nombre"
                                    idProperty="id"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={fetchReporte}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-6 py-2 transition-colors font-medium shadow-md"
                        >
                            {loading ? 'Generando...' : 'Generar Reporte'}
                        </button>
                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <>
                                <button
                                    onClick={exportToExcel}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 transition-colors flex items-center gap-2 font-medium shadow-md"
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-2 transition-colors flex items-center gap-2 font-medium shadow-md"
                                >
                                    PDF
                                </button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error o Loading */}
            {error && (
                <Card className="shadow-lg border-red-200">
                    <CardContent className="p-4 text-red-600 bg-red-50">
                        <p className="font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Card className="shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando reporte...</p>
                    </CardContent>
                </Card>
            )}

            {/* Reporte */}
            {reporte && !loading && (
                <div className="space-y-6">
                    {/* Resumen */}
                    <Card className="col-span-2 shadow-lg border-0">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Resumen del Período - {obtenerNombreMes(reporte.mes)} {reporte.anio}
                                </h2>
                                <div className="h-1 w-24 bg-blue-600 mx-auto rounded"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-bold text-blue-800">Año</h3>
                                    <p className="text-3xl font-bold text-blue-600">{reporte.anio}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-bold text-green-800">Mes</h3>
                                    <p className="text-3xl font-bold text-green-600">{reporte.mes}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <h3 className="text-lg font-bold text-purple-800">Turnos</h3>
                                    <p className="text-3xl font-bold text-purple-600">{reporte.detalleTurnos.length}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <h3 className="text-lg font-bold text-orange-800">Horas Totales</h3>
                                    <p className="text-3xl font-bold text-orange-600">{reporte.detalleTurnos.reduce((sum, t) => sum + (t.horas || 0), 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Horas por Persona</h2>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={Object.entries(reporte.horasPorUsuario).map(([nombre, horas]) => ({
                                        nombre: nombre.length > 15 ? nombre.substring(0, 15) + '...' : nombre,
                                        horas,
                                        nombreCompleto: nombre
                                    }))}>
                                        <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} fontSize={11} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(value, payload) => payload && payload[0] ? payload[0].payload.nombreCompleto : value} />
                                        <Legend />
                                        <Bar dataKey="horas" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Distribución por Jornada</h2>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={['Mañana', 'Tarde', 'Noche'].map(j => ({
                                                jornada: j,
                                                valor: reporte.detalleTurnos.filter(t => t.jornada === j).length
                                            }))}
                                            dataKey="valor"
                                            nameKey="jornada"
                                            outerRadius={120}
                                            label={({ jornada, valor }) => `${jornada}: ${valor}`}
                                        >
                                            {['Mañana', 'Tarde', 'Noche'].map((entry, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detalle de personas con tabla */}
                    <Card className="shadow-lg border-0">
                        {reporte && reporte.detalleTurnos.length > 0 && (
                            <>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-50 border-b">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Detalle de Turnos{personaSeleccionada ? ` - ${personaSeleccionada}` : ''} por Persona
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 font-medium">Mostrar</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value={1}>1</option>
                                            <option value={3}>3</option>
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                        </select>
                                        <span className="text-sm text-gray-600 font-medium">personas por página</span>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {(() => {
                                            const turnosPorUsuario = reporte.detalleTurnos.reduce((acc, turno) => {
                                                const usuario = turno.usuario || "Sin asignar";
                                                if (!acc[usuario]) acc[usuario] = [];
                                                acc[usuario].push(turno);
                                                return acc;
                                            }, {});

                                            return currentPersonas.map(usuario => {
                                                const turnos = turnosPorUsuario[usuario];
                                                const totalHoras = turnos.reduce((sum, t) => sum + (t.horas || 0), 0);
                                                return (
                                                    <TablaMejorada
                                                        key={usuario}
                                                        usuario={usuario}
                                                        turnos={turnos}
                                                        totalHoras={totalHoras}
                                                    />
                                                );
                                            });
                                        })()}

                                        {reporte.detalleTurnos.length === 0 && (
                                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                                <div className="text-6xl mb-4">📋</div>
                                                <h3 className="text-xl font-medium mb-2">No hay datos disponibles</h3>
                                                <p>No hay turnos registrados para el período seleccionado</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                {/* Paginación */}
                                {reporte && totalPersonas > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-50 border-t">
                                        <div className="text-sm text-gray-600">
                                            Mostrando <span className="font-semibold">{startIndex + 1}</span> a <span className="font-semibold">{Math.min(endIndex, totalPersonas)}</span> de <span className="font-semibold">{totalPersonas}</span> personas
                                            {personaSeleccionada && <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Filtrado: {personaSeleccionada}</span>}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={goToPrevious}
                                                    disabled={currentPage === 1}
                                                    className={`p-2 rounded-md transition-colors ${currentPage === 1
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                    title="Página anterior"
                                                >
                                                    ‹
                                                </button>

                                                {getVisiblePageNumbers().map((pageNumber, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => pageNumber !== '...' && goToPage(pageNumber)}
                                                        disabled={pageNumber === '...'}
                                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${pageNumber === currentPage
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : pageNumber === '...'
                                                                ? 'text-gray-400 cursor-default'
                                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={goToNext}
                                                    disabled={currentPage === totalPages}
                                                    className={`p-2 rounded-md transition-colors ${currentPage === totalPages
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                    title="Página siguiente"
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
