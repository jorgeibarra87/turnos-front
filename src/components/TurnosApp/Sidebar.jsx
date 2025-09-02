import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({
        supervision: false,
        gestores: false,
        ajustes: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Función para manejar clics en submenús (React Router)
    const handleSubMenuClick = (route) => {
        console.log('Navegando a:', route);
    };

    const menuItems = [
        {
            id: 'supervision',
            title: 'Supervision',
            subItems: [
                { name: 'Gestionar Contrato', route: '/contratos' },
                { name: 'Gestionar Reportes', route: 'reportesfiltro' }
            ]
        },
        {
            id: 'gestores',
            title: 'Gestores',
            subItems: [
                { name: 'Equipos Talento Humano', route: '/equipos' },
                { name: 'Cuadros de Turno', route: '/' },
                { name: 'Turnos', route: '/selector-cuadro-turno' },
                { name: 'Calendario Turnos', route: '/calendarioturnos' }
            ]
        },
        {
            id: 'ajustes',
            title: 'Ajustes',
            subItems: [
                { name: 'Personas', route: '/personas' },
                { name: 'Personas Titulos', route: '/personastitulos' },
                { name: 'Personas Roles', route: '/personasroles' },
                { name: 'Personas Equipos', route: '/personasequipos' },
                { name: 'Macroprocesos', route: '/macroprocesos' },
                { name: 'Procesos', route: '/procesos' },
                { name: 'Servicios', route: '/servicios' },
                { name: 'Procesos Atencion', route: '/procesosatencion' },
                { name: 'Secciones', route: '/secciones' },
                { name: 'Subsecciones', route: '/subsecciones' },
                { name: 'Contratos', route: '/contratos' },
                { name: 'Titulos', route: '/titulos' },
                { name: 'Tipo Formación', route: '/tipoformacion' },
                {
                    name: 'Turnos', route: '/selector-cuadro-turno'
                },
                { name: 'Cuadros Turno', route: '/' },
                { name: 'Historial Cuadros', route: '/selectorCuadroHistorial' },
                { name: 'Equipos', route: '/equipos' },
                { name: 'Bloque Servicio', route: '/bloqueservicio' },
                { name: 'Reportes', route: '/reportesfiltro' },
                { name: 'Notificaciones Correo', route: '/notificaionCorreo' },
                { name: 'Notificaciones Automaticas', route: '/notificacionAutomatica' }
            ]
        }
    ];

    return (
        <aside className="bg-slate-800 text-white w-80 h-screen overflow-y-auto">
            {/* Header */}
            <div className="text-white p-4 flex items-center border-b border-slate-700">
                <img src="/solutions.svg" alt="Icono S" className="p-3" />
                <span className="font-semibold text-sm-900">Solutions HUSJP</span>
            </div>

            {/* APP TURNOS Button */}
            <div className="p-4 border-b border-slate-700">
                <Link to="/">
                    <button className="w-full bg-slate-700 hover:bg-slate-600 text-white p-3 rounded flex items-center justify-center gap-2 transition-colors">
                        <Calendar size={20} />
                        <span className="font-medium">APP TURNOS</span>
                    </button>
                </Link>
            </div>

            {/* Menu Items */}
            <div className="p-0">
                {menuItems.map((item) => (
                    <div key={item.id} className="border-b border-slate-700 last:border-b-0">
                        {/* Main Menu Item */}
                        <button
                            onClick={() => toggleSection(item.id)}
                            className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-700 transition-colors ${expandedSections[item.id] ? 'bg-yellow-500 text-white font-medium hover:bg-yellow-500' : 'text-white'
                                }`}
                        >
                            <span>{item.title}</span>
                            {expandedSections[item.id] ? (
                                <ChevronDown size={18} />
                            ) : (
                                <ChevronRight size={18} />
                            )}
                        </button>

                        {/* Submenu Items */}
                        {expandedSections[item.id] && (
                            <div className="bg-slate-700 text-white">
                                {item.subItems.map((subItem, index) => {
                                    const isActive = location.pathname === subItem.route;

                                    return (
                                        // Opción 1
                                        <Link key={index} to={subItem.route}>
                                            <button
                                                key={index}
                                                onClick={() => handleSubMenuClick(subItem.route)}
                                                className={`w-full text-left p-4 pl-8 transition-colors border-b border-slate-600 last:border-b-0 ${
                                                    // isActive 
                                                    //     ? 'bg-yellow-500 text-slate-800 font-medium' 
                                                    //     : 'text-gray-300 hover:bg-slate-600 hover:text-white'
                                                    'text-gray-300 hover:bg-slate-600 hover:text-white'
                                                    }`}
                                            >
                                                {subItem.name}
                                            </button>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;