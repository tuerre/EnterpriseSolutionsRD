const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

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

// ============ GET LOW STOCK PRODUCTS ============
const getLowStockProducts = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'list low stock products');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const products = await prisma.products.findMany({
			where: {
				is_active: true,
				stock: { lte: 5 }
			},
			orderBy: { stock: 'asc' },
			include: {
				categories: {
					select: {
						category_id: true,
						category_name: true
					}
				},
				suppliers: {
					select: {
						supplier_id: true,
						company_name: true
					}
				}
			}
		});

		return res.status(200).json({
			message: 'Low stock products retrieved successfully',
			total: products.length,
			products
		});
	} catch (error) {
		console.error('Error listing low stock products:', error);
		return res.status(500).json({ error: 'Internal server error while listing low stock products' });
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('products', 'can_read'), getLowStockProducts);

module.exports = router;
