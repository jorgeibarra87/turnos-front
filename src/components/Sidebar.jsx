import React from 'react';

const Sidebar = () => (
    <aside className="bg-slate-800 text-white w-48 p-4">
        <div className="font-bold mb-4">Menú</div>
        <ul className="space-y-2 text-sm">
            <li className="hover:underline cursor-pointer">Supervisión</li>
            <li className="hover:underline cursor-pointer">Gestores</li>
            <li className="hover:underline cursor-pointer">Ajustes</li>
        </ul>
    </aside>
);

export default Sidebar;