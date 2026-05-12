const express = require('express');
const prisma = require('../../prisma');

const router = express.Router();

// ============ LIST PRODUCTS ============
const listarProductos = async (req, res) => {
	try {
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
				error: 'Session is no longer valid. Please log in again to list products.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ SEARCH AND PAGINATION PARAMETERS ============
		const { search, category_id, supplier_id, is_active, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

		// Validate pagination
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const skip = (pageNum - 1) * limitNum;

		// Validate sorting
		const camposValidos = ['product_id', 'product_name', 'cost_price', 'sale_price', 'stock', 'created_at'];
		const sortByFinal = camposValidos.includes(sortBy) ? sortBy : 'created_at';
		const sortOrderFinal = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

		// ============ BUILD FILTERS ============
		const where = { is_active: true };

		// Search filter by name or description
		if (search && typeof search === 'string' && search.trim()) {
			where.OR = [
				{ product_name: { contains: search.trim(), mode: 'insensitive' } },
				{ description: { contains: search.trim(), mode: 'insensitive' } }
			];
		}

		// Category filter
		if (category_id && !isNaN(Number(category_id)) && Number(category_id) > 0) {
			where.category_id = Number(category_id);
		}

		// Supplier filter
		if (supplier_id && !isNaN(Number(supplier_id)) && Number(supplier_id) > 0) {
			where.supplier_id = Number(supplier_id);
		}

		// Status filter (active/inactive)
		if (is_active !== undefined) {
			const isActiveBool = is_active === 'true' || is_active === '1' || is_active === true;
			where.is_active = isActiveBool;
		}

		// ============ GET TOTAL AND PRODUCTS ============
		const [total, productos] = await Promise.all([
			prisma.products.count({ where }),
			prisma.products.findMany({
				where,
				select: {
					product_id: true,
					product_name: true,
					description: true,
					cost_price: true,
					sale_price: true,
					stock: true,
					aisle_location: true,
					is_active: true,
					created_at: true,
					categories: {
						select: {
							category_id: true,
							category_name: true
						}
					},
					suppliers: {
						select: {
							supplier_id: true,
							company_name: true
						}
					},
					tax_types: {
						select: {
							tax_id: true,
							name: true,
							percentage: true
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
			message: 'Products listed successfully',
			data: {
				products: productos,
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
		console.error('Error listing products:', error);
		return res.status(500).json({
			error: 'Internal server error while listing products'
		});
	}
};

// ============ GET A PRODUCT BY ID ============
const obtenerProducto = async (req, res) => {
	try {
		const { product_id } = req.params;
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
				error: 'Session is no longer valid. Please log in again.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ VALIDATE PRODUCT_ID ============
		if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
			return res.status(400).json({
				error: 'Product ID is required and must be a valid number'
			});
		}

		// ============ GET PRODUCT ============
		const producto = await prisma.products.findUnique({
			where: { product_id: Number(product_id) },
			include: {
				categories: {
					select: {
						category_id: true,
						category_name: true
					}
				},
				suppliers: {
					select: {
						supplier_id: true,
						company_name: true
					}
				},
				tax_types: {
					select: {
						tax_id: true,
						name: true,
						percentage: true
					}
				}
			}
		});

		if (!producto) {
			return res.status(404).json({
				error: 'The specified product does not exist'
			});
		}

		return res.status(200).json({
			message: 'Product retrieved successfully',
			product: producto
		});
	} catch (error) {
		console.error('Error retrieving product:', error);
		return res.status(500).json({
			error: 'Internal server error while retrieving the product'
		});
	}
};

// ============ ROUTES ============
router.get('/', listarProductos);
router.get('/:product_id', obtenerProducto);

module.exports = router;
