import { apiNotificacionService } from './apiNotificacionService';

export class NotificacionService {

    // Obtener correos activos desde la tabla existente
    static async obtenerCorreosActivos() {
        try {
            // Obtener todos los correos activos directamente
            const correosActivos = await apiNotificacionService.configuracion.getTodosCorreosActivos();
            return correosActivos;
        } catch (error) {
            console.error('Error al obtener correos activos:', error);
            return [];
        }
    }

    // Generar HTML para el correo completo
    static generarHTMLCorreo(cuadroData, miembros, turnos, historial, historialTurnos, procesos, tipoOperacion, detallesOperacion) {
        const fechaActual = new Date().toLocaleString('es-CO');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .section { margin-bottom: 30px; }
                .section-title { background: #f8fafc; padding: 10px; margin-bottom: 15px; border-left: 4px solid #2563eb; font-weight: bold; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .info-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; }
                .info-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
                .info-value { font-weight: 500; color: #1f2937; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background: #1f2937; color: white; padding: 8px; text-align: left; font-size: 12px; }
                td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
                tr:hover { background: #f9fafb; }
                .status-active { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 12px; }
                .status-inactive { background: #fed7d7; color: #c53030; padding: 2px 6px; border-radius: 12px; }
                .alert { padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                .alert-info { background: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; }
                .footer { background: #f8fafc; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>🏥 Notificación de Cambio en Cuadro de Turnos</h1>
                    <p>Sistema de Gestión Hospitalaria - ${fechaActual}</p>
                </div>

                <div class="content">
                    <!-- Alerta de Operación -->
                    <div class="alert alert-info">
                        <strong>Tipo de Operación:</strong> ${tipoOperacion}<br>
                        <strong>Detalles:</strong> ${detallesOperacion}
                    </div>

                    <!-- Información del Cuadro -->
                    <div class="section">
                        <div class="section-title">📋 Información del Cuadro</div>
                        <div class="info-grid">
                            <div class="info-card">
                                <div class="info-label">Nombre del Cuadro</div>
                                <div class="info-value">${cuadroData?.nombre || 'No disponible'}</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Versión</div>
                                <div class="info-value">${cuadroData?.version || 'No disponible'}</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Categoría</div>
                                <div class="info-value">${cuadroData?.categoria || 'No disponible'}</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Período</div>
                                <div class="info-value">Mes: ${cuadroData?.mes || 'N/A'} - Año: ${cuadroData?.anio || 'N/A'}</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Equipo</div>
                                <div class="info-value">${cuadroData?.nombreEquipo || ('Equipo ID: ' + (cuadroData?.idEquipo || 'N/A'))}</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Estado</div>
                                <div class="info-value">
                                    <span class="${cuadroData?.estadoCuadro === 'activo' ? 'status-active' : 'status-inactive'}">
                                        ${cuadroData?.estadoCuadro || 'No especificado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${cuadroData?.categoria === 'multiproceso' && procesos?.length > 0 ? `
                    <!-- Procesos de Atención -->
                    <div class="section">
                        <div class="section-title">🔄 Procesos de Atención (${procesos.length} procesos)</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre del Proceso</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${procesos.map(proceso => `
                                <tr>
                                    <td>${proceso.nombre}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : cuadroData?.categoria !== 'multiproceso' ? `
                    <!-- Procesos Individuales -->
                    <div class="section">
                        <div class="section-title">🔄 Procesos de Atención</div>
                        <div class="info-grid">
                            ${cuadroData?.nombreMacroproceso ? `<div class="info-card">
                                <div class="info-label">Macroproceso</div>
                                <div class="info-value">${cuadroData.nombreMacroproceso}</div>
                            </div>` : ''}
                            ${cuadroData?.nombreProceso ? `<div class="info-card">
                                <div class="info-label">Proceso</div>
                                <div class="info-value">${cuadroData.nombreProceso}</div>
                            </div>` : ''}
                            ${cuadroData?.nombreServicio ? `<div class="info-card">
                                <div class="info-label">Servicio</div>
                                <div class="info-value">${cuadroData.nombreServicio}</div>
                            </div>` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Equipo de Trabajo -->
                    <div class="section">
                        <div class="section-title">👥 Equipo de Talento Humano (${miembros?.length || 0} miembros)</div>
                        ${miembros && miembros.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Perfil</th>
                                    <th>Nombre Completo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${miembros.map(miembro => `
                                <tr>
                                    <td>${miembro.titulos?.join(', ') || 'Sin perfil definido'}</td>
                                    <td>${miembro.nombreCompleto || 'Nombre no disponible'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<p>No se encontraron miembros para este equipo</p>'}
                    </div>

                    <!-- Turnos Actuales -->
                    <div class="section">
                        <div class="section-title">⏰ Turnos del Cuadro (${turnos?.length || 0} turnos)</div>
                        ${turnos && turnos.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Estado Turno</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Jornada</th>
                                    <th>Tipo Turno</th>
                                    <th>Total Horas</th>
                                    <th>ID Persona</th>
                                    <th>Estado</th>
                                    <th>Comentarios</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${turnos.map(turno => `
                                <tr>
                                    <td>${turno.idTurno || 'N/A'}</td>
                                    <td>${turno.estadoTurno || 'N/A'}</td>
                                    <td>${turno.fechaInicio || 'N/A'}</td>
                                    <td>${turno.fechaFin || 'N/A'}</td>
                                    <td>${turno.jornada || 'N/A'}</td>
                                    <td>${turno.tipoTurno || 'N/A'}</td>
                                    <td>${turno.totalHoras || 'N/A'}</td>
                                    <td>${turno.idPersona || 'N/A'}</td>
                                    <td>
                                        <span class="${turno?.estado ? 'status-active' : 'status-inactive'}">
                                            ${turno?.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>${turno.comentarios || 'N/A'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<p>No se encontraron turnos para este cuadro</p>'}
                    </div>

                    <!-- Historial de Cambios del Cuadro -->
                    <div class="section">
                        <div class="section-title">📅 Historial de Cambios del Cuadro (${historial?.length || 0} registros)</div>
                        ${historial && historial.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Año</th>
                                    <th>Mes</th>
                                    <th>Fecha Cambio</th>
                                    <th>Nombre</th>
                                    <th>Versión</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historial.map(h => `
                                <tr>
                                    <td>${h.idCuadroTurno || 'N/A'}</td>
                                    <td>${h.anio || 'N/A'}</td>
                                    <td>${h.mes || 'N/A'}</td>
                                    <td>${h.fechaCambio || 'N/A'}</td>
                                    <td>${h.nombre || 'N/A'}</td>
                                    <td>${h.version || 'N/A'}</td>
                                    <td>
                                        <span class="${h?.estado ? 'status-active' : 'status-inactive'}">
                                            ${h?.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<p>No se encontró historial para este cuadro</p>'}
                    </div>

                    <!-- Historial de Turnos -->
                    <div class="section">
                        <div class="section-title">🔄 Historial de Cambios de Turnos (${historialTurnos?.length || 0} registros)</div>
                        ${historialTurnos && historialTurnos.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Turno</th>
                                    <th>Estado Turno</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Jornada</th>
                                    <th>Tipo Turno</th>
                                    <th>Total Horas</th>
                                    <th>Estado</th>
                                    <th>Comentarios</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historialTurnos.map(ht => `
                                <tr>
                                    <td>${ht.idTurno || 'N/A'}</td>
                                    <td>${ht.estadoTurno || 'N/A'}</td>
                                    <td>${ht.fechaInicio || 'N/A'}</td>
                                    <td>${ht.fechaFin || 'N/A'}</td>
                                    <td>${ht.jornada || 'N/A'}</td>
                                    <td>${ht.tipoTurno || 'N/A'}</td>
                                    <td>${ht.totalHoras || 'N/A'}</td>
                                    <td>
                                        <span class="${ht?.estado ? 'status-active' : 'status-inactive'}">
                                            ${ht?.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>${ht.comentarios || 'N/A'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<p>No se encontró historial de turnos para este cuadro</p>'}
                    </div>
                </div>

                <div class="footer">
                    <p>Este correo ha sido generado automáticamente por el Sistema de Gestión Hospitalaria</p>
                    <p>Por favor, no responder a este correo</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Enviar notificación automática (actualizado)
    static async enviarNotificacionCambio(cuadroId, tipoOperacion, detallesOperacion) {
        try {
            // 1. Obtener correos activos
            const correosActivos = await this.obtenerCorreosActivos();

            if (correosActivos.length === 0) {
                console.warn('No hay correos activos configurados para notificaciones');
                return;
            }

            // 2. Cargar todos los datos del cuadro (simulado para evitar errores)
            const [cuadroData, miembros, turnos, historial, historialTurnos, procesos] = await Promise.all([
                Promise.resolve({
                    nombre: 'Cuadro de prueba',
                    version: '1.0',
                    categoria: 'individual',
                    mes: new Date().getMonth() + 1,
                    anio: new Date().getFullYear(),
                    nombreEquipo: 'Equipo de Enfermería',
                    estadoCuadro: 'activo'
                }),
                Promise.resolve([
                    { titulos: ['Enfermero(a)'], nombreCompleto: 'Maria García López' },
                    { titulos: ['Auxiliar'], nombreCompleto: 'Juan Pérez Martín' }
                ]),
                Promise.resolve([
                    {
                        idTurno: 1,
                        estadoTurno: 'programado',
                        fechaInicio: '2025-09-04 07:00',
                        fechaFin: '2025-09-04 19:00',
                        jornada: 'Día',
                        tipoTurno: 'Normal',
                        totalHoras: 12,
                        idPersona: 'EMP001',
                        estado: true,
                        comentarios: 'Turno regular'
                    }
                ]),
                Promise.resolve([]),
                Promise.resolve([]),
                Promise.resolve([])
            ]);

            // 3. Generar contenido HTML
            const htmlContent = this.generarHTMLCorreo(
                cuadroData,
                miembros,
                turnos,
                historial,
                historialTurnos,
                procesos,
                tipoOperacion,
                detallesOperacion
            );

            // 4. Preparar notificaciones - Marcar como automáticas
            const notificaciones = correosActivos.map(correo => ({
                correo: correo.correo,
                estado: true,
                estadoNotificacion: 'enviado',
                mensaje: htmlContent,
                permanente: correo.permanente,
                asunto: `🏥 Cambio en Cuadro de Turnos - ${cuadroData?.nombre} (${tipoOperacion})`,
                fechaEnvio: new Date().toISOString(),
                automatico: true
            }));

            // 5. Enviar notificaciones
            const resultado = await apiNotificacionService.notificaciones.enviarNotificacionesAutomaticas(notificaciones);

            console.log(`Notificaciones automáticas enviadas a ${correosActivos.length} destinatarios`, resultado);
            return resultado;

        } catch (error) {
            console.error('Error al enviar notificación automática:', error);
            throw error;
        }
    }

    // Métodos auxiliares (implementación básica)
    static async obtenerMiembrosEquipo(cuadroId) {
        try {
            // Implementación simulada - reemplaza con tu lógica real
            return [
                { titulos: ['Enfermero(a)'], nombreCompleto: 'Maria García López' },
                { titulos: ['Auxiliar'], nombreCompleto: 'Juan Pérez Martín' }
            ];
        } catch (error) {
            console.error('Error al obtener miembros:', error);
            return [];
        }
    }

    static async obtenerTurnosCuadro(cuadroId) {
        try {
            // Implementación simulada - reemplaza con tu lógica real
            return [
                {
                    idTurno: 1,
                    estadoTurno: 'programado',
                    fechaInicio: '2025-09-04 07:00',
                    fechaFin: '2025-09-04 19:00',
                    jornada: 'Día',
                    tipoTurno: 'Normal',
                    totalHoras: 12,
                    idPersona: 'EMP001',
                    estado: true,
                    comentarios: 'Turno regular'
                }
            ];
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            return [];
        }
    }

    static async obtenerHistorialCuadro(cuadroId) {
        try {
            // Implementación simulada - reemplaza con tu lógica real
            return [];
        } catch (error) {
            console.error('Error al obtener historial cuadro:', error);
            return [];
        }
    }

    static async obtenerHistorialTurnos(cuadroId) {
        try {
            // Implementación simulada - reemplaza con tu lógica real
            return [];
        } catch (error) {
            console.error('Error al obtener historial turnos:', error);
            return [];
        }
    }

    static async obtenerProcesos(cuadroId) {
        try {
            // Implementación simulada - reemplaza con tu lógica real
            return [];
        } catch (error) {
            console.error('Error al obtener procesos:', error);
            return [];
        }
    }
}
