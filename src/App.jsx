import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TurnosTable from './components/CuadroTurnosTable';
import { turnosData } from './data/turnosData';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditarCuadro from './components/CuadrosTurno/EditarCuadro';
import VerCuadro from './components/CuadrosTurno/VerCuadro';
import CrearCuadro from './components/CuadrosTurno/CrearCuadro';

const App = () => (

  <div className="flex h-screen bg-primary-blue-backwround">
    <Sidebar />

    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route exact path="/" element={<TurnosTable />} />
          <Route exact path="/verCuadro" element={<VerCuadro />} />
          <Route exact path="/editarCuadro/" element={<EditarCuadro />} />
          <Route exact path="/crearCuadro/" element={<CrearCuadro />} />
        </Routes>
      </main>
    </div>

  </div>
);

export default App;

