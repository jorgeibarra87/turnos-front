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

    // Resto del componente igual...
    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            {/* Componente igual al que tienes */}
        </div>
    );
}
