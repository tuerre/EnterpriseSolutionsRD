const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');
const Decimal = require('decimal.js');

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
            // Aggregate duplicate product entries to keep the request deterministic.
            const aggregated = new Map(); // product_id -> total quantity
            for (const item of items) {
                if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
                    throw new Error("Cada artículo debe tener un 'product_id' válido y una cantidad mayor a 0.");
                }

                const productId = Number(item.product_id);
                const quantity = Number(item.quantity);
                aggregated.set(productId, (aggregated.get(productId) || 0) + quantity);
            }

            let acumuladoSubtotal = new Decimal(0);
            let acumuladoTaxes = new Decimal(0);
            const productosVerificados = [];

            const impuestoVigente = await tx.tax_types.findFirst({
                orderBy: [
                    { updated_at: 'desc' },
                    { tax_id: 'desc' }
                ],
                select: {
                    tax_id: true,
                    name: true,
                    percentage: true,
                    updated_at: true
                }
            });

            if (!impuestoVigente) {
                throw new Error('No hay tipos de impuestos registrados. Registre ITBIS antes de procesar ventas.');
            }

            const porcentajeImpuestoVigente = new Decimal(impuestoVigente.percentage.toString()).div(100);

            for (const [productId, totalQuantity] of aggregated.entries()) {
                const producto = await tx.products.findUnique({
                    where: { product_id: Number(productId) }
                });

                if (!producto || producto.is_active === false) {
                    throw new Error(`El producto con ID ${productId} no existe o no está activo.`);
                }

                if (producto.stock < Number(totalQuantity)) {
                    throw new Error(`Stock insuficiente para '${producto.product_name}'. Disponibles: ${producto.stock}.`);
                }

                const unitPrice = new Decimal(producto.sale_price.toString());
                const quantityDecimal = new Decimal(Number(totalQuantity));
                const subtotalItem = unitPrice.mul(quantityDecimal);

                const taxItem = subtotalItem.mul(porcentajeImpuestoVigente);

                acumuladoSubtotal = acumuladoSubtotal.plus(subtotalItem);
                acumuladoTaxes = acumuladoTaxes.plus(taxItem);

                productosVerificados.push({
                    product_id: producto.product_id,
                    quantity: Number(totalQuantity),
                    unit_price: unitPrice.toFixed(2)
                });
            }

            const total_final = acumuladoSubtotal.plus(acumuladoTaxes);

            const timestamp = Date.now();
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const invoice_number = `FACT-${timestamp}-${randomId}`;

            const nuevaVentaMaestro = await tx.sales.create({
                data: {
                    invoice_number: invoice_number,
                    user_id: Number(user_id),
                    subtotal: acumuladoSubtotal.toFixed(2),
                    taxes: acumuladoTaxes.toFixed(2),
                    total_final: total_final.toFixed(2),
                    payment_method: payment_method || "Efectivo"
                }
            });

            const detallesData = productosVerificados.map(item => ({
                sale_id: nuevaVentaMaestro.sale_id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            if (detallesData.length > 0) {
                await tx.sale_details.createMany({ data: detallesData });
            }

            for (const item of productosVerificados) {
                await tx.products.update({
                    where: { product_id: item.product_id },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            const detallesInsertados = await tx.sale_details.findMany({
                where: { sale_id: nuevaVentaMaestro.sale_id }
            });

			await createSystemMovement(tx, {
				module_name: 'sales',
				user_id,
				reference_id: nuevaVentaMaestro.sale_id,
				amount: total_final.toFixed(2),
				actionType: 'REGISTRAR_VENTA',
                description: `Registró la venta ${invoice_number} con ${items.length} ítems usando ITBIS ${impuestoVigente.percentage}%`
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