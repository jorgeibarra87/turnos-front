import React, { useEffect, useState } from "react";
import { Edit, Trash2, CopyPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { personasEquiposService, personasService } from '../../Services/apiPersonasService';

export default function PersonasEquiposTable() {
    const [usuariosEquipos, setUsuariosEquipos] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // Estados para manejo de loading y errores
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Función unificada para cargar todos los datos
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar todos los datos en paralelo
            const [usuariosEquiposData, personasData, equiposData] = await Promise.all([
                personasEquiposService.getUsuariosEquipos(),
                personasService.getAll(),
                personasEquiposService.getEquipos()
            ]);

            setUsuariosEquipos(usuariosEquiposData);
            setPersonas(personasData);
            setEquipos(equiposData);
        } catch (err) {
            setError(err.message);
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idPersona, idEquipo) => {
        if (window.confirm("¿Eliminar relación?")) {
            try {
                await personasEquiposService.removeEquipoFromPersona(idPersona, idEquipo);
                await loadData(); // Recargar datos
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Lógica de paginación
    const totalPages = Math.ceil(usuariosEquipos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPersonasEquipos = usuariosEquipos.slice(startIndex, endIndex);

    // Funciones para cambiar página
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
        const delta = 2; // Número de páginas
        const range = [];
        const rangeWithDots = [];

        // Calcular el rango de páginas a mostrar
        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            range.push(i);
        }

        // Agregar primera página
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        // Agregar páginas del rango
        rangeWithDots.push(...range);

        // Agregar última página
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Mostrar loading si está cargando
    if (loading) {
        return (
            <div className="m-8 p-6 bg-white shadow rounded">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-500">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="m-8 p-6 bg-white shadow rounded">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Gestion Personas - Equipos</h1>
                <button
                    onClick={() => {
                        setEditando(null);
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                >
                    <CopyPlus size={18} /> Nueva Relación
                </button>
            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                    {error}
                </div>
            )}

            {/* Selector de elementos por página */}
            <div className="flex items-center justify-end gap-2 pb-1">
                <span className="text-sm text-gray-600">Mostrar:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Resetear a primera página
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">por página</span>
            </div>

            <table className="w-full border-collapse text-sm text-left">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-2">Persona</th>
                        <th className="p-2">Documento</th>
                        <th className="p-2">Equipos</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPersonasEquipos.map((u) => (
                        <tr key={u.idPersona} className="border-b">
                            <td className="p-2">{u.nombreCompleto}</td>
                            <td className="p-2">{u.documento}</td>
                            <td className="p-2">
                                {u.equipos.map((t) => (
                                    <span
                                        key={t.idEquipo}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                                    >
                                        {t.nombre}
                                    </span>
                                ))}
                            </td>
                            <td className="p-2 space-x-2">
                                <button
                                    onClick={() => {
                                        setEditando(u);
                                        setShowForm(true);
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    <Edit size={16} />
                                </button>
                                {u.equipos.map((t) => (
                                    <button
                                        key={t.idEquipo}
                                        onClick={() => handleDelete(u.idPersona, t.idEquipo)}
                                        className="text-red-600 hover:underline"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Información de paginación y controles */}
            {usuariosEquipos.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Información de registros */}
                    <div className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, usuariosEquipos.length)} de {usuariosEquipos.length} registros
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
                            >
                                <ChevronLeft size={20} />
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
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {usuariosEquipos.length === 0 && !loading && (
                <div className="text-center py-6 text-gray-500">
                    <Users size={40} className="mx-auto mb-2" />
                    No hay relaciones registradas
                </div>
            )}

            {showForm && (
                <FormularioUsuarioEquipo
                    personas={personas}
                    equipos={equipos}
                    editando={editando}
                    onClose={() => setShowForm(false)}
                    onSaved={loadData} // Cambiar loadUsuariosEquipos por loadData
                />
            )}
        </div>
    );
}

// FORMULARIO actualizado
function FormularioUsuarioEquipo({ personas, equipos, editando, onClose, onSaved }) {
    const [personaId, setPersonaId] = useState(editando?.idPersona || "");
    const [equipoId, setEquipoId] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleGuardar = async () => {
        try {
            setSaving(true);
            setError("");

            await personasEquiposService.addEquipoToPersona(personaId, equipoId);

            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-lg font-bold mb-4">
                    {editando ? "Editar Relación" : "Nueva Relación"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm mb-1">Persona</label>
                    <select
                        value={personaId}
                        onChange={(e) => setPersonaId(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        disabled={saving}
                    >
                        <option value="">Seleccione persona</option>
                        {personas.map((p) => (
                            <option key={p.idPersona} value={p.idPersona}>
                                {p.nombreCompleto}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm mb-1">Equipo</label>
                    <select
                        value={equipoId}
                        onChange={(e) => setEquipoId(e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                        disabled={saving}
                    >
                        <option value="">Seleccione equipo</option>
                        {equipos.map((t) => (
                            <option key={t.idEquipo} value={t.idEquipo}>
                                {t.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-3 py-1 bg-gray-500 hover:bg-red-600 text-white rounded disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={!personaId || !equipoId || saving}
                        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
