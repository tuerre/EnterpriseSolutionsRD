const express = require('express');
const prisma = require('../../prisma');

const router = express.Router();

// ============ DELETE A SUPPLIER (SOFT DELETE) ============
const deleteSupplier = async (req, res) => {
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
				error: 'Session is no longer valid. Please log in again to delete suppliers.'
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

		// ============ VERIFY THAT THE SUPPLIER EXISTS ============
		const supplierExisting = await prisma.suppliers.findUnique({
			where: { supplier_id: Number(supplier_id) },
			select: {
				supplier_id: true,
				company_name: true,
				is_active: true
			}
		});

		if (!supplierExisting) {
			return res.status(404).json({
				error: 'The specified supplier does not exist'
			});
		}

		if (supplierExisting.is_active === false) {
			return res.status(400).json({
				error: 'Supplier is already inactive'
			});
		}

		// ============ DELETE SUPPLIER (SOFT DELETE) ============
		const supplierDeleted = await prisma.suppliers.update({
			where: { supplier_id: Number(supplier_id) },
			data: { is_active: false }
		});

		return res.status(200).json({
			message: 'Supplier deleted successfully',
			supplier: {
				supplier_id: supplierDeleted.supplier_id,
				company_name: supplierDeleted.company_name,
				is_active: supplierDeleted.is_active
			}
		});
	} catch (error) {
		console.error('Error deleting supplier:', error);
		return res.status(500).json({
			error: 'Internal server error while deleting the supplier'
		});
	}
};

// ============ ROUTES ============
router.delete('/:supplier_id', deleteSupplier);

module.exports = router;
