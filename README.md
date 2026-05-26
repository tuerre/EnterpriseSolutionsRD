SOLUCIONES EMPRESARIALES – QA Equipo de Soporte y documentación
Checklist de Documentación - Sistema Local

================================================================================
1. Infraestructura y Requisitos Técnicos
================================================================================

Requisitos de Hardware: CPU, RAM y almacenamiento (mínimo y recomendado).

  CPU:              12th Gen Intel(R) Core(TM) i7-12700  2.10 GHz
  RAM:              12.0 GB
  Almacenamiento:   1225 GB

Requisitos de Software: S.O. compatible, versiones de runtime y bases de datos.

  S.O.:                 Windows Server
  Versiones de runtime: v24.15.0
  Base de Datos:        PostgreSQL

Configuración de Red: Puertos que deben abrirse en el Firewall y diagrama de flujo de datos.

  Puertos: 5432*

  [Ver diagrama de relación de tablas en el documento PDF original - página 1]

================================================================================
2. Instalación y Despliegue (Paso a Paso)
================================================================================

Guía de Instalación: Comandos exactos para levantar el sistema y sus servicios.

General: Dirigete a la página oficial de servicios de PostgreSQL, elige tu sistema operativo y
ejecuta el archivo. Durante la instalación, se te pedirá asignar una contraseña al
superusuario (postgres) y configurar el puerto predeterminado (5432).

------------------------------------------
Windows
------------------------------------------
1. Ve a la página de Windows Installers y haz clic en "Download the installer".
2. Selecciona la versión más reciente y descarga el archivo .exe (disponible para 64 bits).
3. Ejecuta el instalador como administrador y avanza haciendo clic en "Siguiente".
4. Selecciona los componentes a instalar: PostgreSQL Server, pgAdmin (interfaz visual)
   y Command Line Tools.
5. Ingresa una contraseña segura para el superusuario postgres (guárdala bien).
6. Deja el puerto por defecto en 5432 y elige la configuración regional de tu país.
7. Omite la instalación de Stack Builder (puedes desmarcar la opción) y finaliza.

------------------------------------------
Linux (Ubuntu/Debian)
------------------------------------------
1. Abre tu terminal y actualiza los repositorios:

     sudo apt update

2. Instala el servidor y la paquetería principal:

     sudo apt install postgresql postgresql-contrib

3. El servicio se iniciará automáticamente. Para cambiar a la cuenta del administrador
   y empezar a usar la consola, ingresa:

     sudo -i -u postgres
     psql

------------------------------------------
macOS
------------------------------------------
Puedes instalarlo de forma nativa descargando la aplicación desde PostgreSQL for Mac.
Para una instalación más rápida usando la terminal, utiliza Homebrew:

     brew install postgresql@16

================================================================================
Variables de Entorno: Diccionario con el significado de cada variable de configuración.
================================================================================

General:
  Nombre_id       : Código del campo
  Nombre_name     : Nombre del campo
  Description     : Descripción breve del campo
  Is_active       : Booleano que indica si el campo está activo o no

Tabla permissions:
  can_read        : Booleano — puede ver el campo
  can_insert      : Booleano — puede insertar datos en el campo
  can_update      : Booleano — puede actualizar datos del campo
  can_delete      : Booleano — puede eliminar datos del campo

Tabla employees:
  email           : Correo del empleado
  id_card         : Cédula del empleado
  dept_id         : Departamento al que pertenece el empleado
  salary          : Salario del empleado
  created_at      : Fecha de contrato del empleado

Tabla users:
  password        : Contraseña del usuario

Tabla suppliers:
  phone           : Teléfono del proveedor
  email           : Email del proveedor
  address         : Ubicación del proveedor

Tabla tax_types:
  percentage      : Porcentaje que afectará el impuesto

Tabla products:
  cost_price      : Precio de compra del producto
  sale_price      : Precio de venta del producto
  stock           : Unidades disponibles del producto
  aisle_location  : Ubicación física del producto

Tabla system_movements:
  action_type     : Tipo de acción registrada
  amount          : Cantidad involucrada
  notes           : Notas adicionales

Tabla sales:
  invoice_number  : Número de factura
  sale_date       : Fecha de la venta
  subtotal        : Subtotal de la venta
  taxes           : Impuestos aplicados
  total_final     : Total final de la venta
  payment_method  : Método de pago

