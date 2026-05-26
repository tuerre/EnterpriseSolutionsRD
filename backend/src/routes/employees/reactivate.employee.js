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

// ============ REACTIVATE EMPLOYEE ============
const reactivateEmployee = async (req, res) => {
	try {
		const { employee_id } = req.params;
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'reactivate employee');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!employee_id || !Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
			return res.status(400).json({ error: 'Employee ID is required and must be a valid number' });
		}

		const existingEmployee = await prisma.employees.findUnique({ where: { employee_id: Number(employee_id) } });
		if (!existingEmployee) return res.status(404).json({ error: 'Employee not found' });
		if (existingEmployee.is_active === true) return res.status(400).json({ error: 'Employee is already active' });

		const reactivatedEmployee = await prisma.employees.update({
			where: { employee_id: Number(employee_id) },
			data: { is_active: true }
		});

		await createSystemMovement({
			module_name: 'employees',
			user_id,
			reference_id: reactivatedEmployee.employee_id,
			actionType: 'REACTIVAR_EMPLEADO',
			description: `Reactivó al empleado "${reactivatedEmployee.first_name} ${reactivatedEmployee.last_name}"`
		});

		return res.status(200).json({ message: 'Employee reactivated successfully', employee: reactivatedEmployee });
	} catch (error) {
		console.error('Error reactivating employee:', error);
		return res.status(500).json({ error: 'Internal server error while reactivating employee' });
	}
};

// ============ ROUTES ============
router.put('/:employee_id', requireModulePermission('employees', 'can_update'), reactivateEmployee);

module.exports = router;
