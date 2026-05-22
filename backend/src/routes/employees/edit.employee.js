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

// ============ EDIT AN EMPLOYEE ============
const editEmployee = async (req, res) => {
	try {
		const { employee_id } = req.params;
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'edit employee');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		if (!employee_id || !Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
			return res.status(400).json({ error: 'Employee ID is required and must be a valid number' });
		}

		const existingEmployee = await prisma.employees.findUnique({ where: { employee_id: Number(employee_id) } });
		if (!existingEmployee) return res.status(404).json({ error: 'Employee not found' });

		const { first_name, last_name, email, id_card, dept_id, salary } = req.body;

		if (email || id_card) {
			const conflict = await prisma.employees.findFirst({
				where: {
					OR: [
						{ email: email || undefined },
						{ id_card: id_card || undefined }
					],
					NOT: { employee_id: Number(employee_id) }
				}
			});
			if (conflict) {
				return res.status(409).json({ error: 'Email or ID card is already registered by another employee' });
			}
		}

		const dataUpdate = {};
		if (first_name !== undefined) dataUpdate.first_name = first_name;
		if (last_name !== undefined) dataUpdate.last_name = last_name;
		if (email !== undefined) dataUpdate.email = email;
		if (id_card !== undefined) dataUpdate.id_card = id_card;
		if (dept_id !== undefined) dataUpdate.dept_id = dept_id ? Number(dept_id) : null;
		if (salary !== undefined) dataUpdate.salary = Number(salary);

		if (Object.keys(dataUpdate).length === 0) {
			return res.status(400).json({ error: 'Must provide at least one field to update' });
		}

		const updatedEmployee = await prisma.employees.update({
			where: { employee_id: Number(employee_id) },
			data: dataUpdate
		});

		await createSystemMovement({
			module_name: 'employees',
			user_id,
			reference_id: updatedEmployee.employee_id,
			actionType: 'EDITAR_EMPLEADO',
			description: `Editó al empleado "${updatedEmployee.first_name} ${updatedEmployee.last_name}"`
		});

		return res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
	} catch (error) {
		console.error('Error updating employee:', error);
		return res.status(500).json({ error: 'Internal server error while updating employee' });
	}
};

// ============ ROUTES ============
router.put('/:employee_id', requireModulePermission('employees', 'can_update'), editEmployee);

module.exports = router;