Tabla sale_details:
  quantity        : Cantidad vendida
  unit_price      : Precio unitario

Tabla purchases:
  purchase_date   : Fecha de la compra
  total_amount    : Cantidad total pagada

Tabla purchase_details:
  quantity        : Cantidad de productos comprados

================================================================================
Migración de Base de Datos: Instrucciones para crear las tablas y cargar los datos iniciales.
================================================================================

-- ============================================================================
-- UNIFIED SYSTEM - BUSINESS MANAGEMENT RD
-- Engine: PostgreSQL
-- ============================================================================
-- PostgreSQL handles databases differently. Usually, you create the DB
-- outside the script or use the following (requires being outside a transaction):
-- CREATE DATABASE business_management_rd;
-- ============================================================================

-- SECURITY AND HUMAN RESOURCES MODULE

-- 1. ROLES
CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

-- 2. SYSTEM MODULES
CREATE TABLE modules (
    module_id   SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 3. PERMISSIONS BY ROLE AND MODULE
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    role_id       INT NOT NULL,
    module_id     INT NOT NULL,
    can_read      BOOLEAN DEFAULT FALSE,
    can_insert    BOOLEAN DEFAULT FALSE,
    can_update    BOOLEAN DEFAULT FALSE,
    can_delete    BOOLEAN DEFAULT FALSE,
    CONSTRAINT FK_Permission_Role   FOREIGN KEY (role_id)   REFERENCES roles(role_id)   ON DELETE CASCADE,
    CONSTRAINT FK_Permission_Module FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Role_Module UNIQUE (role_id, module_id)
);

-- 4. DEPARTMENTS
CREATE TABLE departments (
    dept_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

-- 5. EMPLOYEES
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(120) NOT NULL UNIQUE,
    id_card     VARCHAR(20)  NOT NULL UNIQUE,  -- (Cedula)
    dept_id     INT,
    salary      DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Employee_Dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 6. USERS (Access Credentials)
CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY,
    employee_id INT NULL UNIQUE,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role_id     INT NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_User_Employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    CONSTRAINT FK_User_Role     FOREIGN KEY (role_id)     REFERENCES roles(role_id)
);

-- CATALOG AND BUSINESS MODULE

-- 9. CATEGORIES
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 10. SUPPLIERS
CREATE TABLE suppliers (
    supplier_id  SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    tax_id       VARCHAR(20) UNIQUE,  -- (RNC)
    contact_name VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(150),
    address      TEXT,
    is_active    BOOLEAN DEFAULT TRUE
);

-- 11. TAX TYPES (ITBIS)
CREATE TABLE tax_types (
    tax_id     SERIAL PRIMARY KEY,
    name       VARCHAR(50)   NOT NULL,        -- e.g., 'Standard ITBIS'
    percentage DECIMAL(5,2)  NOT NULL         -- e.g., 18.00
);

-- 12. PRODUCTS
CREATE TABLE products (
    product_id    SERIAL PRIMARY KEY,
    product_name  VARCHAR(150) NOT NULL,
    description   TEXT,
    category_id   INT NOT NULL,
    supplier_id   INT NOT NULL,
    tax_id        INT NOT NULL,
    cost_price    DECIMAL(12,2) NOT NULL,
    sale_price    DECIMAL(12,2) NOT NULL,
    stock         INT NOT NULL DEFAULT 0,
    aisle_location VARCHAR(50),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Product_Cat  FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT FK_Product_Supp FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    CONSTRAINT FK_Product_Tax  FOREIGN KEY (tax_id)      REFERENCES tax_types(tax_id)
);

-- 13. SYSTEM MOVEMENTS (Audit Log)
CREATE TABLE system_movements (
    movement_id  SERIAL PRIMARY KEY,
    module_id    INT NOT NULL,
    user_id      INT NOT NULL,
    reference_id INT,                          -- ID of affected record
    action_type  VARCHAR(50) NOT NULL,         -- e.g., 'STOCK_IN', 'SALARY_CHANGE'
    amount       DECIMAL(12,2),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes        TEXT,
    CONSTRAINT FK_Mov_Module FOREIGN KEY (module_id) REFERENCES modules(module_id),
    CONSTRAINT FK_Mov_User   FOREIGN KEY (user_id)   REFERENCES users(user_id)
);

