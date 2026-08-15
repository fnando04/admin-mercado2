# Mercado Municipal — Panel Administrativo y de Locatarios

Sistema de gestión para un mercado municipal, con dos paneles independientes: uno para **administradores** (gestión completa del mercado) y otro para **locatarios** (autogestión de su puesto, pagos e incidencias).

## Stack

- **Frontend:** React + React Router, Vite
- **Backend:** Node.js + Express
- **Base de datos:** MySQL (procedimientos almacenados para toda la lógica de negocio)
- **Autenticación:** JWT (login), sesión guardada en `localStorage`

> ⚠️ **Nota de seguridad:** por ahora no hay protección de rutas por rol (`ProtectedRoute`) ni verificación de JWT en los endpoints — cualquiera con la URL puede entrar a cualquier pantalla, y los endpoints de locatario reciben el `id_locatario` como parámetro sin validarlo contra el token. Esto se dejó pendiente a propósito para priorizar funcionalidad; **antes de un despliegue real hay que resolverlo** (ver sección "Pendientes").

---

## Estructura del proyecto

```
admin-mercado/
├── backend/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── loginController.js
│   │   ├── pagosController.js
│   │   ├── incidenciasController.js
│   │   ├── avisosController.js
│   │   ├── administradoresController.js
│   │   └── locatarioController.js
│   ├── routes/
│   │   ├── pagos.js
│   │   ├── incidenciasRoutes.js
│   │   ├── avisosRoutes.js
│   │   ├── administradoresRoutes.js
│   │   └── locatarioRoutes.js
│   └── middleware/
│       └── authMiddleware.js        (existe, aún no está en uso)
│
└── frontend/
    └── src/
        ├── components/
        │   └── Navbar.jsx            (navbar del admin)
        ├── pages/
        │   ├── Login.jsx
        │   ├── RegistrarUsuario.jsx
        │   ├── Dashboard.jsx
        │   ├── GestionLocatarios.jsx
        │   ├── GestionPuestos.jsx
        │   ├── GestionPagos.jsx
        │   ├── Incidencias.jsx
        │   ├── GestionAdmin.jsx (Administradores.jsx)
        │   ├── LocatarioLayout.jsx
        │   ├── LocatarioNavbar.jsx
        │   ├── LocatarioInicio.jsx
        │   ├── MisPagos.jsx
        │   └── MisIncidencias.jsx
        └── App.jsx
```

---

## Base de datos

Corre el scripts SQL 
---

## Backend

### Instalación

```bash
cd backend
npm install
npm run dev
```

Por defecto corre en `${API_URL}`.

### Endpoints principales

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| Login | POST | `/api/login` | Autenticación, regresa JWT + datos del usuario |
| Pagos (admin) | GET | `/api/pagos/puestos?mes=&anio=` | Estado de pago por mes |
| | GET | `/api/pagos/puestos?todos=1` | Historial completo |
| | POST | `/api/pagos` | Registrar pago de un puesto |
| | POST | `/api/pagos/generar-mes` | Generar cargos del mes para todos los locatarios asignados |
| | POST | `/api/pagos/actualizar-vencidos` | Marcar como vencidos los pagos ya pasados de fecha |
| Incidencias (admin) | GET | `/api/incidencias` | Listar todas |
| | GET | `/api/incidencias/abiertas` | Solo abiertas (para notificaciones) |
| | POST | `/api/incidencias` | Abrir una nueva |
| | POST | `/api/incidencias/responder` | Responder (pasa a "En proceso") |
| | POST | `/api/incidencias/cerrar` | Cerrar (pasa a "Resuelta") |
| Avisos (admin) | GET | `/api/avisos` | Listar vigentes |
| | POST | `/api/avisos` | Publicar nuevo |
| | PUT | `/api/avisos/:id_aviso` | Editar |
| | DELETE | `/api/avisos/:id_aviso` | Archivar (borrado suave) |
| | POST | `/api/avisos/archivar-vencidos` | Archivar automáticamente los vencidos |
| Administradores | GET | `/api/administradores` | Listar todos |
| | POST | `/api/administradores` | Registrar nuevo |
| | PUT | `/api/administradores/:id_usuario/estado` | Activar/desactivar |
| Locatario | GET | `/api/locatario/mi-info?id_locatario=` | Info del locatario logueado |
| | PUT | `/api/locatario/mi-perfil` | Editar giro comercial y contacto |
| | GET | `/api/locatario/mis-pagos?id_locatario=` | Su historial de pagos |
| | POST | `/api/locatario/pagar` | Pagar un mes eligiendo tipo de pago |
| | GET | `/api/locatario/mis-incidencias?id_locatario=` | Sus incidencias |
| | POST | `/api/locatario/incidencias` | Reportar una nueva |

---

## Frontend

### Instalación

```bash
cd frontend
npm install
npm run dev
```

### Rutas

**Públicas:**
- `/login`
- `/registro`

**Panel de administrador** (navbar de admin):
- `/dashboard`
- `/locatarios`
- `/puestos`
- `/pagos`
- `/incidencias`
- `/administradores`

**Panel de locatario** (navbar propio, sin el de admin):
- `/locatario/inicio`
- `/locatario/pagos`
- `/locatario/incidencias`

El login redirige según el `rol` que regresa el backend: `administrador` → `/dashboard`, cualquier otro rol → `/locatario/inicio`.

---

## Funcionalidades por pantalla

### Admin — Pagos
- Ver estado de pago por mes o el historial completo ("Todos los meses").
- Generar los cargos pendientes del mes para todos los locatarios asignados.
- Registrar el pago de un locatario (elige fecha, el mes queda fijo según la fila).
- Descargar un comprobante en PDF (usa el diálogo de impresión del navegador, sin dependencias extra).

### Admin — Incidencias y Avisos
- Ver, responder y cerrar incidencias de cualquier locatario.
- Registrar una incidencia a nombre de un locatario.
- Publicar avisos, editarlos inline ("Administrar Avisos") y archivarlos.
- Archivado automático de avisos vencidos al cargar la pantalla.

### Admin — Administradores
- Ver todos los administradores del sistema (activos e inactivos).
- Agregar nuevos.
- Activar/desactivar (no permite desactivar al único admin activo).

### Locatario — Inicio
- Ve su puesto, giro comercial, estado de pago del mes y datos de contacto.
- Puede editar su giro comercial, teléfono y correo.
- Ve los 3 avisos más recientes.

### Locatario — Mis pagos
- Ve su historial completo de pagos.
- Puede pagar los meses pendientes/vencidos, eligiendo tipo de pago (efectivo, transferencia, tarjeta).

### Locatario — Mis incidencias
- Ve únicamente las incidencias que él mismo reportó (no las de otros locatarios).
- Puede reportar una nueva y ver la respuesta del administrador cuando exista.

---

## Pendientes / mejoras futuras

- **Protección de rutas por rol** (`ProtectedRoute`) para que un locatario no pueda entrar a `/pagos` o `/administradores` cambiando la URL, y viceversa.
- **Verificar JWT en el backend** (ya existe `authMiddleware.js`, falta aplicarlo a las rutas) en vez de confiar en el `id_locatario`/`id_administrador` que manda el frontend.
- **PDF real desde el backend** (actualmente el comprobante se genera con el diálogo de impresión del navegador, no como archivo descargable generado en servidor).
- **Notificaciones en tiempo real** conectadas de verdad a la campanita del Navbar del admin (endpoint `/api/incidencias/abiertas` ya existe, falta conectarlo ahí).