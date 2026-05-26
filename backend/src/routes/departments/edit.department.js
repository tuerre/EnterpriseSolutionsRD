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

// ============ EDIT A DEPARTMENT ============
const editDepartment = async (req, res) => {
	try {
		const { dept_id } = req.params;
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'edit department');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!dept_id || !Number.isInteger(Number(dept_id)) || Number(dept_id) <= 0) {
			return res.status(400).json({ error: 'Department ID is required and must be a valid number' });
		}

		const { name, description } = req.body;

		if (!name && description === undefined) {
			return res.status(400).json({ error: 'At least one field (name, description) is required to update' });
		}

		const existingDepartment = await prisma.departments.findUnique({
			where: { dept_id: Number(dept_id) }
		});

		if (!existingDepartment) {
			return res.status(404).json({ error: 'The specified department does not exist' });
		}

		if (!existingDepartment.is_active) {
			return res.status(400).json({ error: 'Cannot edit an inactive department. Please reactivate it first.' });
		}

		const updateData = {};
		if (name && name.trim() !== '') {
			const nameConflict = await prisma.departments.findFirst({
				where: {
					name: name.trim(),
					dept_id: { not: Number(dept_id) }
				}
			});

			if (nameConflict) {
				return res.status(409).json({ error: 'Department name is already in use by another department' });
			}
			updateData.name = name.trim();
		}

		if (description !== undefined) {
			updateData.description = description ? description.trim() : null;
		}

		const updatedDepartment = await prisma.departments.update({
			where: { dept_id: Number(dept_id) },
			data: updateData
		});

		await createSystemMovement({
			module_name: 'departments',
			user_id,
			reference_id: updatedDepartment.dept_id,
			actionType: 'EDITAR_DEPARTAMENTO',
			description: `Editó el departamento "${updatedDepartment.name}"`
		});

		return res.status(200).json({ message: 'Department updated successfully', department: updatedDepartment });
	} catch (error) {
		console.error('Error updating department:', error);
		return res.status(500).json({ error: 'Internal server error while updating department' });
	}
};

// ============ ROUTES ============
router.put('/:dept_id', requireModulePermission('departments', 'can_update'), editDepartment);

module.exports = router;