-- 14. SALES (Header)
CREATE TABLE sales (
    sale_id        SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50)   NOT NULL UNIQUE,
    sale_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id        INT NOT NULL,
    subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxes          DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_final    DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    CONSTRAINT FK_Sale_User FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 15. SALE DETAILS
CREATE TABLE sale_details (
    detail_id  SERIAL PRIMARY KEY,
    sale_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_DetailSale_Sale    FOREIGN KEY (sale_id)    REFERENCES sales(sale_id)       ON DELETE CASCADE,
    CONSTRAINT FK_DetailSale_Product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 16. PURCHASES
CREATE TABLE purchases (
    purchase_id   SERIAL PRIMARY KEY,
    supplier_id   INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount  DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_Purchase_Supp FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- 17. PURCHASE DETAILS
CREATE TABLE purchase_details (
    detail_id   SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    CONSTRAINT FK_DetailPurch_Purch   FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    CONSTRAINT FK_DetailPurch_Product FOREIGN KEY (product_id)  REFERENCES products(product_id)
);

------------------------------------------
Prueba de Humo (Smoke Test)
------------------------------------------
Para verificar si el sistema de base de datos está bien instalado, ve a la terminal y ejecuta:

     ping [IP del servidor]

El resultado indicará cuántos paquetes fueron recibidos correctamente (terminados) y cuántos
se perdieron (fallidos).

================================================================================
3. Operaciones y Mantenimiento
================================================================================

------------------------------------------
Política de Backups
------------------------------------------
El sistema cuenta con respaldos realizados de manera semanal. Estos backups permiten
recuperar la información en caso de fallos críticos, errores del sistema o pérdida de datos.

  Frecuencia de Respaldo : Semanal
  Método de Recuperación : Restauración manual utilizando el último backup generado.

  Observaciones:
  - Actualmente no existe una política avanzada de versionado de backups.
  - No se manejan múltiples puntos de restauración históricos organizados.

------------------------------------------
Gestión de Logs
------------------------------------------
La gestión de logs y errores se realiza de manera manual. No existe actualmente un sistema
automatizado de auditoría o monitoreo de errores.

  Cuando ocurre una falla:
  1. Se revisa manualmente el sistema.
  2. Se inspeccionan los diferentes módulos y procesos.
  3. Se identifica el punto específico donde ocurre el error.
  4. Se aplica la corrección correspondiente.

  Características Actuales:
  - No existe centralización de logs.
  - No hay herramientas automáticas de seguimiento o alertas.
  - El diagnóstico depende de revisión técnica manual.

  Riesgos Detectados:
  - Mayor tiempo de respuesta ante fallos.
  - Dificultad para rastrear errores históricos.
  - Posibilidad de omitir errores menores acumulativos.

------------------------------------------
Proceso de Actualización
------------------------------------------
Actualmente el sistema no cuenta con un proceso formal o estable de actualización.
Las actualizaciones se realizan directamente sobre la versión activa del sistema, sin:
  - Generación previa de backups específicos para actualización.
  - Control de versiones estructurado.
  - Entornos de prueba antes de producción.
  - Validaciones automáticas posteriores a la actualización.

  Situación Actual:
  - Las nuevas versiones se implementan manualmente.
  - No existe un procedimiento documentado para revertir cambios.
  - Puede existir riesgo de incompatibilidades o fallos después de actualizar.

  Riesgos Detectados:
  - Pérdida de información en caso de errores.
  - Inestabilidad del sistema tras cambios importantes.
  - Mayor dificultad para identificar fallos entre versiones.

------------------------------------------
Tareas Automatizadas
------------------------------------------

  Tarea                                     | Estado
  ------------------------------------------|---------------------
  Backups automáticos semanales             | Activo
  Actualización constante con la BD         | Activo
  Servicios de conexión y funcionamiento    | Estables
  Limpieza automática de logs               | No implementado
  Auditoría automática                      | No implementado

  Funcionamiento General:
  - Las conexiones del sistema funcionan de manera estable.
  - Cada petición realizada actualiza los datos en tiempo real.
  - No se realizan procesos automáticos de limpieza o mantenimiento de registros.

  Observaciones:
  Sería recomendable implementar:
  - Auditoría automática de errores.
  - Limpieza periódica de logs.
  - Monitoreo preventivo.
  - Gestión segura de actualizaciones y versiones.

================================================================================
4. Soporte y Usuario Final
================================================================================

------------------------------------------
Manual de Usuario
------------------------------------------
Objetivo: Brindar una guía básica para que los usuarios puedan utilizar correctamente el
sistema.

  Funciones Clave del Sistema:
  - Inicio de sesión
  - Registro de usuarios
  - Gestión de datos
  - Consulta de información
  - Generación de reportes
  - Cierre de sesión

  Guía Visual (pasos):
  1. Ingresar usuario y contraseña.
  2. Acceder al panel principal.
  3. Seleccionar la opción deseada desde el menú.
  4. Guardar cambios realizados.
  5. Cerrar sesión al finalizar.

  Recomendaciones:
  - No compartir credenciales.
  - Utilizar contraseñas seguras.
  - Verificar los datos antes de guardarlos.

------------------------------------------
Control de Accesos: Tabla de roles y permisos
------------------------------------------

  Rol            | Permisos
  ---------------|----------------------------------------------------------
  Administrador  | Acceso total al sistema, gestión de usuarios y configuración
  Supervisor     | Visualización de reportes y monitoreo del sistema
  Usuario        | Acceso limitado a funciones operativas
  Invitado       | Solo visualización de información básica

  Medidas de Seguridad:
  - Autenticación mediante usuario y contraseña.
  - Restricción de accesos según roles.
  - Registro de actividad de usuarios.

------------------------------------------
Troubleshooting: Errores comunes y soluciones
------------------------------------------

  Problema              | Posible Causa                  | Solución
  ----------------------|--------------------------------|------------------------------------
  Error 500             | Fallo interno del servidor     | Reiniciar servicios y revisar logs
  Caída de Base de Datos| Servicio detenido              | Reiniciar MySQL/PostgreSQL
  Falta de permisos     | Usuario sin privilegios        | Verificar roles y permisos
  Sistema lento         | Alto consumo de recursos       | Liberar memoria y revisar procesos
  Error de conexión     | Firewall o red incorrecta      | Verificar puertos y conectividad

  Ubicación de Logs:
    /var/log/sistema/error.log
    /var/log/nginx/
    /var/log/mysql/

------------------------------------------
Plan de Recuperación ante Desastres
------------------------------------------
Objetivo: Restaurar el sistema en caso de pérdida total del servidor físico.

  Pasos de Recuperación:
  1. Instalar nuevamente el sistema operativo.
  2. Configurar red y firewall.
  3. Instalar dependencias del sistema.
  4. Restaurar archivos del sistema desde el backup.
  5. Restaurar la base de datos.
  6. Verificar variables de entorno.
  7. Iniciar servicios principales.
  8. Ejecutar pruebas de funcionamiento.

  Restauración de Base de Datos:
     mysql -u root -p sistema_db < sistema_backup.sql

  Tiempo Estimado de Recuperación:
    Recuperación parcial : 30 minutos
    Recuperación completa: 2 a 4 horas

  Recomendaciones:
  - Mantener backups actualizados.
  - Guardar copias en servidores externos.
  - Probar restauraciones periódicamente.

================================================================================
Soluciones Empresariales RD – Descripción General
================================================================================

Sistema de organización y colaboración empresarial dividido por áreas técnicas y
administrativas para la gestión eficiente de proyectos tecnológicos.

Soluciones Empresariales RD es una estructura organizativa creada para coordinar equipos de
desarrollo, administración y seguridad dentro de un entorno empresarial.

Objetivos del Proyecto:
  - Organizar equipos de trabajo.
  - Separar responsabilidades técnicas.
  - Mejorar la comunicación interna.
  - Mantener control de acceso por áreas.
  - Facilitar el desarrollo de proyectos empresariales.

================================================================================
Estructura de Equipos
================================================================================

1. GENERAL
   Canal principal de comunicación.
   Funciones: Avisos importantes, comunicación global, reglas y anuncios, coordinación general.
   Miembros: 17

2. DISEÑO DE BASE DE DATOS
   Área encargada del diseño y administración lógica de la base de datos.
   Funciones: Modelado entidad-relación, diseño de tablas, optimización de consultas,
              relaciones entre datos, integridad de información.
   Tecnologías: PostgreSQL, MySQL, SQL Server
   Miembros: 9

3. BACKEND
   Equipo encargado de la lógica del sistema y APIs.
   Funciones: Desarrollo de APIs, autenticación y autorización, procesamiento de datos,
              integración con base de datos, seguridad del servidor.
   Tecnologías: Node.js, Express, .NET, Java Spring Boot
   Miembros: 8

4. DBA (Administrador del Servidor)
   Área encargada de servidores y administración de infraestructura.
   Funciones: Gestión de servidores, monitoreo, backups, configuración de red,
              mantenimiento de infraestructura.
   Responsabilidades: Disponibilidad del sistema, seguridad del servidor, recuperación ante fallos.
   Miembros: 7

5. FRONTEND
   Equipo encargado de la interfaz visual del sistema.
   Funciones: Diseño de interfaces, experiencia de usuario, consumo de APIs,
              Responsive Design, optimización visual.
   Tecnologías: React, Vue, Angular, Tailwind CSS
   Miembros: 6

6. LÍDERES & ENCARGADOS
   Grupo administrativo encargado de supervisar y coordinar equipos.
   Funciones: Gestión de proyectos, supervisión de tareas, coordinación de equipos,
              toma de decisiones, organización empresarial.
   Miembros: 6

7. SEGURIDAD
   Área encargada de la seguridad informática y protección del sistema.
   Funciones: Control de accesos, protección de datos, auditorías, monitoreo de amenazas,
              seguridad de red.
   Herramientas: Firewalls, SIEM, Antivirus Empresarial, VPN
   Miembros: 5

================================================================================
Arquitectura Organizacional (Página 25)
================================================================================

  SOLUCIONES EMPRESARIALES RD
  Estructura Jerárquica de Equipos
  ────────────────────────────────────────────────────────────────────────────────

  NIVEL 1 – DIRECCIÓN
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        LÍDERES & ENCARGADOS                                │
  │             Dirección general, toma de decisiones y coordinación           │
  │                             6 miembros                                     │
  └──────────┬────────────┬────────────┬────────────┬──────────────────────────┘
             │            │            │            │
  NIVEL 2 – ÁREAS TÉCNICAS Y DE SEGURIDAD
             │            │            │            │
  ┌──────────▼──┐  ┌──────▼──────┐ ┌──▼──────────┐ ┌▼──────────────┐
  │  FRONTEND   │  │   BACKEND   │ │ DISEÑO DE   │ │   SEGURIDAD   │
  │             │  │             │ │   BASE DE   │ │               │
  │  Interfaces │  │  APIs y     │ │    DATOS    │ │  Control de   │
  │  y UX/UI    │  │  lógica del │ │             │ │  accesos y    │
  │             │  │  servidor   │ │  Modelado y │ │  protección   │
  │  6 miembros │  │  8 miembros │ │  BD lógica  │ │               │
  └─────────────┘  └─────────────┘ │  9 miembros │ │  5 miembros   │
                                   └─────────────┘ └───────────────┘
  NIVEL 3 – INFRAESTRUCTURA
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        DBA / ADMINISTRADOR DE SERVIDOR                     │
  │         Gestión de servidores, backups, red e infraestructura               │
  │                              7 miembros                                    │
  └─────────────────────────────────────────────────────────────────────────────┘

  ────────────────────────────────────────────────────────────────────────────────
  RESUMEN DE EQUIPOS
  ────────────────────────────────────────────────────────────────────────────────
  Área                   | Rol Principal                      | Miembros
  -----------------------|------------------------------------|----------
  Líderes & Encargados   | Dirección y coordinación           |    6
  Diseño de Base de Datos| Modelado y arquitectura de datos   |    9
  Backend                | APIs, lógica y seguridad servidor  |    8
  DBA / Servidor         | Infraestructura y mantenimiento    |    7
  Frontend               | Interfaz visual y UX               |    6
  Seguridad              | Protección y auditoría             |    5
  General (canal)        | Comunicación transversal           |   17
  ────────────────────────────────────────────────────────────────────────────────

================================================================================
FIN DEL DOCUMENTO
================================================================================
