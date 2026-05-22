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

// ============ ADD AN EMPLOYEE ============
const addEmployee = async (req, res) => {
	try {
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'add employee');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const { first_name, last_name, email, id_card, dept_id, salary } = req.body;

		if (!first_name || !last_name || !email || !id_card) {
			return res.status(400).json({ error: 'Fields first_name, last_name, email, and id_card are required' });
		}

		const existingEmployee = await prisma.employees.findFirst({
			where: {
				OR: [{ email }, { id_card }]
			}
		});

		if (existingEmployee) {
			return res.status(409).json({ error: 'Email or ID card is already registered' });
		}

		const newEmployee = await prisma.employees.create({
			data: {
				first_name,
				last_name,
				email,
				id_card,
				dept_id: dept_id ? Number(dept_id) : null,
				salary: salary ? Number(salary) : 0
			}
		});

		await createSystemMovement({
			module_name: 'employees',
			user_id,
			reference_id: newEmployee.employee_id,
			actionType: 'CREAR_EMPLEADO',
			description: `Creó al empleado "${newEmployee.first_name} ${newEmployee.last_name}"`
		});

		return res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
	} catch (error) {
		console.error('Error adding employee:', error);
		return res.status(500).json({ error: 'Internal server error while adding employee' });
	}
};

// ============ ROUTES ============
router.post('/', requireModulePermission('employees', 'can_insert'), addEmployee);

module.exports = router;
