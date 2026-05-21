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

// ============ REACTIVATE A DEPARTMENT ============
const reactivateDepartment = async (req, res) => {
	try {
		const { dept_id } = req.params;
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'reactivate department');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!dept_id || !Number.isInteger(Number(dept_id)) || Number(dept_id) <= 0) {
			return res.status(400).json({ error: 'Department ID is required and must be a valid number' });
		}

		const existingDepartment = await prisma.departments.findUnique({
			where: { dept_id: Number(dept_id) }
		});

		if (!existingDepartment) {
			return res.status(404).json({ error: 'The specified department does not exist' });
		}

		if (existingDepartment.is_active === true) {
			return res.status(400).json({ error: 'The department is already active' });
		}

		const updatedDepartment = await prisma.departments.update({
			where: { dept_id: Number(dept_id) },
			data: { is_active: true }
		});

		await createSystemMovement({
			module_name: 'departments',
			user_id,
			reference_id: updatedDepartment.dept_id,
			actionType: 'REACTIVAR_DEPARTAMENTO',
			description: `Reactivó el departamento "${updatedDepartment.name}"`
		});

		return res.status(200).json({ message: 'Department reactivated successfully', department: updatedDepartment });
	} catch (error) {
		console.error('Error reactivating department:', error);
		return res.status(500).json({ error: 'Internal server error while reactivating department' });
	}
};

// ============ ROUTES ============
router.put('/:dept_id', requireModulePermission('departments', 'can_update'), reactivateDepartment);

module.exports = router;
