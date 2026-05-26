const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

// ============ HELPER FUNCTION TO VALIDATE AUTHENTICATED USER ============
const validateAuthenticatedUser = async (req, context) => {
	const user_id = Number(req.user?.user_id);

	if (!Number.isInteger(user_id) || user_id <= 0) {
		return { valid: false, status: 400, error: 'Could not determine authenticated user' };
	}

	const usuarioAutenticado = await prisma.users.findUnique({
		where: { user_id },
		select: { user_id: true, is_active: true }
	});

	if (!usuarioAutenticado) {
		return { valid: false, status: 401, error: `Session is no longer valid. Please log in again${context ? ' to ' + context : ''}.` };
	}

	if (usuarioAutenticado.is_active === false) {
		return { valid: false, status: 403, error: 'Authenticated user is inactive' };
	}

	return { valid: true };
};

// ============ UPDATE PRODUCT STOCK ============
const updateStock = async (req, res) => {
	try {
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'update stock');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const { product_id, quantity, type, notes } = req.body;

		if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
			return res.status(400).json({ error: 'Product ID is required and must be a valid number' });
		}

		if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
			return res.status(400).json({ error: 'Quantity must be a positive integer' });
		}

		if (!type || !['IN', 'OUT'].includes(type)) {
			return res.status(400).json({ error: 'Type must be IN or OUT' });
		}

		const existingProduct = await prisma.products.findUnique({
			where: { product_id: Number(product_id) },
			select: { product_id: true, product_name: true, stock: true, is_active: true }
		});

		if (!existingProduct) {
			return res.status(404).json({ error: 'Product not found' });
		}

		if (existingProduct.is_active === false) {
			return res.status(400).json({ error: 'Cannot modify stock of an inactive product' });
		}

		const newStock = type === 'IN'
			? existingProduct.stock + Number(quantity)
			: existingProduct.stock - Number(quantity);

		if (newStock < 0) {
			return res.status(400).json({ error: 'Insufficient stock' });
		}

		const result = await prisma.$transaction(async (tx) => {
			const updatedProduct = await tx.products.update({
				where: { product_id: Number(product_id) },
				data: { stock: newStock }
			});

			const movement = await createSystemMovement(tx, {
				module_name: 'products',
				user_id,
				reference_id: Number(product_id),
				actionType: type === 'IN' ? 'ENTRADA_STOCK' : 'SALIDA_STOCK',
				amount: Number(quantity),
				description: notes ? notes.trim() : `Ajustó stock del producto ${updatedProduct.product_name}`
			});

			return { updatedProduct, movement };
		});

		return res.status(200).json({
			message: `Stock ${type === 'IN' ? 'increased' : 'reduced'} successfully`,
			product: result.updatedProduct,
			movement: result.movement
		});
	} catch (error) {
		console.error('Error updating stock:', error);
		return res.status(500).json({ error: 'Internal server error while updating stock' });
	}
};

// ============ ROUTES ============
router.patch('/', requireModulePermission('products', 'can_update'), updateStock);

module.exports = router;
