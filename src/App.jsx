import Header from './components/TurnosApp/Header';
import Sidebar from './components/TurnosApp/Sidebar';
import TurnosTable from './components/TurnosApp/CuadrosTurno/CuadroTurnosTable';
import { turnosData } from './data/turnosData';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CrearCuadro from './components/TurnosApp/CuadrosTurno/CrearCuadro';
/* import CrearCuadro2 from './components/TurnosApp/CuadrosTurno/CrearCuadro2';
import CrearCuadro3 from './components/TurnosApp/CuadrosTurno/CrearCuadro3';
import CrearCuadro4 from './components/TurnosApp/CuadrosTurno/CrearCuadro4'; */
import VerCuadro from './components/TurnosApp/CuadrosTurno/VerCuadro';
import CrearCuadroMulti from './components/TurnosApp/CuadrosTurno/CrearCuadroMulti';
import CrearCuadroMulti2 from './components/TurnosApp/CuadrosTurno/CrearCuadroMulti2';
import CrearCuadroMulti3 from './components/TurnosApp/CuadrosTurno/CrearCuadroMulti3';
import { SelectorCuadroHistorial } from './components/TurnosApp/CuadrosTurno/SelectorCuadroHistorial';
import CrearEquipo from './components/TurnosApp/Equipos/CrearEquipos';
import EquiposTable from './components/TurnosApp/Equipos/EquiposTable';
import VerEquipo from './components/TurnosApp/Equipos/VerEquipo';
import VerContrato from './components/TurnosApp/Contratos/VerContratos';
import Pruebas from './components/TurnosApp/CuadrosTurno/Pruebas';
import CrearContrato from './components/TurnosApp/Contratos/CrearContratos';
import ContratosTable from './components/TurnosApp/Contratos/ContratosTable';
import CrearTurnos from './components/TurnosApp/Turnos/CrearTurnos';
import GestionTurnos from './components/TurnosApp/Turnos/GestionTurnos';

import { SelectorCuadroTurno } from './components/TurnosApp/Turnos/SelectorCuadroTurno';
import { FormularioTurno } from './components/TurnosApp/Turnos/FormularioTurno';
import { VerTurno } from './components/TurnosApp/Turnos/VerTurno';

import ProcesosTable from './components/TurnosApp/Administrador/Procesos/ProcesosTable';
import MacroprocesosTable from './components/TurnosApp/Administrador/Macroprocesos/MacroprocesosTable';
import ServiciosTable from './components/TurnosApp/Administrador/Servicios/ServiciosTable';
import ProcesosAtencionTable from './components/TurnosApp/Administrador/ProcesosAtencion/ProcesosAtencionTable';
import PersonasTable from './components/TurnosApp/Administrador/Personas/PersonasTable';
import SeccionesTable from './components/TurnosApp/Administrador/Secciones/SeccionesTable';
import SubseccionesTable from './components/TurnosApp/Administrador/Subsecciones/SubseccionesTable';
import TitulosTable from './components/TurnosApp/Administrador/Titulos/TitulosTable';
import TipoFormacionTable from './components/TurnosApp/Administrador/Titulos/TipoFormacionTable';
import BloqueServicioTable from './components/TurnosApp/Administrador/Servicios/BloqueServicioTable';
import CalendarioTurnos from './components/TurnosApp/Turnos/Calendario/CalendarioTurnos';
import PersonasTitulosTable from './components/TurnosApp/Administrador/Personas/PersonasTitulosTable';
import PersonasRolesTable from './components/TurnosApp/Administrador/Personas/PersonaRolesTable';
import PersonasEquiposTable from './components/TurnosApp/Administrador/Personas/PersonasEquiposTable';
import ReportesFiltro from './components/TurnosApp/Reportes/ReportesFiltro';
import GestionCuadroHistoria from './components/TurnosApp/CuadrosTurno/GestionCuadroHistoria';
import GestionNotificaciones from './components/TurnosApp/Notificaciones/GestionNotificaciones';
import NotificacionAutomatica from './components/TurnosApp/Notificaciones/NotificacionAutomatica';

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

          {/* <Route exact path="/crearCuadro2/" element={<CrearCuadro2 />} />
          <Route exact path="/crearCuadro3/" element={<CrearCuadro3 />} />
          <Route exact path="/crearCuadro4/" element={<CrearCuadro4 />} /> */}
          <Route exact path="/CrearCuadroMulti/" element={<CrearCuadroMulti />} />
          <Route exact path="/CrearCuadroMulti2/" element={<CrearCuadroMulti2 />} />
          <Route exact path="/CrearCuadroMulti3/" element={<CrearCuadroMulti3 />} />
          <Route exact path="/selectorCuadroHistorial/" element={<SelectorCuadroHistorial />} />
          <Route exact path="/gestionCuadroHistoria/:id" element={<GestionCuadroHistoria />} />
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
          <Route exact path="/personastitulos" element={<PersonasTitulosTable />} />
          <Route exact path="/personasroles" element={<PersonasRolesTable />} />
          <Route exact path="/personasequipos" element={<PersonasEquiposTable />} />
          <Route exact path="/secciones" element={<SeccionesTable />} />
          <Route exact path="/subsecciones" element={<SubseccionesTable />} />
          <Route exact path="/titulos" element={<TitulosTable />} />
          <Route exact path="/tipoformacion" element={<TipoFormacionTable />} />
          <Route exact path="/bloqueservicio" element={<BloqueServicioTable />} />
          <Route exact path="/calendarioturnos" element={<CalendarioTurnos />} />
          <Route exact path="/reportesfiltro" element={<ReportesFiltro />} />
          <Route exact path="/notificaionCorreo" element={<GestionNotificaciones />} />
          <Route exact path="/notificacionAutomatica" element={<NotificacionAutomatica />} />

        </Routes>
      </main>
    </div>
  </div>
);

export default App;