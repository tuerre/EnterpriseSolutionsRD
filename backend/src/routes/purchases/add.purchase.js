const express = require('express');
const prisma = require('../../prisma'); 
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');
const Decimal = require('decimal.js');

const router = express.Router();

const registrarCompra = async (req, res) => {
    const { supplier_id, items } = req.body;
    const user_id = Number(req.user?.user_id);

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            error: "Debe proporcionar un 'supplier_id' válido y un arreglo de 'items' con productos." 
        });
    }

    if (!Number.isInteger(user_id) || user_id <= 0) {
        return res.status(400).json({
            error: 'Could not determine authenticated user'
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

            if (proveedor.is_active === false) {
                throw new Error(`El proveedor con ID ${supplier_id} está desactivado y no puede recibir compras.`);
            }

            // Aggregate duplicate product entries (sum quantities per product_id)
            // Track optional unit_price overrides per product. If multiple different overrides
            // are provided for the same product, reject the request.
            const aggregated = new Map(); // product_id -> { qty, overrides: Set }
            for (const item of items) {
                if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
                    throw new Error("Cada artículo debe contener un 'product_id' y una cantidad mayor a 0.");
                }
                const pid = Number(item.product_id);
                const qty = Number(item.quantity);
                const override = item.unit_price != null ? Number(item.unit_price) : null;
                if (override != null && (!isFinite(override) || override < 0)) {
                    throw new Error(`unit_price inválido para el producto ${pid}`);
                }

                if (!aggregated.has(pid)) aggregated.set(pid, { qty: 0, overrides: new Set() });
                const entry = aggregated.get(pid);
                entry.qty += qty;
                if (override != null) entry.overrides.add(String(override));
            }

            let total_amount = new Decimal(0);
            const detallesParaInsertar = [];

            for (const [productId, aggregateValue] of aggregated.entries()) {
                const totalQty = aggregateValue.qty;
                const producto = await tx.products.findUnique({
                    where: { product_id: Number(productId) }
                });

                if (!producto) {
                    throw new Error(`El producto con ID ${productId} no existe en el catálogo.`);
                }

                if (producto.supplier_id !== Number(supplier_id)) {
                    throw new Error(`El producto ${producto.product_name} (ID ${productId}) no pertenece al proveedor ${supplier_id}.`);
                }

                if (producto.is_active === false) {
                    throw new Error(`El producto ${producto.product_name} (ID ${productId}) está desactivado y no puede comprarse.`);
                }

                // Resolve unit_price: use override if provided (single value), otherwise product.cost_price
                const overrides = Array.from(aggregateValue.overrides);
                if (overrides.length > 1) {
                    throw new Error(`Múltiples unit_price distintos proporcionados para el producto ${productId}. Unifique el precio o envíe una sola línea por producto.`);
                }

                const unitPrice = overrides.length === 1 ? new Decimal(overrides[0]) : new Decimal(producto.cost_price.toString());
                const lineTotal = unitPrice.mul(new Decimal(Number(totalQty)));
                total_amount = total_amount.plus(lineTotal);

                detallesParaInsertar.push({
                    product_id: producto.product_id,
                    quantity: Number(totalQty),
                    unit_price: unitPrice.toFixed(2)
                });
            }

            // Create purchase master with computed total
            const nuevaCompraMaestro = await tx.purchases.create({
                data: {
                    supplier_id: Number(supplier_id),
                    total_amount: total_amount.toFixed(2)
                }
            });

            // Insert details in batch
            const detallesData = detallesParaInsertar.map(d => ({
                purchase_id: nuevaCompraMaestro.purchase_id,
                product_id: d.product_id,
                quantity: d.quantity,
                unit_price: d.unit_price
            }));

            if (detallesData.length > 0) {
                await tx.purchase_details.createMany({ data: detallesData });
            }

            // Update stock atomically
            for (const d of detallesParaInsertar) {
                await tx.products.update({
                    where: { product_id: d.product_id },
                    data: { stock: { increment: d.quantity } }
                });
            }

            // Retrieve inserted details to return
            const detallesInsertados = await tx.purchase_details.findMany({
                where: { purchase_id: nuevaCompraMaestro.purchase_id }
            });

            await createSystemMovement(tx, {
                module_name: 'purchases',
                user_id,
                reference_id: nuevaCompraMaestro.purchase_id,
                amount: total_amount.toFixed(2),
                actionType: 'REGISTRAR_COMPRA',
                description: `Registró la compra ${nuevaCompraMaestro.purchase_id} del proveedor ${supplier_id} con ${items.length} ítems`
            });

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