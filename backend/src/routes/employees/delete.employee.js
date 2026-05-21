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

// ============ SOFT DELETE EMPLOYEE ============
const deleteEmployee = async (req, res) => {
	try {
		const { employee_id } = req.params;
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'delete employee');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!employee_id || !Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
			return res.status(400).json({ error: 'Employee ID is required and must be a valid number' });
		}

		const existingEmployee = await prisma.employees.findUnique({ where: { employee_id: Number(employee_id) } });
		if (!existingEmployee) return res.status(404).json({ error: 'Employee not found' });
		if (existingEmployee.is_active === false) return res.status(400).json({ error: 'Employee is already inactive' });

		const deletedEmployee = await prisma.employees.update({
			where: { employee_id: Number(employee_id) },
			data: { is_active: false }
		});

		await createSystemMovement({
			module_name: 'employees',
			user_id,
			reference_id: deletedEmployee.employee_id,
			actionType: 'ELIMINAR_EMPLEADO',
			description: `Desactivó al empleado "${deletedEmployee.first_name} ${deletedEmployee.last_name}"`
		});

		return res.status(200).json({ message: 'Employee deleted (deactivated) successfully', employee: deletedEmployee });
	} catch (error) {
		console.error('Error deleting employee:', error);
		return res.status(500).json({ error: 'Internal server error while deleting employee' });
	}
};

// ============ ROUTES ============
router.put('/:employee_id', requireModulePermission('employees', 'can_delete'), deleteEmployee);

module.exports = router;
