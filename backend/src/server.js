// backend/src/server.js
require("dotenv").config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
const cookieParser = require('cookie-parser');

// Importar rutas
const registerUsers = require('./routes/users/register.users.js');
const authUsers = require('./routes/users/auth.users.js');
const disableUsers = require('./routes/users/disable.users.js');
const listCategories = require('./routes/categories/list.categories.js');
const addCategory = require('./routes/categories/add.categorie.js');
const editCategory = require('./routes/categories/edit.categorie.js');
const deleteCategory = require('./routes/categories/delete.categorie.js');
const listProducts = require('./routes/products/list.products.js');
const addProducts = require('./routes/products/add.products.js');
const editProducts = require('./routes/products/edit.products.js');
const deleteProducts = require('./routes/products/delete.products.js');
const listProviders = require('./routes/suppliers/list.suppliers.js');
const addProvider = require('./routes/suppliers/add.suppliers.js');
const editProvider = require('./routes/suppliers/edit.supplier.js');
const deleteProvider = require('./routes/suppliers/delete.supplier.js');
const { authenticateToken } = require('./middleware/middleware.js');

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
app.use('/api/users', registerUsers);
app.use('/api/users', authUsers);
app.use('/api/users', disableUsers);
app.use('/api/categories', authenticateToken, listCategories);
app.use('/api/categories', authenticateToken, addCategory);
app.use('/api/categories', authenticateToken, editCategory);
app.use('/api/categories', authenticateToken, deleteCategory);
app.use('/api/products', authenticateToken, listProducts);
app.use('/api/products', authenticateToken, addProducts);
app.use('/api/products', authenticateToken, editProducts);
app.use('/api/products', authenticateToken, deleteProducts);
app.use('/api/providers', authenticateToken, listProviders);
app.use('/api/providers', authenticateToken, addProvider);
app.use('/api/providers', authenticateToken, editProvider);
app.use('/api/providers', authenticateToken, deleteProvider);

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
