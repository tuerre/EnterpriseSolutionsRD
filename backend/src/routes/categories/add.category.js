const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

// ============ ADD A NEW CATEGORY ============
const addCategory = async (req, res) => {
	try {
		const { category_name } = req.body;
		const user_id = Number(req.user?.user_id);

		// Validate authenticated user
		if (!Number.isInteger(user_id) || user_id <= 0) {
			return res.status(400).json({
				error: 'Could not determine authenticated user'
			});
		}

		const usuarioAutenticado = await prisma.users.findUnique({
			where: { user_id },
			select: { user_id: true, is_active: true }
		});

		if (!usuarioAutenticado) {
			return res.status(401).json({
				error: 'Session is no longer valid. Please log in again to create categories.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ CATEGORY VALIDATIONS ============
		if (!category_name || typeof category_name !== 'string' || category_name.trim() === '') {
			return res.status(400).json({ error: 'Category name is required' });
		}

		if (category_name.trim().length > 100) {
			return res.status(400).json({ error: 'Category name cannot exceed 100 characters' });
		}

		const existingCategory = await prisma.categories.findUnique({
			where: { category_name: category_name.trim() },
			select: { category_id: true }
		});

		if (existingCategory) {
			return res.status(409).json({
				error: 'Category name is already registered'
			});
		}

		// ============ CREATE CATEGORY ============
		const categoryCreated = await prisma.categories.create({
			data: {
				category_name: category_name.trim()
			}
		});

		await createSystemMovement({
			module_name: 'categories',
			user_id,
			reference_id: categoryCreated.category_id,
			actionType: 'CREAR_CATEGORIA',
			description: `Creó la categoría "${categoryCreated.category_name}"`
		});

		return res.status(201).json({
			message: 'Category created successfully',
			category: categoryCreated
		});
	} catch (error) {
		console.error('Error creating category:', error);
		return res.status(500).json({
			error: 'Internal server error while creating the category'
		});
	}
};

// ============ ROUTES ============
router.post('/', requireModulePermission('categories', 'can_insert'), addCategory);

module.exports = router;
