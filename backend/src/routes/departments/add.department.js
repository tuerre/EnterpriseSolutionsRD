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

// ============ ADD A DEPARTMENT ============
const addDepartment = async (req, res) => {
	try {
		const user_id = Number(req.user?.user_id);
		const userValidation = await validateAuthenticatedUser(req, 'add department');
		if (!userValidation.valid) return res.status(userValidation.status).json({ error: userValidation.error });

		const { name, description } = req.body;

		if (!name || name.trim() === '') {
			return res.status(400).json({ error: 'Field name is required' });
		}

		const existingDepartment = await prisma.departments.findUnique({
			where: { name: name.trim() }
		});

		if (existingDepartment) {
			return res.status(409).json({ error: 'Department name is already registered' });
		}

		const newDepartment = await prisma.departments.create({
			data: {
				name: name.trim(),
				description: description ? description.trim() : null
			}
		});

		await createSystemMovement({
			module_name: 'departments',
			user_id,
			reference_id: newDepartment.dept_id,
			actionType: 'CREAR_DEPARTAMENTO',
			description: `Creó el departamento "${newDepartment.name}"`
		});

		return res.status(201).json({ message: 'Department created successfully', department: newDepartment });
	} catch (error) {
		console.error('Error adding department:', error);
		return res.status(500).json({ error: 'Internal server error while adding department' });
	}
};

// ============ ROUTES ============
router.post('/', requireModulePermission('departments', 'can_insert'), addDepartment);

module.exports = router;
