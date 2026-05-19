DBA · Servidor
Infraestructura base
Instalar PostgreSQL 16 + configurar pg_hba.conf
Crear BD serd_db con esquema y roles
Configurar conexiones remotas y pg_stat_statements
Crear usuarios: admin_dba, backend_user, readonly
Script de creación y backup automático cron
Sync: Entrega: .sql de creación DB + doc de config
Seguridad · Roles
Roles, permisos y JWT
Definir matriz de roles: ADMIN, VENDEDOR, BODEGUERO, READONLY
Crear roles en Postgres con permisos diferenciados
Diseñar estructura JWT: payload con userId, roleId, permisos
Configurar bcrypt para hashing de contraseñas
Preparar tabla AuditoriaAccesos
Sync: Requiere: BD activa de E1 (día 3)
BD · Modelo ER
Diseño y normalización
Levantamiento de entidades y relaciones completas
Diagrama ER en dbdiagram.io o draw.io
Normalización 3FN de todas las tablas
Script DDL: tablas + FK + índices
Semilla de datos de prueba (seed.sql)
Sync: Entrega: ER + DDL a E1 para implementar en día 3
Backend · Setup
Node + Express + Prisma
Inicializar proyecto Node.js con Express + TypeScript
Configurar Prisma ORM con PostgreSQL
Estructura de carpetas: routes, controllers, services, middlewares
Configurar dotenv, cors, helmet, morgan
Conectar Prisma a BD y generar cliente
Sync: Requiere: schema.prisma de E3 (día 3-4)
Frontend · Setup
React + Vite + Tailwind
Inicializar Vite + React + TypeScript
Instalar Tailwind CSS, shadcn/ui, @fontsource/poppins
Configurar react-router-dom v6
Crear layout base: sidebar, navbar, área de contenido
Pantalla de login con formulario (sin conectar aún)
Sync: Independiente — puede avanzar en paralelo
QA · Plan de pruebas
Casos de prueba y entorno
Diseñar plan maestro de pruebas funcionales
Crear casos de prueba por módulo (auth, CRUD, seguridad)
Configurar Postman collection para APIs
Preparar entorno de staging
Documentar stack técnico del proyecto
Sync: Independiente — documenta a la par
Backend · Setup — Detalle
E4 Backend
Tecnologías
Node.js 20
Express 4
Prisma 5
TypeScript
dotenv
helmet
morgan
cors
Entregables
Repo inicializado en GitHub
Conexión Prisma funcionando
README del proyecto
Sincronización
Confirma conexión con E1 y recibe schema de E3
Semana 2 — Desarrollo de módulos core
DBA · Mantenimiento
Backups y monitoreo
Implementar pg_cron para backups diarios automáticos
Script de restauración y prueba de recovery
Monitoreo con pg_stat_statements + alertas
Configurar logs de auditoría en Postgres
Documentar plan de disaster recovery
Sync: Entrega: scripts backup + restauración
Seguridad · Auth
Login y auditoría
Implementar sp_ValidarLogin con bcrypt
Middleware JWT: verificar token, extraer rol
Middleware de permisos por ruta (RBAC)
Auditoría: registrar accesos en AuditoriaAccesos
Bloqueo de cuenta a los 3 intentos fallidos
Sync: Requiere: BD activa E1 + endpoints E4
BD · SPs y vistas
Stored procedures y triggers
Crear SPs: clientes, productos, ventas, empleados, inventario
Crear trigger trg_ReducirStock en DetalleVenta
Crear vistas: vw_VentasCompletas, vw_InventarioAlerta, vw_ProductosMasVendidos
Función ROLLBACK en stock negativo
Crear índices de rendimiento en columnas de búsqueda
Sync: Requiere: BD implementada por E1
Backend · APIs
CRUD de módulos principales
Auth: POST /login, POST /logout con JWT
Clientes: CRUD completo + búsqueda
Productos + Categorías: CRUD + filtros
Inventario: GET stock, PUT actualizar stock, GET alertas
Empleados: CRUD + por departamento
Manejo global de errores y validación con Zod
Sync: Requiere: middlewares E2 + SPs de E3
Frontend · Módulos UI
Vistas de clientes, productos, inventario
Integrar Axios con interceptor JWT
Módulo Clientes: listado paginado, formulario, búsqueda
Módulo Productos: catálogo + gestión de categorías
Módulo Inventario: panel de stock + alertas visuales
Componentes reutilizables: DataTable, Modal, SearchBar, Badge
Sync: Requiere: endpoints de E4 (puede mockear con MSW)
QA · Pruebas módulos
Test de APIs y UI
Pruebas funcionales de auth (login, bloqueo, JWT)
Pruebas CRUD clientes y productos en Postman
Probar validaciones de inventario y trigger de stock
Detectar y reportar bugs en GitHub Issues
Actualizar documentación técnica con SPs
Sync: Requiere: endpoints E4 + UI E5
Semana 3 — Ventas, reportes y entrega final
DBA · Reto final
Simulación de crisis
Ejecutar prueba de restauración desde backup
Simular caída del servidor y recuperación
Afinar configuración de rendimiento final
Documentar toda la configuración en README
Preparar demo del servidor en vivo
Sync: Coordina con E6 para el reto de simulación
Seguridad · Hardening
Pruebas de penetración básica
Simular acceso no autorizado y validar bloqueo
Revisar que ninguna ruta exponga datos sin JWT
Probar inyección SQL en inputs (validación Zod)
Rotar secret del JWT y validar invalidación
Entregar informe final de seguridad
Sync: Coordinado con E6 para el reto final
BD · Reportes y ajustes
Vistas analíticas y optimización
Crear vw_ResumenVentasDiarias y vw_EmpleadosConVentas
SP de reportes: ventas por período, top productos, stock crítico
Ajustar índices según queries lentos detectados
Revisar integridad referencial completa
Actualizar seed.sql con datos representativos
Sync: Requiere feedback de E4 sobre queries lentos
Backend · Ventas y reportes
Módulo de ventas + APIs de reportes
Ventas: POST /ventas (carrito + stock), PUT /ventas/:id/anular
Detalle de venta con totales calculados
Reportes: GET /reportes/ventas, /inventario, /top-productos
Paginación y filtros por fecha/empleado
Documentar todos los endpoints con JSDoc o Swagger
Sync: Requiere: SPs de reportes de E3
Frontend · Ventas y reportes
Carrito, historial y dashboard
Módulo Ventas: carrito interactivo, paso a paso, confirmación
Historial de ventas con filtros y detalle
Módulo Empleados: listado + departamentos
Dashboard de reportes: KPIs, tabla top productos, stock crítico
Módulo Admin: gestión de usuarios del sistema
Sync: Requiere: endpoints ventas y reportes de E4
QA · Integración y docs
Pruebas E2E y documentación final
Pruebas de flujo completo: login → venta → reporte
Reto simulación: restaurar BD, bloquear usuario, corregir error
Crear manual de usuario (pantallas clave)
Crear manual técnico: arquitectura, despliegue, variables de entorno
Armar presentación final del proyecto
Sync: Requiere: sistema integrado de todos los equipos
E1 DBA
E2 Seguridad
E3 BD Diseño
E4 Backend
E5 Frontend. Quiero que luego de ver esta planificación, crees el fontend base, para que sea adpte a todo. el proyecto serà un sistema de facturacion e inventario