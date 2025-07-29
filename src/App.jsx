import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TurnosTable from './components/CuadrosTurno/CuadroTurnosTable';
import { turnosData } from './data/turnosData';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CrearCuadro from './components/CuadrosTurno/CrearCuadro';
import CrearCuadro2 from './components/CuadrosTurno/CrearCuadro2';
import CrearCuadro3 from './components/CuadrosTurno/CrearCuadro3';
import CrearCuadro4 from './components/CuadrosTurno/CrearCuadro4';
import VerCuadro from './components/CuadrosTurno/VerCuadro';
import CrearCuadroMulti from './components/CuadrosTurno/CrearCuadroMulti';
import CrearCuadroMulti2 from './components/CuadrosTurno/CrearCuadroMulti2';
import CrearCuadroMulti3 from './components/CuadrosTurno/CrearCuadroMulti3';
import Pruebas from './components/CuadrosTurno/Pruebas';

const App = () => (
  <div className="flex h-screen bg-primary-blue-backwround">
    <Sidebar />

    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 relative">
        <Routes>
          <Route exact path="/" element={<TurnosTable />} />

          <Route exact path="/crearCuadro/" element={<CrearCuadro />} />
          {/* Nueva ruta para manejar edición con parámetro ID */}
          <Route exact path="/crearCuadro/editar/:id" element={<CrearCuadro />} />
          {/* Ruta para crear desde /crearCuadro */}
          <Route exact path="crearCuadro/crear" element={<CrearCuadro />} />

          <Route exact path="/crearCuadro2/" element={<CrearCuadro2 />} />
          <Route exact path="/crearCuadro3/" element={<CrearCuadro3 />} />
          <Route exact path="/crearCuadro4/" element={<CrearCuadro4 />} />
          <Route exact path="/CrearCuadroMulti/" element={<CrearCuadroMulti />} />
          <Route exact path="/CrearCuadroMulti2/" element={<CrearCuadroMulti2 />} />
          <Route exact path="/CrearCuadroMulti3/" element={<CrearCuadroMulti3 />} />
          <Route exact path="/Pruebas/" element={<Pruebas />} />
          {/* Nueva ruta para manejar edición con parámetro ID */}
          <Route exact path="/Pruebas/editar/:id" element={<Pruebas />} />
          {/* Ruta para crear desde /Pruebas */}
          <Route exact path="/Pruebas/crear" element={<Pruebas />} />
          <Route exact path="/VerCuadro/:id" element={<VerCuadro />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default App;