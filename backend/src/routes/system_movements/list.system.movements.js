const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

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

const listSystemMovements = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'view system movements');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const movements = await prisma.system_movements.findMany({
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
			message: 'System movements retrieved successfully',
			total: movements.length,
			movements
		});
	} catch (error) {
		console.error('Error retrieving system movements:', error);
		return res.status(500).json({ error: 'Internal server error while retrieving system movements' });
	}
};

router.get('/list', requireModulePermission('system_movements', 'can_read'), listSystemMovements);

module.exports = router;