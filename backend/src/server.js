// backend/src/server.js
require("dotenv").config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
const cookieParser = require('cookie-parser');

// Importar rutas
const updateStockRoute = require('./routes/products/update.stock');
const registerUsers = require('./routes/users/register.users.js');
const authUsers = require('./routes/users/auth.users.js');
const disableUsers = require('./routes/users/disable.users.js');
const listCategories = require('./routes/categories/list.categories.js');
const addCategory = require('./routes/categories/add.category.js');
const editCategory = require('./routes/categories/edit.category.js');
const deleteCategory = require('./routes/categories/delete.category.js');
const listProducts = require('./routes/products/list.products.js');
const addProducts = require('./routes/products/add.products.js');
const editProducts = require('./routes/products/edit.products.js');
const deleteProducts = require('./routes/products/delete.products.js');
const listProviders = require('./routes/suppliers/list.suppliers.js');
const addProvider = require('./routes/suppliers/add.suppliers.js');
const editProvider = require('./routes/suppliers/edit.supplier.js');
const deleteProvider = require('./routes/suppliers/delete.supplier.js');
const addPurchase = require('./routes/purchases/add.purchase.js');
const listPurchases = require('./routes/purchases/list.purchases.js');
const addSales = require('./routes/sales/add.sales.js');
const listSales = require('./routes/sales/list.sales.js');
const addTaxType = require('./routes/tax_types/add.tax.type.js');
const listTaxType = require('./routes/tax_types/list.tax.type.js');
const manageRolesPermissions = require('./routes/users/roles.permissions.js');
const { authenticateToken } = require('./middleware/middleware.js');
const lowStockRoute = require('./routes/products/low.stock.products');
const inventoryHistoryRoute = require('./routes/products/inventory.history');
const listEmployees = require('./routes/employees/list.employees.js');
const addEmployee = require('./routes/employees/add.employee.js');
const editEmployee = require('./routes/employees/edit.employee.js');
const deleteEmployee = require('./routes/employees/delete.employee.js');
const reactivateEmployee = require('./routes/employees/reactivate.employee.js');
const listDepartments = require('./routes/departments/list.departments.js');
const addDepartment = require('./routes/departments/add.department.js');
const editDepartment = require('./routes/departments/edit.department.js');
const deleteDepartment = require('./routes/departments/delete.department.js');
const reactivateDepartment = require('./routes/departments/reactivate.department.js');

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS
const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// WebSocket
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

// Rutas
// User routes
app.use('/api/users', registerUsers);
app.use('/api/users', authUsers);
app.use('/api/users', disableUsers);
app.use('/api/users', authenticateToken, manageRolesPermissions);
// Employees routes
app.use('/api/employees', authenticateToken, listEmployees);
app.use('/api/employees', authenticateToken, addEmployee);
app.use('/api/employees', authenticateToken, editEmployee);
app.use('/api/employees/delete', authenticateToken, deleteEmployee);
app.use('/api/employees/reactivate', authenticateToken, reactivateEmployee);
// Departments routes
app.use('/api/departments', authenticateToken, listDepartments);
app.use('/api/departments', authenticateToken, addDepartment);
app.use('/api/departments', authenticateToken, editDepartment);
app.use('/api/departments/delete', authenticateToken, deleteDepartment);
app.use('/api/departments/reactivate', authenticateToken, reactivateDepartment);
// Category routes
app.use('/api/categories', authenticateToken, listCategories);
app.use('/api/categories', authenticateToken, addCategory);
app.use('/api/categories', authenticateToken, editCategory);
app.use('/api/categories', authenticateToken, deleteCategory);
// Product routes
app.use('/api/products', authenticateToken, listProducts);
app.use('/api/products', authenticateToken, addProducts);
app.use('/api/products', authenticateToken, editProducts);
app.use('/api/products', authenticateToken, deleteProducts);
// Supplier routes
app.use('/api/suppliers', authenticateToken, listProviders);
app.use('/api/suppliers', authenticateToken, addProvider);
app.use('/api/suppliers', authenticateToken, editProvider);
app.use('/api/suppliers', authenticateToken, deleteProvider);
// Purchase routes
app.use('/api/purchases', authenticateToken, addPurchase);
app.use('/api/purchases', authenticateToken, listPurchases);
// Sales routes
app.use('/api/sales', authenticateToken, addSales);
app.use('/api/sales', authenticateToken, listSales);
// Tax types routes
app.use('/api/tax-types', authenticateToken, addTaxType);
app.use('/api/tax-types', authenticateToken, listTaxType);
app.use('/products/stock', updateStockRoute);
app.use('/products/low-stock', lowStockRoute);
app.use('/products/history', inventoryHistoryRoute);

// Error global
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Obtener IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

const PORT = process.env.PORT || 4000;
const IP = getLocalIP();

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado:`);
    console.log(`  Local:  http://localhost:${PORT}`);
    console.log(`  Red:    http://${IP}:${PORT}`);
    console.log(`  WS:     ws://${IP}:${PORT}`);
});
