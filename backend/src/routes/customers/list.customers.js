const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ LIST CUSTOMERS ============
const listCustomers = async (req, res) => {
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
				error: 'Session is no longer valid. Please log in again to list customers.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ SEARCH AND PAGINATION PARAMETERS ============
		const { search, page = 1, limit = 10, sortBy = 'first_name', sortOrder = 'asc', status = 'all' } = req.query;

		// Validate pagination
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const skip = (pageNum - 1) * limitNum;

		// Validate sorting
		const validFields = ['customer_id', 'first_name', 'last_name', 'email', 'id_card'];
		const sortByFinal = validFields.includes(sortBy) ? sortBy : 'first_name';
		const sortOrderFinal = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

		// ============ BUILD FILTERS ============
		const where = {};

		if (search && typeof search === 'string' && search.trim()) {
			where.OR = [
				{ first_name: { contains: search.trim(), mode: 'insensitive' } },
				{ last_name: { contains: search.trim(), mode: 'insensitive' } },
				{ email: { contains: search.trim(), mode: 'insensitive' } },
				{ id_card: { contains: search.trim(), mode: 'insensitive' } }
			];
		}

		if (status === 'active') {
			where.is_active = true;
		} else if (status === 'inactive') {
			where.is_active = false;
		}

		// ============ GET TOTAL AND CUSTOMERS ============
		const [total, customers] = await Promise.all([
			prisma.customers.count({ where }),
			prisma.customers.findMany({
				where,
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
			message: 'Customers listed successfully',
			data: {
				customers,
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
		console.error('Error listing customers:', error);
		return res.status(500).json({
			error: 'Internal server error while listing customers'
		});
	}
};

// ============ GET A CUSTOMER BY ID ============
const getCustomer = async (req, res) => {
	try {
		const { customer_id } = req.params;
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

		// ============ VALIDATE CUSTOMER_ID ============
		if (!customer_id || !Number.isInteger(Number(customer_id)) || Number(customer_id) <= 0) {
			return res.status(400).json({
				error: 'Customer ID is required and must be a valid number'
			});
		}

		// ============ GET CUSTOMER ============
		const customer = await prisma.customers.findUnique({
			where: { customer_id: Number(customer_id) }
		});

		if (!customer) {
			return res.status(404).json({
				error: 'The specified customer does not exist'
			});
		}

		return res.status(200).json({
			message: 'Customer retrieved successfully',
			customer
		});
	} catch (error) {
		console.error('Error retrieving customer:', error);
		return res.status(500).json({
			error: 'Internal server error while retrieving the customer'
		});
	}
};

// ============ ROUTES ============
router.get('/', requireModulePermission('customers', 'can_read'), listCustomers);
router.get('/:customer_id', requireModulePermission('customers', 'can_read'), getCustomer);

module.exports = router;
