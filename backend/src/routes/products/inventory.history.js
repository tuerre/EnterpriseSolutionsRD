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

// ============ GET INVENTORY HISTORY ============
const getInventoryHistory = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'view inventory history');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const movements = await prisma.system_movements.findMany({
			where: {
				action_type: { in: ['ENTRADA_STOCK', 'SALIDA_STOCK'] }
			},
			orderBy: { created_at: 'desc' },
			include: {
				users: {
					select: {
						user_id: true,
						username: true
					}
				},
				modules: {
					select: {
						module_id: true,
						name: true
					}
				}
			}
		});

		return res.status(200).json({
			message: 'Inventory history retrieved successfully',
			total: movements.length,
			movements
		});
	} catch (error) {
		console.error('Error retrieving inventory history:', error);
		return res.status(500).json({ error: 'Internal server error while retrieving inventory history' });
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('products', 'can_read'), getInventoryHistory);

module.exports = router;
