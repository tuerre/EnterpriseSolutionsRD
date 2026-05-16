const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ LIST SUPPLIERS ============
const listSuppliers = async (req, res) => {
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
				error: 'Session is no longer valid. Please log in again to list suppliers.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ SEARCH AND PAGINATION PARAMETERS ============
		const { search, is_active, page = 1, limit = 10, sortBy = 'company_name', sortOrder = 'asc' } = req.query;

		// Validate pagination
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const skip = (pageNum - 1) * limitNum;

		// Validate sorting
		const validFields = ['supplier_id', 'company_name', 'tax_id', 'contact_name', 'email', 'phone'];
		const sortByFinal = validFields.includes(sortBy) ? sortBy : 'company_name';
		const sortOrderFinal = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

		// ============ BUILD FILTERS ============
		const where = { is_active: true };

		// Search filter by company name, contact name, or email
		if (search && typeof search === 'string' && search.trim()) {
			where.OR = [
				{ company_name: { contains: search.trim(), mode: 'insensitive' } },
				{ contact_name: { contains: search.trim(), mode: 'insensitive' } },
				{ email: { contains: search.trim(), mode: 'insensitive' } },
				{ tax_id: { contains: search.trim(), mode: 'insensitive' } }
			];
		}

		// Status filter (active/inactive)
		if (is_active !== undefined) {
			const isActiveBool = is_active === 'true' || is_active === '1' || is_active === true;
			where.is_active = isActiveBool;
		}

		// ============ GET TOTAL AND SUPPLIERS ============
		const [total, suppliers] = await Promise.all([
			prisma.suppliers.count({ where }),
			prisma.suppliers.findMany({
				where,
				select: {
					supplier_id: true,
					company_name: true,
					tax_id: true,
					contact_name: true,
					phone: true,
					email: true,
					address: true,
					is_active: true
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
			message: 'Suppliers listed successfully',
			data: {
				suppliers,
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
		console.error('Error listing suppliers:', error);
		return res.status(500).json({
			error: 'Internal server error while listing suppliers'
		});
	}
};

// ============ GET A SUPPLIER BY ID ============
const getSupplier = async (req, res) => {
	try {
		const { supplier_id } = req.params;
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

		// ============ VALIDATE SUPPLIER_ID ============
		if (!supplier_id || !Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
			return res.status(400).json({
				error: 'Supplier ID is required and must be a valid number'
			});
		}

		// ============ GET SUPPLIER ============
		const supplier = await prisma.suppliers.findUnique({
			where: { supplier_id: Number(supplier_id) },
			include: {
				products: {
					select: {
						product_id: true,
						product_name: true
					}
				},
				purchases: {
					select: {
						purchase_id: true,
						purchase_date: true,
						total_amount: true
					}
				}
			}
		});

		if (!supplier) {
			return res.status(404).json({
				error: 'The specified supplier does not exist'
			});
		}

		return res.status(200).json({
			message: 'Supplier retrieved successfully',
			supplier
		});
	} catch (error) {
		console.error('Error retrieving supplier:', error);
		return res.status(500).json({
			error: 'Internal server error while retrieving the supplier'
		});
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('suppliers', 'can_read'), listSuppliers);
router.get('/:supplier_id', requireModulePermission('suppliers', 'can_read'), getSupplier);

module.exports = router;
