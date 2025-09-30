# 🖥️ Sistema de Gestión de Turnos - Frontend

Una aplicación web desarrollada en **React** con **JavaScript** y **Tailwind CSS** para la interfaz de usuario del Sistema de Gestión de Turnos del Hospital Universitario San José, proporcionando una experiencia intuitiva y moderna para la administración hospitalaria.

## 📋 Descripción del Proyecto

Esta aplicación frontend proporciona una interfaz gráfica completa para la gestión de turnos hospitalarios, integrándose perfectamente con el backend Spring Boot mediante API REST. Ofrece interfaces especializadas para diferentes roles de usuario y optimiza la experiencia de administración del personal hospitalario.

### ✨ Características Principales

- 🎨 **Interfaz Moderna**: Diseño responsive con **Tailwind CSS 4.1.11** y componentes reutilizables
- 👥 **Gestión Integral de Personal**: Administración de usuarios, personas, roles y títulos académicos
- 📅 **Cuadros de Turnos Interactivos**: Vistas dinámicas de calendario con múltiples versiones
- ⏰ **Gestión Visual de Turnos**: Editor visual para asignación y modificación de turnos
- 📊 **Dashboard de Reportes**: Visualización de métricas con **Recharts** y exportación
- 🔐 **Navegación Segura**: Sistema de rutas con **React Router DOM 7.7**
- 📱 **Responsive Design**: Compatible con desktop, tablet y dispositivos móviles
- 🔔 **Sistema de Notificaciones**: Notificaciones automáticas y manuales por correo
- 🏥 **Gestión Hospitalaria**: Interfaces para estructura organizacional y procesos
- 📈 **Análisis de Datos**: Visualización de estadísticas y exportación a Excel/PDF

## 🛠️ Stack Tecnológico

### Framework Base

- **React 19.1.0** - Framework JavaScript principal
- **Vite 7.0.4** - Build tool y servidor de desarrollo ultra-rápido
- **React Router DOM 7.7.0** - Navegación SPA

### Estilos y UI

- **Tailwind CSS 4.1.11** - Framework CSS utility-first
- **@tailwindcss/vite 4.1.11** - Plugin de Vite para Tailwind
- **Lucide React 0.525.0** - Biblioteca de iconos moderna

### Manejo de Datos

- **Axios 1.10.0** - Cliente HTTP para API REST
- **date-fns 4.1.0** - Manipulación avanzada de fechas

### Exportación y Reportes

- **ExcelJS 4.4.0** - Generación de archivos Excel
- **jsPDF 3.0.1** - Generación de archivos PDF
- **jsPDF-AutoTable 5.0.2** - Tablas automatizadas en PDF
- **file-saver 2.0.5** - Descarga de archivos
- **XLSX 0.18.5** - Manipulación de hojas de cálculo

### Visualización

- **Recharts 3.1.2** - Gráficos y visualizaciones interactivas

### Herramientas de Desarrollo

- **ESLint 9.30.1** - Linting y calidad de código
- **@vitejs/plugin-react 4.6.0** - Plugin React para Vite
- **vite-plugin-svgr 4.3.0** - Importación de SVG como componentes

## 🏗️ Arquitectura del Sistema

