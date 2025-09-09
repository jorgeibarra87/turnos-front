import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, Check, ArrowLeft, Settings, Users, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiNotificacionService } from '../Services/apiNotificacionService';

export default function NotificacionAutomatica() {
    // Estados
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');
    const [correosActivos, setCorreosActivos] = useState([]);
    const [loadingCorreos, setLoadingCorreos] = useState(true);

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

    // Función para probar notificación automática
    const probarNotificacionAutomatica = async () => {
        setLoading(true);
        setMensaje('');

        try {
            console.log('🔧 Correos activos encontrados:', correosActivos);

            // Datos de prueba para la notificación
            const notificacionesPrueba = correosActivos.map(correo => ({
                correo: correo.correo,
                estado: true,
                estadoNotificacion: 'enviado',
                mensaje: `
                <h2>🧪 PRUEBA DEL SISTEMA DE NOTIFICACIONES AUTOMÁTICAS</h2>
                
                <p><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-CO')}</p>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>✅ Sistema Funcionando Correctamente</h3>
                    <p>Esta es una notificación de prueba del sistema automatizado de gestión de turnos hospitalarios.</p>
                    <p>El sistema está configurado para enviar notificaciones automáticamente cuando:</p>
                    <ul>
                        <li>• Se crea un nuevo cuadro de turno</li>
                        <li>• Se modifica un cuadro existente</li>
                        <li>• Se actualiza información de turnos</li>
                        <li>• Se realizan cambios en equipos de trabajo</li>
                    </ul>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <p style="color: #666; font-size: 12px;">
                    Este correo ha sido generado automáticamente por el Sistema de Gestión Hospitalaria<br>
                    Por favor, no responder a este correo
                </p>
            `,
                permanente: correo.permanente,
                asunto: '🧪 PRUEBA - Sistema de Notificaciones Automáticas',
                automatico: true
            }));

            console.log('📤 Enviando notificaciones:', notificacionesPrueba);

            // Enviar notificaciones de prueba
            const resultado = await apiNotificacionService.notificaciones.enviarNotificacionesAutomaticas(notificacionesPrueba);

            console.log('✅ Resultado del envío:', resultado);

            setMensaje(`✅ Notificación de prueba enviada exitosamente a ${correosActivos.length} destinatarios`);
            setTipoMensaje('success');

        } catch (error) {
            console.error('❌ Error al enviar notificación de prueba:', error);
            setMensaje('❌ Error al enviar la notificación de prueba: ' + error.message);
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

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

                {/* Botón de prueba */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='text-center'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>Probar Sistema</h3>
                        <p className='text-sm text-gray-600 mb-4 max-w-md'>
                            Envía una notificación de prueba a todos los correos activos para verificar
                            que el sistema está funcionando correctamente.
                        </p>
                    </div>

                    <button
                        onClick={probarNotificacionAutomatica}
                        disabled={loading || correosActivos.length === 0}
                        className={`px-8 py-4 rounded-lg font-medium flex items-center gap-3 transition-all transform hover:scale-105 ${loading || correosActivos.length === 0
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Enviando notificación de prueba...
                            </>
                        ) : correosActivos.length === 0 ? (
                            <>
                                <AlertCircle size={24} />
                                No hay correos configurados
                            </>
                        ) : (
                            <>
                                <Send size={24} />
                                Enviar Notificación de Prueba ({correosActivos.length} destinatarios)
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