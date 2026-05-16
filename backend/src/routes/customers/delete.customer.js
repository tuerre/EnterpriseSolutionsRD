const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ DELETE A CUSTOMER ============
const deleteCustomer = async (req, res) => {
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
				error: 'Session is no longer valid. Please log in again to delete customers.'
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

		// ============ CHECK IF CUSTOMER EXISTS ============
		const existingCustomer = await prisma.customers.findUnique({
			where: { customer_id: Number(customer_id) }
		});

		if (!existingCustomer) {
			return res.status(404).json({
				error: 'The specified customer does not exist'
			});
		}

		// ============ CHECK IF ALREADY INACTIVE ============
		if (existingCustomer.is_active === false) {
			return res.status(400).json({
				error: 'Customer is already deactivated'
			});
		}

		// ============ INACTIVATE CUSTOMER (SOFT DELETE) ============
		// Usually we do a soft delete for customers rather than hard delete to keep history.
		const deletedCustomer = await prisma.customers.update({
			where: { customer_id: Number(customer_id) },
			data: { is_active: false }
		});

		return res.status(200).json({
			message: 'Customer successfully deactivated',
			customer: deletedCustomer
		});
	} catch (error) {
		console.error('Error deleting customer:', error);
		return res.status(500).json({
			error: 'Internal server error while deleting the customer'
		});
	}
};

// ============ ROUTES ============
router.delete('/:customer_id', requireModulePermission('customers', 'can_delete'), deleteCustomer);

module.exports = router;
