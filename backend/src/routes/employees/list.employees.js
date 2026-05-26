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

// ============ LIST EMPLOYEES ============
const listEmployees = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'list employees');
		if (!userValidation.valid) {
			return res.status(userValidation.status).json({ error: userValidation.error });
		}

		const employees = await prisma.employees.findMany({
			include: {
				departments: {
					select: {
						dept_id: true,
						name: true
					}
				}
			},
			orderBy: { first_name: 'asc' }
		});

		return res.status(200).json({
			message: 'Employees listed successfully',
			data: employees
		});
	} catch (error) {
		console.error('Error listing employees:', error);
		return res.status(500).json({
			error: 'Internal server error while listing employees'
		});
	}
};

// ============ GET AN EMPLOYEE BY ID ============
const getEmployee = async (req, res) => {
	try {
		const { employee_id } = req.params;
		const userValidation = await validateAuthenticatedUser(req, 'get employee');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!employee_id || !Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
			return res.status(400).json({ error: 'Employee ID is required and must be a valid number' });
		}

		const employee = await prisma.employees.findUnique({
			where: { employee_id: Number(employee_id) },
			include: {
				departments: {
					select: {
						dept_id: true,
						name: true
					}
				}
			}
		});

		if (!employee) return res.status(404).json({ error: 'The specified employee does not exist' });

		return res.status(200).json({ message: 'Employee retrieved successfully', employee });
	} catch (error) {
		console.error('Error retrieving employee:', error);
		return res.status(500).json({ error: 'Internal server error while retrieving employee' });
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('employees', 'can_read'), listEmployees);
router.get('/:employee_id', requireModulePermission('employees', 'can_read'), getEmployee);

module.exports = router;