```
turnos-front/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── components/
│   │   └── TurnosApp/
│   │       ├── Header.jsx              # Cabecera principal
│   │       ├── Sidebar.jsx             # Menú lateral
│   │       ├── CuadrosTurno/           # Gestión de cuadros
│   │       │   ├── CuadroTurnosTable.jsx
│   │       │   ├── CrearCuadro.jsx
│   │       │   ├── CrearCuadroMulti.jsx
│   │       │   ├── CrearCuadroMulti2.jsx
│   │       │   ├── CrearCuadroMulti3.jsx
│   │       │   ├── VerCuadro.jsx
│   │       │   ├── SelectorCuadroHistorial.jsx
│   │       │   ├── GestionCuadroHistoria.jsx
│   │       │   └── Pruebas.jsx
│   │       ├── Equipos/                # Gestión de equipos
│   │       │   ├── EquiposTable.jsx
│   │       │   ├── CrearEquipos.jsx
│   │       │   └── VerEquipo.jsx
│   │       ├── Contratos/              # Gestión de contratos
│   │       │   ├── ContratosTable.jsx
│   │       │   ├── CrearContratos.jsx
│   │       │   └── VerContratos.jsx
│   │       ├── Turnos/                 # Gestión de turnos
│   │       │   ├── CrearTurnos.jsx
│   │       │   ├── GestionTurnos.jsx
│   │       │   ├── SelectorCuadroTurno.jsx
│   │       │   ├── FormularioTurno.jsx
│   │       │   ├── VerTurno.jsx
│   │       │   └── Calendario/
│   │       │       └── CalendarioTurnos.jsx
│   │       ├── Administrador/          # Módulos administrativos
│   │       │   ├── Procesos/
│   │       │   │   └── ProcesosTable.jsx
│   │       │   ├── Macroprocesos/
│   │       │   │   └── MacroprocesosTable.jsx
│   │       │   ├── Servicios/
│   │       │   │   ├── ServiciosTable.jsx
│   │       │   │   └── BloqueServicioTable.jsx
│   │       │   ├── ProcesosAtencion/
│   │       │   │   └── ProcesosAtencionTable.jsx
│   │       │   ├── Personas/
│   │       │   │   ├── PersonasTable.jsx
│   │       │   │   ├── PersonasTitulosTable.jsx
│   │       │   │   ├── PersonaRolesTable.jsx
│   │       │   │   └── PersonasEquiposTable.jsx
│   │       │   ├── Secciones/
│   │       │   │   └── SeccionesTable.jsx
│   │       │   ├── Subsecciones/
│   │       │   │   └── SubseccionesTable.jsx
│   │       │   └── Titulos/
│   │       │       ├── TitulosTable.jsx
│   │       │       └── TipoFormacionTable.jsx
│   │       ├── Reportes/               # Sistema de reportes
│   │       │   └── ReportesFiltro.jsx
│   │       └── Notificaciones/         # Sistema de notificaciones
│   │           ├── GestionNotificaciones.jsx
│   │           └── NotificacionAutomatica.jsx
│   ├── data/
│   │   └── turnosData.js               # Datos de prueba
│   ├── services/                       # Servicios API
│   │   └── apiNotificacionService.js   # Servicio de notificaciones
│   ├── App.jsx                         # Componente principal
│   ├── main.jsx                        # Punto de entrada
│   └── index.css                       # Estilos globales
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js 18+**
- **npm 9+ o Yarn 1.22+**
- **Git**
- **Backend ejecutándose** en `http://localhost:8081`

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jorgeibarra87/turnos-front.git
cd turnos-front
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# Con Yarn
yarn install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8081
VITE_API_TIMEOUT=10000

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### 4. Ejecutar en Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Preview del build
npm run preview
```

### 5. Verificar Instalación

- **Aplicación**: http://localhost:5173
- **API Backend**: http://localhost:8081

## 📱 Funcionalidades por Módulo

### 🏠 Dashboard Principal (/)

- **Tabla de cuadros**: Lista principal de cuadros de turnos con filtros
- **Acciones rápidas**: Crear, editar, ver y gestionar cuadros
- **Estados visuales**: Indicadores de estado de cuadros
- **Navegación**: Acceso directo a todas las funcionalidades

### 📅 Gestión de Cuadros de Turnos

#### Rutas Principales:

- `/crearCuadro/` - Crear nuevo cuadro
- `/crearCuadro/editar/:id` - Editar cuadro existente
- `/VerCuadro/:id` - Visualizar cuadro completo
- `/selectorCuadroHistorial/` - Selector de historial
- `/gestionCuadroHistoria/:id` - Gestión del historial

#### Características:

- **Creación multi-paso**: Asistente para crear cuadros complejos
- **Versionado**: Control de versiones con historial completo
- **Multi-proceso**: Soporte para cuadros con múltiples procesos
- **Validaciones**: Verificación de datos y consistencia
- **Estados**: Gestión de estados (activo, inactivo, borrador)

### 👨‍⚕️ Gestión de Equipos

#### Rutas:

- `/equipos` - Lista de equipos
- `/crearEquipo/` - Crear equipo
- `/crearEquipo/editar/:id` - Editar equipo
- `/VerEquipo/:id` - Ver detalles del equipo

#### Funcionalidades:

- **Formación automática**: Creación de equipos por categorías
- **Gestión de miembros**: Asignación de personal especializado
- **Competencias**: Validación de títulos y especialidades
- **Historial**: Seguimiento de cambios en equipos

### 📋 Gestión de Contratos

#### Rutas:

- `/contratos` - Lista de contratos
- `/crearContrato/` - Crear contrato
- `/crearContrato/editar/:id` - Editar contrato
- `/VerContrato/:id` - Ver detalles del contrato

#### Características:

- **Tipos de contrato**: Diferentes modalidades contractuales
- **Vinculación**: Asociación con turnos y procesos
- **Estados**: Control de vigencia de contratos
- **Validaciones**: Verificación de datos laborales

### ⏰ Gestión de Turnos

#### Rutas Principales:

- `/crearTurnos/` - Crear turnos
- `/gestionTurnos/` - Gestión avanzada
- `/selector-cuadro-turno` - Selector de cuadro
- `/crear-turno` - Formulario de turno
- `/editar-turno/:turnoId` - Editar turno
- `/ver-turno/:turnoId` - Ver turno
- `/calendarioturnos` - Vista de calendario

#### Funcionalidades:

- **Calendario interactivo**: Vista mensual con navegación
- **Formularios dinámicos**: Creación y edición de turnos
- **Validaciones**: Conflictos y disponibilidad
- **Estados**: Programado, confirmado, cancelado
- **Historial**: Seguimiento completo de cambios

### 🔧 Administración del Sistema

#### Gestión de Procesos:

- `/procesos` - Procesos de atención
- `/macroprocesos` - Macro procesos hospitalarios
- `/procesosatencion` - Procesos específicos de atención

#### Gestión de Servicios:

- `/servicios` - Servicios hospitalarios
- `/bloqueservicio` - Bloques de servicio

#### Gestión de Personal:

- `/personas` - Personal del hospital
- `/personastitulos` - Títulos académicos
- `/personasroles` - Roles y permisos
- `/personasequipos` - Asignación a equipos

#### Estructura Organizacional:

- `/secciones` - Secciones hospitalarias
- `/subsecciones` - Subsecciones específicas
- `/titulos` - Títulos académicos
- `/tipoformacion` - Tipos de formación

### 📊 Reportes y Análisis

#### Ruta:

- `/reportesfiltro` - Sistema de reportes con filtros

#### Características:

- **Filtros avanzados**: Por fechas, personal, servicios
- **Visualizaciones**: Gráficos interactivos con Recharts
- **Exportación**: PDF, Excel y CSV
- **Métricas**: Indicadores de gestión hospitalaria
- **Análisis**: Tendencias y patrones de turnos

### 🔔 Sistema de Notificaciones

#### Rutas:

- `/notificaionCorreo` - Gestión de notificaciones
- `/notificacionAutomatica` - Notificaciones automáticas

#### Funcionalidades:

- **Correos automáticos**: Notificaciones por cambios en cuadros
- **Gestión manual**: Envío masivo de correos
- **Plantillas HTML**: Correos con formato profesional
- **Configuración**: Gestión de destinatarios
- **Historial**: Seguimiento de envíos

## 🔌 Integración con API

### Configuración de Axios

```javascript
// services/apiNotificacionService.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### Servicios por Módulo

