// backend/src/server.js
require("dotenv").config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());

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
// app.use('/api/auth', require('./routes/auth'));

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