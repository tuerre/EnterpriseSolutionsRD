const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

const registrarVenta = async (req, res) => {
    const { payment_method, items } = req.body;
    
    const user_id = Number(req.user?.user_id);

    if (!Number.isInteger(user_id) || user_id <= 0) {
        return res.status(401).json({ error: "No se pudo identificar al usuario que procesa la venta." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Debe proporcionar una lista de 'items' para facturar." });
    }

    try {
        const resultadoTransaccion = await prisma.$transaction(async (tx) => {
            
            let acumuladoSubtotal = 0;
            let acumuladoTaxes = 0;
            const productosVerificados = [];

            for (const item of items) {
                if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
                    throw new Error("Cada artículo debe tener un 'product_id' válido y una cantidad mayor a 0.");
                }

                const producto = await tx.products.findUnique({
                    where: { product_id: Number(item.product_id) },
                    include: { tax_types: true } 
                });

                if (!producto || !producto.is_active) {
                    throw new Error(`El producto con ID ${item.product_id} no existe o no está activo.`);
                }

                if (producto.stock < Number(item.quantity)) {
                    throw new Error(`Stock insuficiente para '${producto.product_name}'. Disponibles: ${producto.stock}.`);
                }

                const precioUnidad = Number(producto.sale_price);
                const subtotalItem = precioUnidad * Number(item.quantity);
                
                const porcentajeImpuesto = producto.tax_types ? Number(producto.tax_types.percentage) / 100 : 0;
                const taxItem = subtotalItem * porcentajeImpuesto;

                acumuladoSubtotal += subtotalItem;
                acumuladoTaxes += taxItem;

                productosVerificados.push({
                    product_id: producto.product_id,
                    quantity: Number(item.quantity),
                    unit_price: precioUnidad,
                    stockActual: producto.stock
                });
            }

            const total_final = acumuladoSubtotal + acumuladoTaxes;

            const timestamp = Date.now();
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const invoice_number = `FACT-${timestamp}-${randomId}`;

            const nuevaVentaMaestro = await tx.sales.create({
                data: {
                    invoice_number: invoice_number,
                    user_id: Number(user_id),
                    subtotal: acumuladoSubtotal,
                    taxes: acumuladoTaxes,
                    total_final: total_final,
                    payment_method: payment_method || "Efectivo"
                }
            });

            const detallesInsertados = [];
            for (const item of productosVerificados) {
                
                const detalle = await tx.sale_details.create({
                    data: {
                        sale_id: nuevaVentaMaestro.sale_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price
                    }
                });
                detallesInsertados.push(detalle);

                await tx.products.update({
                    where: { product_id: item.product_id },
                    data: {
                        stock: item.stockActual - item.quantity
                    }
                });
            }

			await createSystemMovement(tx, {
				module_name: 'sales',
				user_id,
				reference_id: nuevaVentaMaestro.sale_id,
				amount: total_final,
				actionType: 'REGISTRAR_VENTA',
				description: `Registró la venta ${invoice_number} con ${items.length} ítems`
			});

            return {
                factura: nuevaVentaMaestro,
                detalles: detallesInsertados
            };
        });

        return res.status(201).json({
            message: "Venta procesada con éxito y stock actualizado.",
            data: resultadoTransaccion
        });

    } catch (error) {
        console.error("Error al procesar la venta:", error.message);

        if (
            error.message.includes("existe") || 
            error.message.includes("mayor a 0") || 
            error.message.includes("insuficiente")
        ) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({ 
            error: "Error interno del servidor al intentar registrar el maestro-detalle de la venta." 
        });
    }
};

router.post('/add', requireModulePermission('sales', 'can_insert'), registrarVenta);

module.exports = router;