```javascript
// Servicio de Notificaciones
export const notificacionesService = {
  // CRUD básico
  getAll: async () => await api.get("/notificaciones"),
  getById: async (id) => await api.get(`/notificaciones/${id}`),
  create: async (data) => await api.post("/notificaciones", data),
  update: async (id, data) => await api.put(`/notificaciones/${id}`, data),

  // Envío de notificaciones
  enviarNotificacionesAutomaticas: async (notificaciones) =>
    await api.post("/notificaciones/enviar-automaticas", notificaciones),
  enviarNotificaciones: async (notificaciones) =>
    await api.post("/notificaciones/enviar", notificaciones),

  // Utilidades
  probarCorreo: async (destinatario) =>
    await api.post(
      `/notificaciones/probar-correo?destinatario=${destinatario}`
    ),
  validarConfiguracion: async () =>
    await api.get("/notificaciones/validar-configuracion-correo"),
};
```

## 🎨 Componentes Principales

### Estructura de Rutas

```javascript
// App.jsx - Sistema de rutas principal
const App = () => (
  <div className="flex h-screen bg-primary-blue-background">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 relative">
        <Routes>
          {/* Dashboard principal */}
          <Route path="/" element={<TurnosTable />} />

          {/* Cuadros de turnos */}
          <Route path="/crearCuadro/" element={<CrearCuadro />} />
          <Route path="/crearCuadro/editar/:id" element={<CrearCuadro />} />
          <Route path="/VerCuadro/:id" element={<VerCuadro />} />

          {/* Equipos */}
          <Route path="/equipos" element={<EquiposTable />} />
          <Route path="/crearEquipo/" element={<CrearEquipo />} />
          <Route path="/VerEquipo/:id" element={<VerEquipo />} />

          {/* Turnos */}
          <Route path="/gestionTurnos/" element={<GestionTurnos />} />
          <Route path="/calendarioturnos" element={<CalendarioTurnos />} />

          {/* Administración */}
          <Route path="/personas" element={<PersonasTable />} />
          <Route path="/servicios" element={<ServiciosTable />} />

          {/* Reportes y notificaciones */}
          <Route path="/reportesfiltro" element={<ReportesFiltro />} />
          <Route
            path="/notificaionCorreo"
            element={<GestionNotificaciones />}
          />
        </Routes>
      </main>
    </div>
  </div>
);
```

