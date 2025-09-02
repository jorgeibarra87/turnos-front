import React, { useEffect, useState } from 'react';
import { Mail, Send, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { apiNotificacionService } from '../Services/apiNotificacionService';

export default function GestionNotificaciones() {
    // Estados
    const [correosPredeterminados, setCorreosPredeterminados] = useState([]);
    const [correosSeleccionables, setCorreosSeleccionables] = useState([]);
    const [nuevoCorreo, setNuevoCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [asunto, setAsunto] = useState('');

    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensaje_estado, setMensajeEstado] = useState('');
    const [tipo_mensaje, setTipoMensaje] = useState('');

    // Cargar correos existentes al montar el componente
    useEffect(() => {
        cargarCorreosExistentes();
    }, []);

    const cargarCorreosExistentes = async () => {
        try {
            setLoading(true);

            // Cargar correos predeterminados (permanente = true)
            const predeterminados = await apiNotificacionService.configuracion.getCorreosPorTipo(true);

            // Cargar correos seleccionables (permanente = false)
            const seleccionables = await apiNotificacionService.configuracion.getCorreosPorTipo(false);

            setCorreosPredeterminados(predeterminados.map(correo => ({
                id: correo.idNotificacion,
                correo: correo.correo,
                activo: correo.estado === true
            })));

            setCorreosSeleccionables(seleccionables.map(correo => ({
                id: correo.idNotificacion,
                correo: correo.correo,
                seleccionado: correo.estadoNotificacion === 'activo'
            })));

        } catch (error) {
            console.error('Error al cargar correos:', error);
            setMensajeEstado('Error al cargar la configuración de correos');
            setTipoMensaje('error');
        } finally {
            setLoading(false);
        }
    };

    // Función para alternar selección de correo
    const toggleSeleccionCorreo = async (id) => {
        const correoActualizado = correosSeleccionables.find(c => c.id === id);
        const nuevoEstado = !correoActualizado.seleccionado;

        try {
            // Actualizar en base de datos
            await apiNotificacionService.configuracion.actualizarEstadoCorreos([{
                idNotificacion: id,
                estadoNotificacion: nuevoEstado ? 'activo' : 'inactivo'
            }]);

            // Actualizar estado local
            setCorreosSeleccionables(prev =>
                prev.map(correo =>
                    correo.id === id
                        ? { ...correo, seleccionado: nuevoEstado }
                        : correo
                )
            );
        } catch (error) {
            console.error('Error al actualizar correo:', error);
            setMensajeEstado('Error al actualizar el estado del correo');
            setTipoMensaje('error');
        }
    };

    // Función para alternar correo predeterminado
    const toggleCorreoPredeterminado = async (id) => {
        const correoActualizado = correosPredeterminados.find(c => c.id === id);
        const nuevoEstado = !correoActualizado.activo;

        try {
            // Actualizar en base de datos
            await apiNotificacionService.configuracion.actualizarEstadoCorreos([{
                idNotificacion: id,
                estado: nuevoEstado
            }]);

            // Actualizar estado local
            setCorreosPredeterminados(prev =>
                prev.map(correo =>
                    correo.id === id
                        ? { ...correo, activo: nuevoEstado }
                        : correo
                )
            );
        } catch (error) {
            console.error('Error al actualizar correo predeterminado:', error);
            setMensajeEstado('Error al actualizar el correo predeterminado');
            setTipoMensaje('error');
        }
    };


    // Función para agregar nuevo correo seleccionable
    const agregarCorreo = async () => {
        if (!nuevoCorreo || !nuevoCorreo.includes('@')) {
            setMensajeEstado('Por favor ingrese un correo válido');
            setTipoMensaje('error');
            return;
        }

        try {
            // Insertar nuevo correo en la base de datos como seleccionable
            const nuevaNotificacion = {
                correo: nuevoCorreo,
                estado: true,
                estadoNotificacion: 'inactivo',
                mensaje: 'Correo agregado para notificaciones',
                permanente: false,
                automatico: false
            };

            const response = await apiNotificacionService.notificaciones.create(nuevaNotificacion);

            // Actualizar lista local
            setCorreosSeleccionables(prev => [
                ...prev,
                {
                    id: response.idNotificacion,
                    correo: nuevoCorreo,
                    seleccionado: false
                }
            ]);

            setNuevoCorreo('');
            setMensajeEstado('Correo agregado exitosamente');
            setTipoMensaje('success');

        } catch (error) {
            console.error('Error al agregar correo:', error);
            setMensajeEstado('Error al agregar el correo');
            setTipoMensaje('error');
        }
    };


    // Función para enviar notificaciones manuales
    const enviarNotificaciones = async () => {
        if (!mensaje || !asunto) {
            setMensajeEstado('Por favor complete el asunto y mensaje');
            setTipoMensaje('error');
            return;
        }

        const correosActivos = correosPredeterminados.filter(c => c.activo);
        const correosSeleccionados = correosSeleccionables.filter(c => c.seleccionado);
        const todosLosCorreos = [...correosActivos, ...correosSeleccionados];

        if (todosLosCorreos.length === 0) {
            setMensajeEstado('Debe seleccionar al menos un correo destinatario');
            setTipoMensaje('error');
            return;
        }

        try {
            setEnviando(true);

            const notificaciones = todosLosCorreos.map(correo => ({
                correo: correo.correo,
                estado: true,
                estadoNotificacion: 'enviado',
                mensaje: mensaje,
                permanente: correosPredeterminados.some(p => p.id === correo.id),
                asunto: asunto,
                fechaEnvio: new Date().toISOString(),
                automatico: false
            }));

            await apiNotificacionService.notificaciones.enviarNotificaciones(notificaciones);

            setMensajeEstado(`Notificaciones enviadas exitosamente a ${todosLosCorreos.length} destinatarios`);
            setTipoMensaje('success');

            // Limpiar formulario
            setMensaje('');
            setAsunto('');
            setCorreosSeleccionables(prev => prev.map(c => ({ ...c, seleccionado: false })));

        } catch (error) {
            console.error('Error al enviar notificaciones:', error);
            setMensajeEstado('Error al enviar las notificaciones');
            setTipoMensaje('error');
        } finally {
            setEnviando(false);
        }
    };


    if (loading) {
        return (
            <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className='bg-white p-8 rounded-lg flex flex-col justify-center items-center gap-5'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p>Cargando configuración de correos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex items-center justify-center gap-3 border-b pb-4'>
                    <Mail size={32} className="text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Sistema de Notificaciones por Correo
                    </h1>
                </div>

                {/* Mensaje de estado */}
                {mensaje_estado && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${tipo_mensaje === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {tipo_mensaje === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {mensaje_estado}
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

                    {/* Correos Predeterminados */}
                    <div className='bg-gray-50 rounded-lg p-4'>
                        <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                            Correos Predeterminados (Permanentes)
                        </h2>
                        <div className='space-y-2'>
                            {correosPredeterminados.map(correo => (
                                <div key={correo.id} className='flex items-center justify-between bg-white p-3 rounded-lg border'>
                                    <span className='text-sm font-medium text-gray-700'>
                                        {correo.correo}
                                    </span>
                                    <label className='flex items-center cursor-pointer'>
                                        <input
                                            type="checkbox"
                                            checked={correo.activo}
                                            onChange={() => toggleCorreoPredeterminado(correo.id)}
                                            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                                        />
                                        <span className='ml-2 text-sm text-gray-600'>Activo</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Correos Seleccionables */}
                    <div className='bg-gray-50 rounded-lg p-4'>
                        <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                            Correos Adicionales (Seleccionables)
                        </h2>

                        {/* Agregar nuevo correo */}
                        <div className='flex gap-2 mb-4'>
                            <input
                                type="email"
                                placeholder="nuevo.correo@hospital.com"
                                value={nuevoCorreo}
                                onChange={(e) => setNuevoCorreo(e.target.value)}
                                className='flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
                            />
                            <button
                                onClick={agregarCorreo}
                                className='px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Lista de correos */}
                        <div className='space-y-2 max-h-64 overflow-y-auto'>
                            {correosSeleccionables.map(correo => (
                                <div key={correo.id} className='flex items-center justify-between bg-white p-3 rounded-lg border'>
                                    <label className='flex items-center cursor-pointer flex-1'>
                                        <input
                                            type="checkbox"
                                            checked={correo.seleccionado}
                                            onChange={() => toggleSeleccionCorreo(correo.id)}
                                            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                                        />
                                        <span className='ml-3 text-sm font-medium text-gray-700'>
                                            {correo.correo}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Formulario de Mensaje */}
                <div className='bg-gray-50 rounded-lg p-4'>
                    <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                        Envío Manual de Mensajes
                    </h2>

                    <div className='space-y-4'>
                        {/* Asunto */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Asunto *
                            </label>
                            <input
                                type="text"
                                value={asunto}
                                onChange={(e) => setAsunto(e.target.value)}
                                placeholder="Asunto de la notificación"
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Mensaje *
                            </label>
                            <textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="Contenido del mensaje a enviar..."
                                rows={4}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Resumen y Envío */}
                <div className='bg-blue-50 rounded-lg p-4'>
                    <h3 className='text-md font-semibold mb-2 text-gray-800'>Resumen de Envío</h3>
                    <div className='text-sm text-gray-600 mb-4'>
                        <p>• Correos predeterminados activos: {correosPredeterminados.filter(c => c.activo).length}</p>
                        <p>• Correos adicionales seleccionados: {correosSeleccionables.filter(c => c.seleccionado).length}</p>
                        <p className='font-medium'>
                            Total destinatarios: {correosPredeterminados.filter(c => c.activo).length + correosSeleccionables.filter(c => c.seleccionado).length}
                        </p>
                    </div>

                    <button
                        onClick={enviarNotificaciones}
                        disabled={enviando}
                        className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${enviando
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {enviando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Enviar Notificaciones
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
