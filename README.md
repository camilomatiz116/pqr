# Sistema de Gestión de Formato PQRS y Solicitudes de Garantía

Sistema integral web para la radicación, seguimiento, aprobación y generación de formatos PDF/impresión de PQRS y solicitudes de garantía.

## 🚀 Estructura del Proyecto

```text
├── backend/                  # Servidor API Node.js / Express
│   ├── db.js                 # Base de datos SQLite y esquema
│   ├── server.js             # Endpoints REST y autenticación
│   └── package.json
├── frontend/                 # Aplicación cliente React + Vite
│   ├── src/
│   │   ├── components/       # Formularios, Dashboard, Aprobaciones, Vistas de impresión
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── setup_server.py           # Script de configuración y despliegue local
├── deploy_pqr.py             # Script automatizado de despliegue en servidor
└── README.md
```

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- npm o yarn
- Python 3 (opcional, para scripts de despliegue automático)

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd "formato de pqr"
```

### 2. Configuración del Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```
*El backend se ejecutará en `http://localhost:5000`.*

### 3. Configuración del Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*El frontend se ejecutará en `http://localhost:5173`.*

## 🌟 Características Principales

- **Radicación de PQRS:** Captura completa de datos del cliente, producto, descripción de no conformidad y firmas.
- **Panel de Aprobación y Auditoría:** Flujo de firmas de responsables y estado de la solicitud.
- **Vista de Impresión Oficial:** Formato estandarizado listo para imprimir o exportar a PDF idéntico al formato institucional.
- **Integración y Despliegue:** Scripts listos para sincronización y despliegue rápido.
