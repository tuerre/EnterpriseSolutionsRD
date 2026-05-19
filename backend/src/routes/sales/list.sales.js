const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

const listarVentas = async (req, res) => {
    try {
        const ventas = await prisma.sales.findMany({
            include: {
                users: {
                    select: {
                        user_id: true,
                        username: true
                    }
                },
                sale_details: {
                    include: {
                        products: {
                            select: {
                                product_id: true,
                                product_name: true,
                                sale_price: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                sale_id: 'desc'
            }
        });

        if (ventas.length === 0) {
            return res.status(200).json({
                message: "No se encontraron registros de ventas en el sistema.",
                data: []
            });
        }

        return res.status(200).json({
            message: "Historial de ventas obtenido exitosamente.",
            count: ventas.length,
            data: ventas
        });

    } catch (error) {
        console.error("Error al listar las ventas:", error.message);
        return res.status(500).json({ 
            error: "Error interno del servidor al obtener el listado maestro-detalle de ventas." 
        });
    }
};

router.get('/list', requireModulePermission('sales', 'can_read'), listarVentas);

module.exports = router;