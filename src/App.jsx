import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TurnosTable from './components/CuadrosTurno/CuadroTurnosTable';
import { turnosData } from './data/turnosData';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditarCuadro from './components/CuadrosTurno/EditarCuadro';
import CrearCuadro from './components/CuadrosTurno/CrearCuadro';
import CrearCuadro2 from './components/CuadrosTurno/CrearCuadro2';
import CrearCuadro3 from './components/CuadrosTurno/CrearCuadro3';
import CrearCuadro4 from './components/CuadrosTurno/CrearCuadro4';
import CrearCuadroMulti from './components/CuadrosTurno/CrearCuadroMulti';
import Pruebas from './components/CuadrosTurno/Pruebas';

const App = () => (
  <div className="flex h-screen bg-primary-blue-backwround">
    <Sidebar />

    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 relative">
        <Routes>
          <Route exact path="/" element={<TurnosTable />} />
          <Route exact path="/editarCuadro/" element={<EditarCuadro />} />
          <Route exact path="/crearCuadro/" element={<CrearCuadro />} />
          <Route exact path="/crearCuadro2/" element={<CrearCuadro2 />} />
          <Route exact path="/crearCuadro3/" element={<CrearCuadro3 />} />
          <Route exact path="/crearCuadro4/" element={<CrearCuadro4 />} />
          <Route exact path="/CrearCuadroMulti/" element={<CrearCuadroMulti />} />
          <Route exact path="/Pruebas/" element={<Pruebas />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default App;