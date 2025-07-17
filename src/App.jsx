import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TurnosTable from './components/TurnosTable';
import { turnosData } from './data/turnosData';

const App = () => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <TurnosTable turnos={turnosData} />
      </main>
    </div>
  </div>
);

export default App;

