import React, { useEffect, useState } from 'react';
import { Mail, Send, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function GestionNotificaciones() {
    // Estados para correos
    const [correosPredeterminados, setCorreosPredeterminados] = useState([
        { id: 1, correo: 'admin@hospital.com', activo: true },
        { id: 2, correo: 'supervisor@hospital.com', activo: true },
        { id: 3, correo: 'gerencia@hospital.com', activo: true }
    ]);

    const [correosDisponibles, setCorreosDisponibles] = useState([
        { id: 4, correo: 'medico1@hospital.com', seleccionado: false },
        { id: 5, correo: 'enfermera1@hospital.com', seleccionado: false },
        { id: 6, correo: 'coordinador@hospital.com', seleccionado: false },
        { id: 7, correo: 'auxiliar@hospital.com', seleccionado: false }
    ]);

    // Estados para el formulario
    const [mensaje, setMensaje] = useState('');
    const [asunto, setAsunto] = useState('');
    const [permanente, setPermanente] = useState(false);
    const [nuevoCorreo, setNuevoCorreo] = useState('');

    // Estados de UI
    const [enviando, setEnviando] = useState(false);
    const [mensaje_estado, setMensajeEstado] = useState('');
    const [tipo_mensaje, setTipoMensaje] = useState('');

    // Función para alternar selección de correo
    const toggleSeleccionCorreo = (id) => {
        setCorreosDisponibles(prev =>
            prev.map(correo =>
                correo.id === id
                    ? { ...correo, seleccionado: !correo.seleccionado }
                    : correo
            )
        );
    };

    // Función para alternar correo predeterminado
    const toggleCorreoPredeterminado = (id) => {
        setCorreosPredeterminados(prev =>
            prev.map(correo =>
                correo.id === id
                    ? { ...correo, activo: !correo.activo }
                    : correo
            )
        );
    };

    // Función para agregar nuevo correo
    const agregarCorreo = () => {
        if (nuevoCorreo && nuevoCorreo.includes('@')) {
            const nuevoId = Math.max(...correosDisponibles.map(c => c.id)) + 1;
            setCorreosDisponibles(prev => [
                ...prev,
                { id: nuevoId, correo: nuevoCorreo, seleccionado: false }
            ]);
            setNuevoCorreo('');
        }
    };

    // Función para eliminar correo
    const eliminarCorreo = (id) => {
        setCorreosDisponibles(prev => prev.filter(correo => correo.id !== id));
    };

    // Función para enviar notificaciones
    const enviarNotificaciones = async () => {
        if (!mensaje || !asunto) {
            setMensajeEstado('Por favor complete el asunto y mensaje');
            setTipoMensaje('error');
            return;
        }

        const correosActivos = correosPredeterminados.filter(c => c.activo);
        const correosSeleccionados = correosDisponibles.filter(c => c.seleccionado);
        const todosLosCorreos = [...correosActivos, ...correosSeleccionados];

        if (todosLosCorreos.length === 0) {
            setMensajeEstado('Debe seleccionar al menos un correo destinatario');
            setTipoMensaje('error');
            return;
        }

        try {
            setEnviando(true);

            // Aquí simulas el envío - reemplaza con tu API real
            const notificaciones = todosLosCorreos.map(correo => ({
                correo: correo.correo,
                estado: 'pendiente',
                estado_notificacion: 'enviado',
                mensaje: mensaje,
                asunto: asunto,
                permanente: permanente,
                fecha_envio: new Date().toISOString()
            }));

            // Simular llamada API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Aquí harías la llamada real a tu API:
            // const response = await apiNotificacionService.enviarNotificaciones(notificaciones);

            console.log('Notificaciones enviadas:', notificaciones);

            setMensajeEstado(`Notificaciones enviadas exitosamente a ${todosLosCorreos.length} destinatarios`);
            setTipoMensaje('success');

            // Limpiar formulario
            setMensaje('');
            setAsunto('');
            setPermanente(false);
            setCorreosDisponibles(prev => prev.map(c => ({ ...c, seleccionado: false })));

        } catch (error) {
            console.error('Error al enviar notificaciones:', error);
            setMensajeEstado('Error al enviar las notificaciones');
            setTipoMensaje('error');
        } finally {
            setEnviando(false);
        }
    };

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
                            Correos Predeterminados
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
                            Correos Adicionales
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
                            {correosDisponibles.map(correo => (
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
                                    <button
                                        onClick={() => eliminarCorreo(correo.id)}
                                        className='p-1 text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Formulario de Mensaje */}
                <div className='bg-gray-50 rounded-lg p-4'>
                    <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                        Contenido del Mensaje
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

                        {/* Opciones adicionales */}
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={permanente}
                                    onChange={(e) => setPermanente(e.target.checked)}
                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                                />
                                <span className='ml-2 text-sm text-gray-700'>Notificación permanente</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Resumen y Envío */}
                <div className='bg-blue-50 rounded-lg p-4'>
                    <h3 className='text-md font-semibold mb-2 text-gray-800'>Resumen de Envío</h3>
                    <div className='text-sm text-gray-600 mb-4'>
                        <p>• Correos predeterminados activos: {correosPredeterminados.filter(c => c.activo).length}</p>
                        <p>• Correos adicionales seleccionados: {correosDisponibles.filter(c => c.seleccionado).length}</p>
                        <p className='font-medium'>
                            Total destinatarios: {correosPredeterminados.filter(c => c.activo).length + correosDisponibles.filter(c => c.seleccionado).length}
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
