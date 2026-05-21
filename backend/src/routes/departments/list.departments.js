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

// ============ LIST DEPARTMENTS ============
const listDepartments = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'list departments');
		if (!userValidation.valid) {
			return res.status(userValidation.status).json({ error: userValidation.error });
		}

		const departments = await prisma.departments.findMany({
			include: {
				_count: {
					select: { employees: true }
				}
			},
			orderBy: { name: 'asc' }
		});

		return res.status(200).json({
			message: 'Departments listed successfully',
			data: departments
		});
	} catch (error) {
		console.error('Error listing departments:', error);
		return res.status(500).json({
			error: 'Internal server error while listing departments'
		});
	}
};

// ============ GET A DEPARTMENT BY ID ============
const getDepartment = async (req, res) => {
	try {
		const { dept_id } = req.params;
		const userValidation = await validateAuthenticatedUser(req, 'get department');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!dept_id || !Number.isInteger(Number(dept_id)) || Number(dept_id) <= 0) {
			return res.status(400).json({ error: 'Department ID is required and must be a valid number' });
		}

		const department = await prisma.departments.findUnique({
			where: { dept_id: Number(dept_id) },
			include: {
				employees: {
					select: {
						employee_id: true,
						first_name: true,
						last_name: true,
						is_active: true
					}
				}
			}
		});

		if (!department) return res.status(404).json({ error: 'The specified department does not exist' });

		return res.status(200).json({ message: 'Department retrieved successfully', department });
	} catch (error) {
		console.error('Error retrieving department:', error);
		return res.status(500).json({ error: 'Internal server error while retrieving department' });
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('departments', 'can_read'), listDepartments);
router.get('/:dept_id', requireModulePermission('departments', 'can_read'), getDepartment);

module.exports = router;
