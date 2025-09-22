import React, { useState } from 'react';
import { UserPlus, Search, Save, X, User, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { personasService, personasTitulosService } from '../Services/apiPersonasService';
import { titulosService, tiposFormacionService } from '../Services/apiTitulosService';


export default function SincronizarPersona({ onClose, onPersonaSincronizada }) {
    const [documento, setDocumento] = useState('');
    const [datosPersona, setDatosPersona] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Estados del formulario
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        email: '',
        telefono: '',
        titulo: '',
        tipoFormacion: '',
        fechaNacimiento: '',
        apellidos: '',
        nombres: ''
    });

    // Opciones para tipo de formación
    const tiposFormacion = [
        { id: 1, tipo: 'ESPECIALISTA' },
        { id: 2, tipo: 'PROFESIONAL' },
        { id: 3, tipo: 'NO PROFESIONAL' }
    ];

    // Datos simulados de la consulta
    const datosSimulados = {
        "987654321": {
            persona: {
                "fechaNacimiento": null,
                "apellidos": null,
                "documento": "987654321",
                "email": "pruebas1@gmail.com",
                "nombreCompleto": "PRUEBAS 1",
                "nombres": null,
                "telefono": null
            },
            titulo: {
                "idTitulo": 43,
                "titulo": "PROCTOLOGÍA",
                "idTipoFormacionAcademica": 1,
                "estado": true,
                "nombreTipo": "ESPECIALISTA"
            }
        },
        "12345678": {
            persona: {
                "fechaNacimiento": "1985-03-15",
                "apellidos": "GARCÍA LÓPEZ",
                "documento": "12345678",
                "email": null,
                "nombreCompleto": "MARÍA GARCÍA LÓPEZ",
                "nombres": "MARÍA",
                "telefono": "3001234567"
            },
            titulo: {
                "idTitulo": 25,
                "titulo": "MEDICINA GENERAL",
                "idTipoFormacionAcademica": 2,
                "estado": true,
                "nombreTipo": "PROFESIONAL"
            }
        },
        "11223344": {
            persona: {
                "fechaNacimiento": "1990-07-22",
                "apellidos": "RODRÍGUEZ MARTÍN",
                "documento": "11223344",
                "email": "carlos.rodriguez@hospital.com",
                "nombreCompleto": "CARLOS RODRÍGUEZ MARTÍN",
                "nombres": "CARLOS",
                "telefono": null
            },
            titulo: {
                "idTitulo": 67,
                "titulo": "CARDIOLOGÍA",
                "idTipoFormacionAcademica": 1,
                "estado": true,
                "nombreTipo": "ESPECIALISTA"
            }
        }
    };

    // Función para verificar si la persona existe por documento
    const verificarPersonaExistente = async (documento) => {
        try {
            const todasPersonas = await personasService.getAll();
            return todasPersonas.find(persona => persona.documento === documento);
        } catch (error) {
            console.error('Error al verificar persona existente:', error);
            return null;
        }
    };

    // Función para buscar o crear título
    const buscarOCrearTitulo = async (nombreTitulo, tipoFormacionId) => {
        try {
            // Buscar título existente
            const todosLosTitulos = await titulosService.getAll();
            const tituloExistente = todosLosTitulos.find(
                titulo => titulo.titulo.toLowerCase() === nombreTitulo.toLowerCase()
            );

            if (tituloExistente) {
                return tituloExistente;
            }

            // Si no existe, crear nuevo título
            const nuevoTitulo = {
                titulo: nombreTitulo,
                idTipoFormacionAcademica: parseInt(tipoFormacionId),
                estado: true
            };

            return await titulosService.create(nuevoTitulo);
        } catch (error) {
            console.error('Error al buscar o crear título:', error);
            throw new Error('Error al procesar el título');
        }
    };

    // Función auxiliar para manejar la relación persona-título
    const manejarRelacionPersonaTitulo = async (personaId, tituloId) => {
        try {
            // Obtener títulos actuales de la persona
            const usuariosTitulos = await personasTitulosService.getUsuariosTitulos();
            const relacionExistente = usuariosTitulos.find(
                rel => rel.idPersona === personaId && rel.idTitulo === tituloId
            );

            if (!relacionExistente) {
                // Solo agregar si no existe la relación
                await personasTitulosService.addTituloToPersona(personaId, tituloId);
                console.log('Relación persona-título creada exitosamente');
            } else {
                console.log('La relación persona-título ya existe');
            }
        } catch (error) {
            // Log del error pero no fallar el proceso completo
            console.error('Error al manejar relación persona-título:', error);
        }
    };

    // consulta GET
    const handleSincronizar = async () => {
        if (!documento.trim()) {
            setError('Por favor ingresa un número de documento');
            return;
        }

        setLoading(true);
        setError('');
        setDatosPersona(null);

        try {
            // Simular delay de API
            //await new Promise(resolve => setTimeout(resolve, 1500));
            // Buscar datos simulados
            //const datos = datosSimulados[documento.trim()];
            const response = await fetch(`/api/genusuario/informacionCompleta/${documento.trim()}`);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontraron datos para este documento');
                } else if (response.status >= 500) {
                    throw new Error('Error del servidor. Inténtalo más tarde');
                } else {
                    throw new Error(`Error en la consulta: ${response.status}`);
                }
            }

            // Convertir respuesta a JSON
            const data = await response.json();

            // Adaptar los datos
            const datosAdaptados = {
                persona: {
                    fechaNacimiento: data.fechaNacimiento,
                    apellidos: data.apellidos || null,
                    documento: data.documento,
                    email: data.email,
                    nombreCompleto: data.nombreCompleto,
                    nombres: data.nombres || null,
                    telefono: data.telefono
                },
                titulo: {
                    idTitulo: null,
                    titulo: data.titulo || '',
                    idTipoFormacionAcademica: null,
                    estado: true,
                    nombreTipo: ''
                }
            };

            setDatosPersona(datosAdaptados);

            // Prellenar formulario con datos obtenidos - manejar valores null
            setFormData({
                nombreCompleto: datosAdaptados.persona.nombreCompleto || '',
                email: datosAdaptados.persona.email || '',
                telefono: datosAdaptados.persona.telefono || '',
                titulo: datosAdaptados.titulo.titulo || '',
                tipoFormacion: datosAdaptados.titulo.idTipoFormacionAcademica ?
                    datosAdaptados.titulo.idTipoFormacionAcademica.toString() : '',
                fechaNacimiento: datosAdaptados.persona.fechaNacimiento || '',
                apellidos: datosAdaptados.persona.apellidos || '',
                nombres: datosAdaptados.persona.nombres || ''
            });
        } catch (err) {
            setError(err.message || 'Error al consultar los datos');
            setDatosPersona(null);
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Guardar persona sincronizada
    const handleGuardar = async () => {
        setSaving(true);
        setError(''); // Limpiar errores previos

        try {
            // Validaciones básicas
            if (!formData.nombreCompleto.trim()) {
                throw new Error('El nombre completo es requerido');
            }

            if (!formData.tipoFormacion) {
                throw new Error('El tipo de formación es requerido');
            }

            if (!formData.titulo.trim()) {
                throw new Error('El título/especialidad es requerido');
            }

            if (!formData.fechaNacimiento) {
                throw new Error('La fecha de nacimiento es requerida');
            }

            // Validación de email (si se proporciona, debe ser válido)
            if (formData.email && !isValidEmail(formData.email)) {
                throw new Error('El email proporcionado no es válido');
            }

            // Verificar si la persona ya existe
            const personaExistente = await verificarPersonaExistente(documento);

            // Buscar o crear el título
            const titulo = await buscarOCrearTitulo(formData.titulo, formData.tipoFormacion);

            // Preparar datos de la persona
            const datosPersona = {
                documento: documento,
                nombreCompleto: formData.nombreCompleto,
                nombres: formData.nombres || null,
                apellidos: formData.apellidos || null,
                email: formData.email || null,
                telefono: formData.telefono || null,
                fechaNacimiento: formData.fechaNacimiento || null
            };

            let personaGuardada;

            if (personaExistente) {
                // Actualizar persona existente
                console.log('Actualizando persona existente:', personaExistente.idPersona);
                personaGuardada = await personasService.update(personaExistente.idPersona, datosPersona);
            } else {
                // Crear nueva persona
                console.log('Creando nueva persona');
                personaGuardada = await personasService.create(datosPersona);
            }

            // Asociar título a la persona (si no está ya asociado)
            try {
                await personasTitulosService.addTituloToPersona(personaGuardada.idPersona, titulo.idTitulo);
            } catch (error) {
                // Si ya existe la relación, no es un error grave
                console.log('La relación persona-título ya existe o hubo un error menor:', error.message);
            }

            // Preparar datos para el componente padre
            const personaSincronizada = {
                idPersona: personaGuardada.idPersona,
                nombreCompleto: personaGuardada.nombreCompleto,
                documento: personaGuardada.documento,
                email: personaGuardada.email,
                telefono: personaGuardada.telefono,
                titulo: titulo.titulo,
                tipoFormacion: tiposFormacion.find(t => t.id.toString() === formData.tipoFormacion)?.tipo,
                fechaNacimiento: personaGuardada.fechaNacimiento,
                apellidos: personaGuardada.apellidos,
                nombres: personaGuardada.nombres,
                sincronizado: true,
                esActualizacion: !!personaExistente
            };

            // Notificar al componente padre
            if (onPersonaSincronizada) {
                onPersonaSincronizada(personaSincronizada);
            }

            // Mostrar mensaje de éxito
            setError(''); // Limpiar errores

            // Opcional: mostrar mensaje de éxito
            console.log(personaExistente ? 'Persona actualizada exitosamente' : 'Persona creada exitosamente');

            // Cerrar modal
            onClose();

        } catch (err) {
            console.error('Error al guardar persona:', err);
            setError(err.message || 'Error al guardar la persona');
        } finally {
            setSaving(false);
        }
    };

    // Función auxiliar para validar email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4 border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                    <UserPlus size={40} className="text-primary-green-husj" />
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        Sincronizar Persona
                    </h1>
                </div>

                {/* Sección de consulta por documento */}
                <div className='bg-gray-50 p-4 rounded-lg border'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <Search size={20} className="text-blue-600" />
                        Consultar por Documento
                    </h3>

                    <div className='flex gap-4 items-end'>
                        <div className='flex-1'>
                            <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Documento *
                            </label>
                            <input
                                type="text"
                                id="documento"
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value)}
                                placeholder="Ej: 987654321"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <button
                            onClick={handleSincronizar}
                            disabled={loading || !documento.trim()}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${loading || !documento.trim()
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            <Search size={20} />
                            {loading ? 'Consultando...' : 'Sincronizar'}
                        </button>
                    </div>

                    {/* Documentos de ejemplo */}
                    {/* <div className='mt-4 text-sm text-gray-600'>
                        <p className='font-medium mb-1'>Documentos de prueba disponibles:</p>
                        <div className='flex gap-4 flex-wrap'>
                            {Object.keys(datosSimulados).map(doc => (
                                <button
                                    key={doc}
                                    onClick={() => setDocumento(doc)}
                                    className='px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs'
                                >
                                    {doc}
                                </button>
                            ))}
                        </div>
                    </div> */}
                </div>

                {/* Mostrar error */}
                {error && (
                    <div className='bg-red-50 border border-red-300 rounded-lg p-4 flex items-center gap-2 text-red-700'>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Mostrar loading */}
                {loading && (
                    <div className='bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-center gap-3'>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className='text-blue-700'>Consultando datos del personal médico...</span>
                    </div>
                )}

                {/* Formulario de datos */}
                {datosPersona && (
                    <div className='bg-green-50 border border-green-300 rounded-lg p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                            <CheckCircle size={20} className="text-green-600" />
                            <h3 className='text-lg font-semibold text-green-800'>
                                Datos Sincronizados Correctamente
                            </h3>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Nombre Completo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    value={formData.nombreCompleto}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-100"
                                    readOnly
                                />
                            </div>

                            {/* Documento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Documento
                                </label>
                                <input
                                    type="text"
                                    value={documento}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-green-100"
                                    readOnly
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email {!datosPersona?.persona?.email && '*'}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={!datosPersona?.persona?.email ? "Ingresa el email" : ""}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${datosPersona?.persona?.email ? 'bg-green-100' : 'bg-yellow-50 border-yellow-300'
                                        }`}
                                    readOnly={!!datosPersona?.persona?.email}
                                    required={!datosPersona?.persona?.email}
                                />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono (opcional)
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    placeholder={!datosPersona?.persona?.telefono ? "Ingresa el teléfono (opcional)" : ""}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${datosPersona?.persona?.telefono ? 'bg-green-100' : 'bg-white'
                                        }`}
                                />
                            </div>

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título/Especialidad *
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Ingresa el título/especialidad"
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${datosPersona && datosPersona.titulo && datosPersona.titulo.titulo
                                        ? 'bg-green-100'
                                        : 'bg-yellow-50 border-yellow-300'
                                        }`}
                                    required
                                />
                            </div>

                            {/* Tipo de Formación */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Formación *
                                </label>
                                <select
                                    name="tipoFormacion"
                                    value={formData.tipoFormacion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">-- Seleccionar tipo --</option>
                                    {tiposFormacion.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nombres */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombres
                                </label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder={!datosPersona.persona.nombres ? "Opcional" : ""}
                                />
                            </div>

                            {/* Apellidos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder={!datosPersona.persona.apellidos ? "Opcional" : ""}
                                />
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Nacimiento *
                                </label>
                                <input
                                    type="date"
                                    name="fechaNacimiento"
                                    value={formData.fechaNacimiento}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Información adicional */}
                        {/* <div className='mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg'>
                            <h4 className='font-semibold mb-2'>Información de la consulta:</h4>
                            <div className='space-y-1'>
                                <p><span className='font-medium'>ID Título:</span> {datosPersona.titulo.idTitulo}</p>
                                <p><span className='font-medium'>Tipo Formación ID:</span> {datosPersona.titulo.idTipoFormacionAcademica}</p>
                                <p><span className='font-medium'>Estado:</span> {datosPersona.titulo.estado ? 'Activo' : 'Inactivo'}</p>
                            </div>
                        </div> */}
                    </div>
                )}

                {/* Botones de acción */}
                <div className='flex justify-center items-center gap-4 pt-4 border-t'>
                    {datosPersona ? (
                        <button
                            onClick={handleGuardar}
                            disabled={saving}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${saving
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            <Save size={20} />
                            {saving ? 'Guardando...' : 'Guardar Persona'}
                        </button>
                    ) : null}

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
