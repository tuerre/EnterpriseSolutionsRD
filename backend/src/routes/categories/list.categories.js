const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

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

// ============ LIST CATEGORIES ============
const listCategories = async (req, res) => {
	try {
		const userValidation = await validateAuthenticatedUser(req, 'list categories');
		if (!userValidation.valid) {
			return res.status(userValidation.status).json({ error: userValidation.error });
		}

		// ============ SEARCH AND PAGINATION PARAMETERS ============
		const { search, is_active, page = 1, limit = 10, sortBy = 'category_name', sortOrder = 'asc' } = req.query;

		// Validate pagination
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const skip = (pageNum - 1) * limitNum;

		// Validate sorting
		const validFields = ['category_id', 'category_name'];
		const sortByFinal = validFields.includes(sortBy) ? sortBy : 'category_name';
		const sortOrderFinal = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

		// ============ BUILD FILTERS ============
		const where = { is_active: true };

		if (search && typeof search === 'string' && search.trim()) {
			where.category_name = {
				contains: search.trim(),
				mode: 'insensitive'
			};
		}

		// Status filter (active/inactive)
		if (is_active !== undefined) {
			const isActiveBool = is_active === 'true' || is_active === '1' || is_active === true;
			where.is_active = isActiveBool;
		}

		// ============ GET TOTAL AND CATEGORIES ============
		const [total, categories] = await Promise.all([
			prisma.categories.count({ where }),
			prisma.categories.findMany({
				where,
				select: {
					category_id: true,
					category_name: true,
					_count: {
						select: {
							products: true
						}
					}
				},
				orderBy: { [sortByFinal]: sortOrderFinal },
				skip,
				take: limitNum
			})
		]);

		// ============ CALCULATE PAGINATION INFORMATION ============
		const totalPages = Math.ceil(total / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		return res.status(200).json({
			message: 'Categories listed successfully',
			data: {
				categories,
				pagination: {
					currentPage: pageNum,
					pageSize: limitNum,
					totalItems: total,
					totalPages,
					hasNextPage,
					hasPrevPage
				}
			}
		});
	} catch (error) {
		console.error('Error listing categories:', error);
		return res.status(500).json({
			error: 'Internal server error while listing categories'
		});
	}
};

// ============ GET A CATEGORY BY ID ============
const getCategory = async (req, res) => {
	try {
		const { category_id } = req.params;
		const userValidation = await validateAuthenticatedUser(req);
		if (!userValidation.valid) {
			return res.status(userValidation.status).json({ error: userValidation.error });
		}

		// ============ VALIDATE CATEGORY_ID ============
		if (!category_id || !Number.isInteger(Number(category_id)) || Number(category_id) <= 0) {
			return res.status(400).json({
				error: 'Category ID is required and must be a valid number'
			});
		}

		// ============ GET CATEGORY ============
		const category = await prisma.categories.findUnique({
			where: { category_id: Number(category_id) },
			include: {
				products: {
					select: {
						product_id: true,
						product_name: true,
						is_active: true
					}
				}
			}
		});

		if (!category) {
			return res.status(404).json({
				error: 'The specified category does not exist'
			});
		}

		return res.status(200).json({
			message: 'Category retrieved successfully',
			category
		});
	} catch (error) {
		console.error('Error retrieving category:', error);
		return res.status(500).json({
			error: 'Internal server error while retrieving the category'
		});
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('categories', 'can_read'), listCategories);
router.get('/:category_id', requireModulePermission('categories', 'can_read'), getCategory);

module.exports = router;
