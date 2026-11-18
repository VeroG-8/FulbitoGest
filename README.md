# ⚽ FulbitoGest

### Sistema integral de gestión para escuelas de fútbol

FulbitoGest es una aplicación web desarrollada para facilitar la administración de una escuela de fútbol, centralizando la información deportiva, administrativa y económica en una única plataforma.

El sistema busca reemplazar los registros manuales y las planillas dispersas, permitiendo organizar la información de jugadores, tutores, profesores, categorías, equipos, torneos, cuotas y demás actividades de la institución.

---
## 📂 Repositorio

**Código fuente:** https://github.com/VeroG-8/FulbitoGest

## 📌 Características principales

### 👥 Gestión de personas
- Administración de jugadores.
- Registro y gestión de tutores.
- Asociación de jugadores con sus tutores.
- Administración de profesores.
- Consulta y actualización de fichas personales.
- Gestión de usuarios y estados de las cuentas.

### ⚽ Gestión deportiva
- Administración de categorías.
- Gestión de equipos.
- Organización de torneos.
- Inscripción de jugadores y equipos a torneos.
- Administración de horarios de entrenamiento.

### 🏟️ Gestión de instalaciones
- Administración de clubes.
- Gestión de predios.
- Administración de canchas.

### 💰 Gestión económica
- Administración de cuotas.
- Asignación y seguimiento de cuotas por jugador.
- Consulta de pagos.
- Gestión de pagos relacionados con inscripciones a torneos.

### 🎫 Carnets
- Generación y administración de carnets.
- Generación de códigos QR.
- Consulta pública de carnets mediante código QR.

### 📊 Dashboard y reportes
- Panel principal con información del sistema.
- Consulta de reportes.
- Exportación de información.
- Generación de reportes en PDF.

---

## 🔐 Roles y permisos

El sistema cuenta con distintos perfiles de usuario, con acceso a funcionalidades según sus responsabilidades.

| Rol | Descripción |
|---|---|
| Superadministrador | Acceso administrativo con privilegios superiores. |
| Administrador | Gestión de los módulos y recursos administrativos. |
| Profesor | Acceso a la información correspondiente a sus funciones y a su ficha personal. |
| Tutor | Consulta de información relacionada con sus jugadores, cuotas e inscripciones. |

Las rutas están protegidas mediante autenticación, verificación de correo electrónico y middleware de control de roles.

Las cuentas de usuario son gestionadas desde el sistema; no se habilita el registro público de usuarios.

---

## 🛠️ Tecnologías utilizadas

### Backend
- PHP 8.3
- Laravel 13
- MySQL
- Laravel Sanctum
- Laravel Breeze
- Inertia.js
- Laravel DomPDF
- Laravel Excel

### Frontend
- React 19
- TypeScript
- Inertia.js
- Vite
- Tailwind CSS
- Headless UI
- Lucide React
- FullCalendar
- React QR Code

---

## 📋 Requisitos previos

Para instalar y ejecutar el proyecto se necesita:

- PHP 8.3 o superior.
- Composer.
- Node.js 22 o superior.
- npm.
- MySQL.
- Un servidor local o entorno compatible con Laravel.

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/VeroG-8/FulbitoGest.git
```

Ingresar al directorio del proyecto:

```bash
cd FulbitoGest
```

### 2. Instalar dependencias de PHP

```bash
composer install
```

### 3. Configurar el archivo de entorno

Crear el archivo `.env` a partir del archivo de ejemplo:

```bash
cp .env.example .env
```

Generar la clave de aplicación:

```bash
php artisan key:generate
```

### 4. Configurar la base de datos

Crear una base de datos MySQL para el proyecto.

Luego, configurar en el archivo `.env` los datos de conexión:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fulbitogest
DB_USERNAME=root
DB_PASSWORD=
```

Modificar los valores según la configuración local de MySQL.

### 5. Ejecutar las migraciones y los seeders

```bash
php artisan migrate --seed
```

Este comando crea las tablas de la base de datos y ejecuta los seeders definidos en `DatabaseSeeder.php`, que incorporan datos iniciales y de prueba.

**Importante:** ejecutar este paso sobre una base de datos nueva o preparada para la carga de datos de prueba.

### 6. Instalar dependencias de JavaScript

```bash
npm install
```

### 7. Ejecutar el proyecto

Iniciar el servidor de Laravel:

```bash
php artisan serve --port=8001
```

En otra terminal, iniciar Vite:

```bash
npm run dev
```

Abrir la aplicación en el navegador:

```text
http://localhost:8001
```

---

## 🏗️ Estructura del proyecto

La estructura principal del proyecto está organizada de la siguiente manera:

```text
FulbitoGest/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   └── Models/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   └── Pages/
│   └── css/
│
├── routes/
│   ├── auth.php
│   ├── jugadores.php
│   ├── tutores.php
│   ├── profesores.php
│   ├── categorias.php
│   ├── equipos.php
│   ├── torneos.php
│   ├── cuotas.php
│   ├── horarios.php
│   ├── canchas.php
│   ├── predios.php
│   ├── clubes.php
│   ├── carnets.php
│   ├── reportes.php
│   ├── usuarios.php
│   └── web.php
│
├── public/
├── storage/
├── tests/
├── composer.json
├── package.json
└── README.md
```

---

## 🧪 Pruebas

Para ejecutar las pruebas automatizadas del proyecto:

```bash
php artisan test
```

El proyecto utiliza Pest como herramienta de testing.

---

## 🔒 Seguridad

- Autenticación de usuarios.
- Verificación de correo electrónico.
- Protección de rutas mediante middleware.
- Control de acceso según roles.
- Validación de operaciones desde el backend.
- Gestión de sesiones y contraseñas.

---

## 📌 Estado del proyecto

FulbitoGest se encuentra en desarrollo como proyecto final de la Tecnicatura Universitaria en Programación.

Su objetivo es ofrecer una solución integral para mejorar la organización, el seguimiento y la administración de una escuela de fútbol.

---

## 👩‍💻 Autora

**Verónica Anahí Guaymás**

Proyecto desarrollado en el marco de la asignatura Programación de Aplicaciones Web (PAW).