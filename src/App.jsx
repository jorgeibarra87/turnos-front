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
import CrearEquipo from './components/Equipos/CrearEquipos';
import EquiposTable from './components/Equipos/EquiposTable';
import VerEquipo from './components/Equipos/VerEquipo';
import VerContrato from './components/Contratos/VerContratos';
import Pruebas from './components/CuadrosTurno/Pruebas';
import CrearContrato from './components/Contratos/CrearContratos';
import ContratosTable from './components/Contratos/ContratosTable';
import CrearTurnos from './components/Turnos/CrearTurnos';
import GestionTurnos from './components/Turnos/GestionTurnos';

import { SelectorCuadroTurno } from './components/Turnos/SelectorCuadroTurno';
import { FormularioTurno } from './components/Turnos/FormularioTurno';
import { VerTurno } from './components/Turnos/VerTurno';

import ProcesosTable from './components/Administrador/Procesos/ProcesosTable';
import MacroprocesosTable from './components/Administrador/Macroprocesos/MacroprocesosTable';
import ServiciosTable from './components/Administrador/Servicios/ServiciosTable';
import ProcesosAtencionTable from './components/Administrador/ProcesosAtencion/ProcesosAtencionTable';
import PersonasTable from './components/Administrador/Personas/PersonasTable';

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


          <Route exact path="/equipos" element={<EquiposTable />} />
          <Route exact path="/crearEquipo/" element={<CrearEquipo />} />
          {/* Nueva ruta para manejar edición con parámetro ID */}
          <Route exact path="/crearEquipo/editar/:id" element={<CrearEquipo />} />
          {/* Ruta para crear desde /crearCuadro */}
          <Route exact path="crearEquipo/crear" element={<CrearEquipo />} />
          <Route exact path="/VerEquipo/:id" element={<VerEquipo />} />

          <Route exact path="/contratos" element={<ContratosTable />} />
          <Route exact path="/crearContrato/" element={<CrearContrato />} />
          {/* Nueva ruta para manejar edición con parámetro ID */}
          <Route exact path="/crearContrato/editar/:id" element={<CrearContrato />} />
          {/* Ruta para crear desde /crearCuadro */}
          <Route exact path="/crearContrato/crear" element={<CrearContrato />} />
          <Route exact path="/VerContrato/:id" element={<VerContrato />} />

          {/* <Route exact path="/turnos" element={<TurnosTable />} /> */}
          <Route exact path="/crearTurnos/" element={<CrearTurnos />} />
          {/* Nueva ruta para manejar edición con parámetro ID */}
          <Route exact path="/crearTurnos/editar/:id" element={<CrearTurnos />} />
          {/* Ruta para crear desde /crearTurnos */}
          <Route exact path="/crearTurnos/crear" element={<CrearTurnos />} />
          <Route exact path="/gestionTurnos/" element={<GestionTurnos />} />

          <Route path="/selector-cuadro-turno" element={<SelectorCuadroTurno />} />
          <Route path="/gestionar-turnos" element={<GestionTurnos />} />
          <Route path="/crear-turno" element={<FormularioTurno />} />
          <Route path="/editar-turno/:turnoId" element={<FormularioTurno />} />
          <Route path="/ver-turno/:turnoId" element={<VerTurno />} />

          <Route exact path="/procesos" element={<ProcesosTable />} />
          <Route exact path="/macroprocesos" element={<MacroprocesosTable />} />
          <Route exact path="/servicios" element={<ServiciosTable />} />
          <Route exact path="/procesosatencion" element={<ProcesosAtencionTable />} />
          <Route exact path="/personas" element={<PersonasTable />} />

        </Routes>
      </main>
    </div>
  </div>
);

export default App;