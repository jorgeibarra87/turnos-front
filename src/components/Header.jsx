import React from 'react';

const Header = () => (
    <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Gestión de Turnos</h1>
        <button className="text-sm text-red-600 hover:underline">Logout</button>
    </header>
);

export default Header;