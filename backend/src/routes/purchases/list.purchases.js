const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

const listarCompras = async (req, res) => {
    try {
        const compras = await prisma.purchases.findMany({
            include: {
                suppliers: {
                    select: {
                        supplier_id: true,
                        company_name: true, 
                        tax_id: true        
                    }
                },
                purchase_details: {
                    include: {
                        products: {
                            select: {
                                product_id: true,
                                product_name: true, 
                                cost_price: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                purchase_id: 'desc'
            }
        });

        if (compras.length === 0) {
            return res.status(200).json({
                message: "No se encontraron registros de compras en el sistema.",
                data: []
            });
        }

        return res.status(200).json({
            message: "Historial de compras obtenido exitosamente.",
            count: compras.length,
            data: compras
        });

    } catch (error) {
        console.error("Error al listar las compras:", error.message);
        return res.status(500).json({ 
            error: "Error interno del servidor al obtener el listado maestro-detalle de compras." 
        });
    }
};

router.get('/list', requireModulePermission('purchases', 'can_read'), listarCompras);

module.exports = router;