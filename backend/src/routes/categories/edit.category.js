const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

// ============ EDIT A CATEGORY ============
const editCategory = async (req, res) => {
	try {
		const { category_id } = req.params;
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
				error: 'Session is no longer valid. Please log in again to edit categories.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ VALIDATE CATEGORY_ID ============
		if (!category_id || !Number.isInteger(Number(category_id)) || Number(category_id) <= 0) {
			return res.status(400).json({
				error: 'Category ID is required and must be a valid number'
			});
		}

		// ============ VERIFY THAT THE CATEGORY EXISTS ============
		const categoryExisting = await prisma.categories.findUnique({
			where: { category_id: Number(category_id) },
			select: {
				category_id: true,
				category_name: true
			}
		});

		if (!categoryExisting) {
			return res.status(404).json({
				error: 'The specified category does not exist'
			});
		}

		// ============ PREPARE DATA FOR UPDATE ============
		const dataUpdate = {};

		if (category_name !== undefined && category_name !== null) {
			if (typeof category_name !== 'string' || category_name.trim() === '') {
				return res.status(400).json({ error: 'Category name must be valid text' });
			}

			if (category_name.trim().length > 100) {
				return res.status(400).json({ error: 'Category name cannot exceed 100 characters' });
			}

			const existingCategory = await prisma.categories.findUnique({
				where: { category_name: category_name.trim() },
				select: { category_id: true }
			});

			if (existingCategory && existingCategory.category_id !== Number(category_id)) {
				return res.status(409).json({
					error: 'Category name is already registered'
				});
			}

			dataUpdate.category_name = category_name.trim();
		}

		// Verify that there is at least one field to update
		if (Object.keys(dataUpdate).length === 0) {
			return res.status(400).json({
				error: 'Must provide at least one field to update'
			});
		}

		// ============ UPDATE CATEGORY ============
		const categoryUpdated = await prisma.categories.update({
			where: { category_id: Number(category_id) },
			data: dataUpdate
		});

		await createSystemMovement({
			module_name: 'categories',
			user_id,
			reference_id: Number(category_id),
			actionType: 'ACTUALIZAR_CATEGORIA',
			description: `Actualizó la categoría ${categoryUpdated.category_name}. Campos: ${Object.keys(dataUpdate).join(', ')}`
		});

		return res.status(200).json({
			message: 'Category updated successfully',
			category: categoryUpdated
		});
	} catch (error) {
		console.error('Error updating category:', error);
		return res.status(500).json({
			error: 'Internal server error while updating the category'
		});
	}
};

// ============ ROUTES ============
router.put('/:category_id', requireModulePermission('categories', 'can_update'), editCategory);

module.exports = router;
