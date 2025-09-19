import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, ArrowLeft, Eye, Users } from 'lucide-react';
import { apiEquipoService } from '../Services/apiEquipoService';

export default function VerEquipo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [equipo, setEquipo] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [errorMiembros, setErrorMiembros] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verMasObservaciones, setVerMasObservaciones] = useState(false);


    //Obtener datos del equipo
    useEffect(() => {
        const fetchEquipo = async () => {
            try {
                setLoading(true);
                setError(null);

                // apiEquipoService
                const equipoData = await apiEquipoService.equipos.getById(id);
                setEquipo(equipoData);

            } catch (err) {
                console.error('Error al cargar equipo:', err);

                if (err.response?.status === 404) {
                    setError('Equipo no encontrado');
                } else {
                    setError('Error al cargar el equipo');
                }

                setEquipo(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEquipo();
        }
    }, [id]);

    //Cargar miembros;
    useEffect(() => {
        const loadMiembrosEquipo = async () => {
            if (!id) return;

            try {
                setLoadingMiembros(true);
                setErrorMiembros(null);

                // apiEquipoService
                const miembrosData = await apiEquipoService.equipos.getMiembrosPerfil(id);
                setMiembros(miembrosData);

            } catch (error) {
                console.error("Error al obtener miembros del equipo:", error);
                setErrorMiembros("Error al cargar los miembros del equipo");
                setMiembros([]);
            } finally {
                setLoadingMiembros(false);
            }
        };

        loadMiembrosEquipo();
    }, [id]);



    return (
        <div className='absolute inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-4 rounded-lg flex flex-col gap-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>

                {/* Header */}
                <div className='flex items-center justify-between border-b pb-2'>
                    <div className='flex items-center gap-4'>
                        <div className="flex items-center justify-center gap-3 rounded-2xl border-b-4  border-primary-green-husj pl-4 pr-4 pb-1 pt-1 mb-1 w-fit mx-auto">
                            <Eye size={40} className="text-primary-green-husj" />
                            <h1 className="text-2xl font-extrabold text-gray-800">
                                Ver Equipo
                            </h1>
                        </div>
                    </div>
                    <div className='text-sm'>
                        ID: {id}
                    </div>
                </div>

                {/* Nombre del equipo */}
                <div className='bg-white p-4 rounded-lg border'>
                    <div className='text-xl font-bold text-black-500 mb-1'>Equipo: {equipo?.nombre || `Equipo ID: ${equipo?.idEquipo}`}</div>

                </div>

                {/* Equipo de Trabajo */}
                <div className='bg-white rounded-lg border'>
                    <div className='bg-blue-50 px-6 py-2 border-b'>
                        <h2 className='text-xl font-semibold flex items-center gap-2'>
                            <Users size={20} className="text-blue-600" />
                            Equipo de Talento Humano
                        </h2>
                    </div>

                    {loadingMiembros ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando miembros del equipo...</p>
                        </div>
                    ) : errorMiembros ? (
                        <div className="p-6 text-center text-red-600 bg-red-50 m-4 rounded-lg">
                            {errorMiembros}
                        </div>
                    ) : miembros.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No se encontraron miembros para este equipo
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th></th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Perfil
                                        </th>
                                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Nombre Completo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {miembros.map((miembro, index) => (
                                        <tr key={index} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-2 py-2 text-center'>
                                                <User size={20} className='text-gray-400' />
                                            </td>
                                            <td className='px-2 py-2 text-sm text-gray-700'>
                                                {miembro.titulos?.join(', ') || 'Sin perfil definido'}
                                            </td>
                                            <td className='px-2 py-2 text-sm font-medium text-gray-900'>
                                                {miembro.nombreCompleto || 'Nombre no disponible'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-start gap-3 border border-gray-300 rounded-xl p-2 text-sm">
                    <div className="w-32 font-semibold text-gray-700">Observaciones:</div>
                    <div className="text-gray-900 text-sm leading-relaxed">
                        <div className={`${verMasObservaciones ? '' : 'line-clamp-3'} whitespace-pre-line`}>
                            {equipo?.observaciones || 'Sin observaciones'}
                        </div>
                        {equipo?.observaciones && equipo?.observaciones.length > 200 && ( // solo mostrar botón si el texto es largo
                            <button
                                onClick={() => setVerMasObservaciones(!verMasObservaciones)}
                                className="text-blue-600 hover:underline text-xs mt-1"
                            >
                                {verMasObservaciones ? 'Ver menos' : 'Ver más'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Botón de volver */}
                <div className='flex justify-center gap-4 pt-4 border-t'>
                    <Link to="/equipos">
                        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Volver al Listado
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