### Componentes de Layout

```javascript
// components/TurnosApp/Header.jsx
const Header = () => (
  <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">
        Sistema de Gestión de Turnos
      </h1>
      <div className="flex items-center gap-4">
        {/* Notificaciones y usuario */}
      </div>
    </div>
  </header>
);

// components/TurnosApp/Sidebar.jsx
const Sidebar = () => (
  <aside className="w-64 bg-primary-blue-900 text-white">
    <nav className="mt-8">
      <Link to="/" className="block py-2 px-4 hover:bg-primary-blue-800">
        Dashboard
      </Link>
      <Link to="/equipos" className="block py-2 px-4 hover:bg-primary-blue-800">
        Equipos
      </Link>
      {/* Más enlaces de navegación */}
    </nav>
  </aside>
);
```

## 🧪 Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor en http://localhost:5173
npm run build        # Crear build de producción
npm run preview      # Preview del build
npm run lint         # Verificar calidad de código

# Gestión de dependencias
npm install          # Instalar dependencias
npm update          # Actualizar dependencias
npm audit           # Verificar vulnerabilidades
```

## 🚀 Despliegue

### Build de Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

### Variables de Entorno de Producción

```env
# Production API
VITE_API_BASE_URL=https://api.hospitalsanjose.gov.co
VITE_API_TIMEOUT=15000

# Features
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

### Configuración de Servidor

```nginx
# nginx.conf para despliegue
server {
    listen 80;
    server_name turnos.hospitalsanjose.gov.co;

    root /var/www/turnos-front/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 Guías de Uso

### Crear un Nuevo Cuadro de Turnos

1. **Navegación**: Ir a "Crear Cuadro" desde el dashboard
2. **Información básica**: Completar nombre, versión, categoría
3. **Selección de equipo**: Asignar equipo de trabajo
4. **Configuración**: Definir mes, año y procesos
5. **Validación**: Verificar datos y guardar
6. **Confirmación**: Revisar cuadro creado

### Gestionar Notificaciones

1. **Configuración**: Acceder a "Gestión de Notificaciones"
2. **Correos predeterminados**: Activar/desactivar correos permanentes
3. **Correos adicionales**: Agregar y seleccionar destinatarios
4. **Mensaje**: Completar asunto y contenido
5. **Envío**: Ejecutar envío manual o automático
6. **Seguimiento**: Verificar estado de envíos

### Generar Reportes

1. **Filtros**: Acceder a "Reportes" y definir criterios
2. **Visualización**: Revisar gráficos y métricas
3. **Exportación**: Seleccionar formato (PDF, Excel, CSV)
4. **Descarga**: Obtener archivo generado
5. **Análisis**: Interpretar datos exportados

## 🤝 Contribución y Desarrollo

### Estructura de Commits

```
feat: agregar componente de calendario de turnos
fix: corregir validación en formulario de equipos
docs: actualizar documentación de componentes
style: mejorar diseño responsive del dashboard
refactor: optimizar servicios de API
```

### Flujo de Desarrollo

1. **Fork** del repositorio
2. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollo** con componentes reutilizables
4. **Testing**: Verificar funcionalidad
5. **Linting**: `npm run lint`
6. **Build**: `npm run build`
7. **Commit** y **Pull Request**

## 📞 Información del Proyecto

### Detalles Técnicos

- **Nombre del Proyecto**: turnos-front
- **Versión**: 0.0.0
- **Tipo**: Módulo ES6
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Estilos**: Tailwind CSS 4.1.11

### Contacto

- **Desarrollador**: Jorge Ibarra
- **Email**: jorgeibarra87@gmail.com
- **Hospital**: Hospital Universitario San José
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:8081

### URLs de Desarrollo

- **Aplicación**: http://localhost:5173
- **API Backend**: http://localhost:8081
- **Documentación API**: http://localhost:8081/swagger-ui.html

## 📄 Información Legal

Este frontend complementa el **Sistema de Gestión de Turnos** del Hospital Universitario San José, proporcionando una interfaz moderna, responsiva y eficiente para la administración del talento humano en salud.

**Versión**: 0.0.0
**Última Actualización**: 2025
**Licencia**: Propiedad del Hospital Universitario San José
**Stack**: React + JavaScript + Tailwind CSS + Vite

---

**Hospital Universitario San José** - Sistema de Gestión de Turnos (Frontend)
_Interfaz moderna para la gestión eficiente del talento humano en salud_
