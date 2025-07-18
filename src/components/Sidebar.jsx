import React from 'react';

const Sidebar = () => (
    <aside className="bg-slate-800 text-white w-60">
        <div className=" text-white p-4 flex items-center">
            <div className="bg-secondary-yellow-nav p-2 rounded mr-3">
                <span className="bg-secondary-yellow-nav font-bold text-white">S</span>
            </div>
            <span className="font-semibold">Solutions HUSJ</span>
        </div>

        <ul className="space-y-2 text-sm">
            <li className="hover:bg-secondary-yellow-nav cursor-pointer  p-2 ">Supervisión</li>
            <li className="hover:bg-secondary-yellow-nav cursor-pointer  p-2" >Gestores</li>
            <li className="hover:bg-secondary-yellow-nav cursor-pointer  p-2">Ajustes</li>
        </ul>
    </aside>
);

export default Sidebar;