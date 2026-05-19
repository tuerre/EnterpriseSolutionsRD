const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ UPDATE PRODUCT STOCK ============
const actualizarStock = async (req, res) => {
	try {

		const { product_id, quantity, type, notes } = req.body;

		const user_id = Number(req.user?.user_id);

		// ============ VALIDATE AUTHENTICATED USER ============
		if (!Number.isInteger(user_id) || user_id <= 0) {
			return res.status(400).json({
				error: 'Could not determine authenticated user'
			});
		}

		const usuarioAutenticado = await prisma.users.findUnique({
			where: { user_id },
			select: {
				user_id: true,
				is_active: true
			}
		});

		if (!usuarioAutenticado) {
			return res.status(401).json({
				error: 'Session is no longer valid'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ VALIDATE PRODUCT ============
		if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
			return res.status(400).json({
				error: 'Product ID is required and must be valid'
			});
		}

		// ============ VALIDATE QUANTITY ============
		if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
			return res.status(400).json({
				error: 'Quantity must be greater than 0'
			});
		}

		// ============ VALIDATE TYPE ============
		if (!type || !['IN', 'OUT'].includes(type)) {
			return res.status(400).json({
				error: 'Type must be IN or OUT'
			});
		}

		// ============ VERIFY PRODUCT EXISTS ============
		const productoExistente = await prisma.products.findUnique({
			where: {
				product_id: Number(product_id)
			},
			select: {
				product_id: true,
				product_name: true,
				stock: true,
				is_active: true
			}
		});

		if (!productoExistente) {
			return res.status(404).json({
				error: 'Product not found'
			});
		}

		if (productoExistente.is_active === false) {
			return res.status(400).json({
				error: 'Cannot modify inactive product'
			});
		}

		// ============ CALCULATE STOCK ============
		let nuevoStock = productoExistente.stock;

		if (type === 'IN') {

			nuevoStock += Number(quantity);

		} else {

			if (productoExistente.stock < Number(quantity)) {
				return res.status(400).json({
					error: 'Insufficient stock'
				});
			}

			nuevoStock -= Number(quantity);
		}

		// ============ TRANSACTION ============
		const resultado = await prisma.$transaction(async (tx) => {

			const productoActualizado = await tx.products.update({
				where: {
					product_id: Number(product_id)
				},
				data: {
					stock: nuevoStock
				}
			});

			const movimiento = await tx.system_movements.create({
				data: {
					module_id: 1,
					user_id,
					reference_id: Number(product_id),
					action_type: type === 'IN'
						? 'STOCK_IN'
						: 'STOCK_OUT',
					amount: Number(quantity),
					notes: notes ? notes.trim() : null
				}
			});

			return {
				productoActualizado,
				movimiento
			};

		});

		return res.status(200).json({
			message: `Stock ${type === 'IN' ? 'increased' : 'reduced'} successfully`,
			product: resultado.productoActualizado,
			movement: resultado.movimiento
		});

	} catch (error) {

		console.error('Error updating stock:', error);

		return res.status(500).json({
			error: 'Internal server error while updating stock'
		});

	}
};

// ============ ROUTES ============
router.patch(
	'/',
	requireModulePermission('products', 'can_update'),
	actualizarStock
);

module.exports = router;