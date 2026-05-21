const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ REACTIVATE A CATEGORY ============
const reactivateCategory = async (req, res) => {
	try {
		const { category_id } = req.params;
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
				error: 'Session is no longer valid. Please log in again to reactivate categories.'
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
				category_name: true,
				is_active: true
			}
		});

		if (!categoryExisting) {
			return res.status(404).json({
				error: 'The specified category does not exist'
			});
		}

		if (categoryExisting.is_active === true) {
			return res.status(400).json({
				error: 'Category is already active'
			});
		}

		// ============ REACTIVATE CATEGORY AND ACTIVATE ASSOCIATED PRODUCTS ============
		const categoryReactivated = await prisma.categories.update({
			where: { category_id: Number(category_id) },
			data: { is_active: true }
		});

		// Activate all products associated with this category
		await prisma.products.updateMany({
			where: { category_id: Number(category_id), is_active: false },
			data: { is_active: true }
		});

		return res.status(200).json({
			message: 'Category reactivated successfully. All associated inactive products have been activated.',
			category: {
				category_id: categoryReactivated.category_id,
				category_name: categoryReactivated.category_name,
				is_active: categoryReactivated.is_active
			}
		});
	} catch (error) {
		console.error('Error reactivating category:', error);
		return res.status(500).json({
			error: 'Internal server error while reactivating the category'
		});
	}
};

// ============ ROUTES ============
router.put('/:category_id', requireModulePermission('categories', 'can_update'), reactivateCategory);

module.exports = router;
