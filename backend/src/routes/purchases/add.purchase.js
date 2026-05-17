const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

const registrarCompra = async (req, res) => {
    const { supplier_id, items } = req.body;

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            error: "Debe proporcionar un 'supplier_id' válido y un arreglo de 'items' con productos." 
        });
    }

    try {
        const resultadoTransaccion = await prisma.$transaction(async (tx) => {
            
            const proveedor = await tx.suppliers.findUnique({
                where: { supplier_id: Number(supplier_id) }
            });

            if (!proveedor) {
                throw new Error(`El proveedor con ID ${supplier_id} no existe en el sistema.`);
            }

            let total_amount = 0;
            const productosVerificados = [];

            for (const item of items) {
                if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
                    throw new Error("Cada artículo debe contener un 'product_id' y una cantidad mayor a 0.");
                }

                const producto = await tx.products.findUnique({
                    where: { product_id: Number(item.product_id) }
                });

                if (!producto) {
                    throw new Error(`El producto con ID ${item.product_id} no existe en el catálogo.`);
                }

                const subtotalItem = Number(item.quantity) * Number(producto.cost_price);
                total_amount += subtotalItem;

                productosVerificados.push({
                    product_id: producto.product_id,
                    quantity: Number(item.quantity),
                    stockActual: producto.stock
                });
            }

            const nuevaCompraMaestro = await tx.purchases.create({
                data: {
                    supplier_id: Number(supplier_id),
                    total_amount: total_amount
                }
            });

            const detallesInsertados = [];
            for (const item of productosVerificados) {
                
                const detalle = await tx.purchase_details.create({
                    data: {
                        purchase_id: nuevaCompraMaestro.purchase_id,
                        product_id: item.product_id,
                        quantity: item.quantity
                    }
                });
                detallesInsertados.push(detalle);

                await tx.products.update({
                    where: { product_id: item.product_id },
                    data: {
                        stock: item.stockActual + item.quantity
                    }
                });
            }

            return {
                compra: nuevaCompraMaestro,
                detalles: detallesInsertados
            };
        });

        return res.status(201).json({
            message: "Compra y detalles de abastecimiento registrados con éxito. Inventario actualizado.",
            data: resultadoTransaccion
        });

    } catch (error) {
        console.error("Error al registrar la compra:", error.message);

        if (error.message.includes("no existe") || error.message.includes("mayor a 0") || error.message.includes("catálogo")) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({ 
            error: "Error interno en el servidor al procesar el maestro-detalle de la compra." 
        });
    }
};

router.post('/add', requireModulePermission('purchases', 'can_insert'), registrarCompra);

module.exports = router;