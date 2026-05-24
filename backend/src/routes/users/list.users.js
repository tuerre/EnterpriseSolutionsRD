const { Router } = require('express');
const prisma = require('../../prisma');
const { authenticateToken, requireModulePermission } = require('../../middleware/middleware');

const router = Router();

router.get('/', authenticateToken, requireModulePermission('users', 'can_read'), async (req, res) => {
	try {
		const users = await prisma.users.findMany({
			orderBy: { user_id: 'asc' },
			select: {
				user_id: true,
				username: true,
				is_active: true,
				created_at: true,
				employees: {
					select: {
						employee_id: true,
						first_name: true,
						last_name: true,
					},
				},
				roles: {
					select: {
						role_id: true,
						role_name: true,
					},
				},
			}
		});

		return res.status(200).json({
			users: users.map((item) => ({
				user_id: item.user_id,
				username: item.username,
				is_active: item.is_active,
				created_at: item.created_at,
				employee: item.employees,
				role: item.roles,
			}))
		});
	} catch (error) {
		console.error('Error listing users:', error.message);
		return res.status(500).json({ error: 'Internal server error while listing users' });
	}
});

module.exports = router;