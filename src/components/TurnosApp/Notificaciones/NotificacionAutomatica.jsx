import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, Check, ArrowLeft, Settings, Users, Eye, Play, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiNotificacionService } from '../Services/apiNotificacionService';
import { NotificacionService } from '../Services/notificacionAutomaticaService';

export default function NotificacionAutomatica() {
    // Estados
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');
    const [correosActivos, setCorreosActivos] = useState([]);
    const [loadingCorreos, setLoadingCorreos] = useState(true);

    // Nuevos estados para simular operaciones
    const [simulandoCreacion, setSimulandoCreacion] = useState(false);
    const [simulandoModificacion, setSimulandoModificacion] = useState(false);
    const [simulandoCambioTurno, setSimulandoCambioTurno] = useState(false);

    // Cargar correos activos al montar el componente
    useEffect(() => {
        cargarCorreosActivos();
    }, []);

    const cargarCorreosActivos = async () => {
        try {
            setLoadingCorreos(true);
            const correos = await apiNotificacionService.configuracion.getTodosCorreosActivos();
            setCorreosActivos(correos);
        } catch (error) {
            console.error('Error al cargar correos activos:', error);
            setMensaje('Error al cargar la configuración de correos');
            setTipoMensaje('error');
        } finally {
            setLoadingCorreos(false);
        }
    };

    // ✅ FUNCIÓN ACTUALIZADA: Probar notificación automática básica
    const probarNotificacionBasica = async () => {
        setLoading(true);
        setMensaje('');

        try {
            console.log('🔧 Correos activos encontrados:', correosActivos);

            // Datos de prueba para la notificación básica
            const notificacionesPrueba = correosActivos.map(correo => ({
                correo: correo.correo,
                estado: true,
                estadoNotificacion: 'enviado',
                mensaje: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1>🧪 PRUEBA DEL SISTEMA DE NOTIFICACIONES AUTOMÁTICAS</h1>
                        <p>Sistema de Gestión Hospitalaria - ${new Date().toLocaleString('es-CO')}</p>
                    </div>
                    
                    <div style="padding: 20px; background: white; border: 1px solid #e5e7eb;">
                        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1e40af;">✅ Sistema Funcionando Correctamente</h3>
                            <p>Esta es una notificación de prueba del sistema automatizado de gestión de turnos hospitalarios.</p>
                            <p><strong>El sistema está configurado para enviar notificaciones automáticamente cuando:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Se crea un nuevo cuadro de turno</li>
                                <li>Se modifica un cuadro existente</li>
                                <li>Se actualiza información de turnos</li>
                                <li>Se realizan cambios en equipos de trabajo</li>
                            </ul>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <h4 style="color: #374151; margin: 0 0 10px 0;">📊 Información de la Prueba:</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</li>
                                <li><strong>Tipo:</strong> Prueba básica del sistema</li>
                                <li><strong>Estado:</strong> Funcional</li>
                                <li><strong>Destinatarios:</strong> ${correosActivos.length} correos configurados</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0;">Este correo ha sido generado automáticamente por el Sistema de Gestión Hospitalaria</p>
                        <p style="margin: 5px 0 0 0;">Por favor, no responder a este correo</p>
                    </div>
                </div>
            `,
                permanente: correo.permanente,
                asunto: '🧪 PRUEBA BÁSICA - Sistema de Notificaciones Automáticas',
                automatico: true
            }));

            // Enviar notificaciones de prueba
            const resultado = await apiNotificacionService.notificaciones.enviarNotificacionesAutomaticas(notificacionesPrueba);

            setMensaje(`✅ Notificación de prueba básica enviada exitosamente a ${correosActivos.length} destinatarios`);
            setTipoMensaje('success');

        } catch (error) {
            console.error('❌ Error al enviar notificación de prueba básica:', error);
            setMensaje('❌ Error al enviar la notificación de prueba: ' + error.message);
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    // ✅ NUEVAS FUNCIONES: Simular operaciones reales
    const simularCreacionCuadro = async () => {
        setSimulandoCreacion(true);
        setMensaje('');

        try {
            const cuadroId = Math.floor(Math.random() * 1000) + 1;

            await NotificacionService.enviarNotificacionCambio(
                cuadroId,
                'CREACIÓN DE CUADRO',
                `Se ha creado un nuevo cuadro de turno con ID ${cuadroId}. El cuadro incluye asignación de personal, horarios y procesos de atención.`
            );

            setMensaje(`✅ Simulación de creación de cuadro completada. Notificación enviada a ${correosActivos.length} destinatarios.`);
            setTipoMensaje('success');

        } catch (error) {
            console.error('❌ Error en simulación de creación:', error);
            setMensaje('❌ Error en la simulación: ' + error.message);
            setTipoMensaje('error');
        } finally {
            setSimulandoCreacion(false);
        }
    };

    const simularModificacionCuadro = async () => {
        setSimulandoModificacion(true);
        setMensaje('');

        try {
            const cuadroId = Math.floor(Math.random() * 1000) + 1;

            await NotificacionService.enviarNotificacionCambio(
                cuadroId,
                'MODIFICACIÓN DE CUADRO',
                `Se ha modificado el cuadro de turno ID ${cuadroId}. Los cambios incluyen actualización de horarios, reasignación de personal y modificación de procesos.`
            );

            setMensaje(`✅ Simulación de modificación de cuadro completada. Notificación enviada a ${correosActivos.length} destinatarios.`);
            setTipoMensaje('success');

        } catch (error) {
            console.error('❌ Error en simulación de modificación:', error);
            setMensaje('❌ Error en la simulación: ' + error.message);
            setTipoMensaje('error');
        } finally {
            setSimulandoModificacion(false);
        }
    };

    const simularCambioTurno = async () => {
        setSimulandoCambioTurno(true);
        setMensaje('');

        try {
            const cuadroId = Math.floor(Math.random() * 1000) + 1;
            const turnoId = Math.floor(Math.random() * 100) + 1;

            await NotificacionService.enviarNotificacionCambio(
                cuadroId,
                'CAMBIO EN TURNO',
                `Se ha modificado el turno ID ${turnoId} del cuadro ${cuadroId}. Los cambios incluyen modificación de horarios, cambio de personal asignado o actualización de estado.`
            );

            setMensaje(`✅ Simulación de cambio de turno completada. Notificación enviada a ${correosActivos.length} destinatarios.`);
            setTipoMensaje('success');

        } catch (error) {
            console.error('❌ Error en simulación de cambio de turno:', error);
            setMensaje('❌ Error en la simulación: ' + error.message);
            setTipoMensaje('error');
        } finally {
            setSimulandoCambioTurno(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex items-center justify-between border-b pb-4'>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-blue-500 pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                        <Mail size={40} className="text-blue-600" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Sistema de Notificaciones Automáticas
                        </h1>
                    </div>
                </div>

                {/* Mensaje de estado */}
                {mensaje && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${tipoMensaje === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {tipoMensaje === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
                        <span className="font-medium">{mensaje}</span>
                    </div>
                )}

                {/* Información del sistema */}
                <div className='bg-blue-50 rounded-lg p-5'>
                    <h2 className='text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2'>
                        <Eye size={24} />
                        ¿Cómo funciona el sistema automático?
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-gray-800'>🚀 Funcionamiento Automático:</h3>
                            <ul className='space-y-2 text-sm text-gray-700'>
                                <li>• Se activa automáticamente al crear/editar cuadros</li>
                                <li>• Recopila toda la información del cuadro</li>
                                <li>• Genera correo HTML con datos completos</li>
                                <li>• Envía a correos predeterminados y seleccionados</li>
                            </ul>
                        </div>
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-gray-800'>📧 Incluye información de:</h3>
                            <ul className='space-y-2 text-sm text-gray-700'>
                                <li>• Datos completos del cuadro de turno</li>
                                <li>• Miembros del equipo de trabajo</li>
                                <li>• Turnos asociados y sus horarios</li>
                                <li>• Historial de cambios y auditoría</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Estado de correos activos */}
                <div className='bg-gray-50 rounded-lg p-5'>
                    <h2 className='text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2'>
                        <Users size={24} />
                        Configuración Actual de Destinatarios
                    </h2>

                    {loadingCorreos ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className='ml-3 text-gray-600'>Cargando configuración...</span>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div className='bg-white p-4 rounded-lg border'>
                                <div className='text-2xl font-bold text-blue-600 mb-1'>
                                    {correosActivos.filter(c => c.permanente).length}
                                </div>
                                <div className='text-sm text-gray-600'>Correos Predeterminados</div>
                                <div className='text-xs text-gray-500 mt-1'>Siempre activos</div>
                            </div>
                            <div className='bg-white p-4 rounded-lg border'>
                                <div className='text-2xl font-bold text-green-600 mb-1'>
                                    {correosActivos.filter(c => !c.permanente).length}
                                </div>
                                <div className='text-sm text-gray-600'>Correos Seleccionables</div>
                                <div className='text-xs text-gray-500 mt-1'>Activados manualmente</div>
                            </div>
                            <div className='bg-white p-4 rounded-lg border'>
                                <div className='text-2xl font-bold text-purple-600 mb-1'>
                                    {correosActivos.length}
                                </div>
                                <div className='text-sm text-gray-600'>Total Destinatarios</div>
                                <div className='text-xs text-gray-500 mt-1'>Recibirán notificaciones</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ NUEVA SECCIÓN: Simulaciones de Operaciones */}
                <div className='bg-yellow-50 rounded-lg p-5 border border-yellow-200'>
                    <h2 className='text-lg font-semibold mb-4 text-yellow-800 flex items-center gap-2'>
                        <Play size={24} />
                        Simulaciones de Operaciones Reales
                    </h2>
                    <p className='text-sm text-yellow-700 mb-4'>
                        Estas simulaciones muestran cómo funcionarían las notificaciones automáticas con datos realistas,
                        incluyendo toda la información que se enviaría en un escenario real.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {/* Simular Creación */}
                        <button
                            onClick={simularCreacionCuadro}
                            disabled={simulandoCreacion || correosActivos.length === 0}
                            className={`p-4 rounded-lg font-medium flex flex-col items-center gap-2 transition-all ${simulandoCreacion || correosActivos.length === 0
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {simulandoCreacion ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span className="text-sm">Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={24} />
                                    <span className="text-sm font-semibold">Simular Creación</span>
                                    <span className="text-xs opacity-90">de Cuadro</span>
                                </>
                            )}
                        </button>

                        {/* Simular Modificación */}
                        <button
                            onClick={simularModificacionCuadro}
                            disabled={simulandoModificacion || correosActivos.length === 0}
                            className={`p-4 rounded-lg font-medium flex flex-col items-center gap-2 transition-all ${simulandoModificacion || correosActivos.length === 0
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {simulandoModificacion ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span className="text-sm">Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Settings size={24} />
                                    <span className="text-sm font-semibold">Simular Modificación</span>
                                    <span className="text-xs opacity-90">de Cuadro</span>
                                </>
                            )}
                        </button>

                        {/* Simular Cambio de Turno */}
                        <button
                            onClick={simularCambioTurno}
                            disabled={simulandoCambioTurno || correosActivos.length === 0}
                            className={`p-4 rounded-lg font-medium flex flex-col items-center gap-2 transition-all ${simulandoCambioTurno || correosActivos.length === 0
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {simulandoCambioTurno ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span className="text-sm">Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Users size={24} />
                                    <span className="text-sm font-semibold">Simular Cambio</span>
                                    <span className="text-xs opacity-90">de Turno</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Prueba básica del sistema */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='text-center'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2'>
                            <TestTube size={20} />
                            Prueba Básica del Sistema
                        </h3>
                        <p className='text-sm text-gray-600 mb-4 max-w-md'>
                            Envía una notificación básica de prueba para verificar que el sistema de correos
                            está configurado correctamente.
                        </p>
                    </div>

                    <button
                        onClick={probarNotificacionBasica}
                        disabled={loading || correosActivos.length === 0}
                        className={`px-8 py-4 rounded-lg font-medium flex items-center gap-3 transition-all transform hover:scale-105 ${loading || correosActivos.length === 0
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Enviando prueba básica...
                            </>
                        ) : correosActivos.length === 0 ? (
                            <>
                                <AlertCircle size={24} />
                                No hay correos configurados
                            </>
                        ) : (
                            <>
                                <TestTube size={24} />
                                Enviar Prueba Básica ({correosActivos.length} destinatarios)
                            </>
                        )}
                    </button>
                </div>

                {/* Enlaces de configuración */}
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <div className='flex items-start gap-3'>
                        <Settings size={24} className="text-yellow-600 mt-1" />
                        <div>
                            <h3 className='font-semibold text-yellow-800 mb-2'>Configuración</h3>
                            <p className='text-sm text-yellow-700 mb-3'>
                                Para configurar los correos destinatarios o gestionar las notificaciones,
                                utiliza el panel de gestión de notificaciones.
                            </p>
                            <Link
                                to="/notificaionCorreo"
                                className='inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm'
                            >
                                <Settings size={16} />
                                Ir a Gestión de Notificaciones
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Botón de regresar */}
                <div className='flex justify-center pt-4 border-t'>
                    <Link to="/">
                        <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors">
                            <ArrowLeft size={20} />
                            Volver al Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
