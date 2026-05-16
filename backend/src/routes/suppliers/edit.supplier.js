const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ VALIDATE EMAIL FORMAT ============
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// ============ EDIT A SUPPLIER ============
const editSupplier = async (req, res) => {
	try {
		const { supplier_id } = req.params;
		const { company_name, tax_id, contact_name, phone, email, address } = req.body;
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
				error: 'Session is no longer valid. Please log in again to edit suppliers.'
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
				error: 'Cannot edit an inactive supplier'
			});
		}

		// ============ PREPARE DATA FOR UPDATE ============
		const dataUpdate = {};

		// Validate company name
		if (company_name !== undefined && company_name !== null) {
			if (typeof company_name !== 'string' || company_name.trim() === '') {
				return res.status(400).json({ error: 'Company name must be valid text' });
			}

			if (company_name.trim().length > 150) {
				return res.status(400).json({ error: 'Company name cannot exceed 150 characters' });
			}

			dataUpdate.company_name = company_name.trim();
		}

		// Validate tax ID
		if (tax_id !== undefined && tax_id !== null) {
			if (typeof tax_id !== 'string' || tax_id.trim() === '') {
				return res.status(400).json({ error: 'Tax ID must be valid text' });
			}

			if (tax_id.trim().length > 20) {
				return res.status(400).json({ error: 'Tax ID cannot exceed 20 characters' });
			}

			// Check if new tax ID is already registered (and it's different from current)
			const existingTaxId = await prisma.suppliers.findUnique({
				where: { tax_id: tax_id.trim() },
				select: { supplier_id: true, tax_id: true }
			});

			if (existingTaxId && existingTaxId.supplier_id !== Number(supplier_id)) {
				return res.status(409).json({
					error: 'Tax ID is already registered'
				});
			}

			dataUpdate.tax_id = tax_id.trim();
		}

		// Validate contact name
		if (contact_name !== undefined && contact_name !== null) {
			if (typeof contact_name !== 'string') {
				return res.status(400).json({ error: 'Contact name must be valid text' });
			}

			if (contact_name.trim().length > 100) {
				return res.status(400).json({ error: 'Contact name cannot exceed 100 characters' });
			}

			dataUpdate.contact_name = contact_name.trim() || null;
		}

		// Validate phone
		if (phone !== undefined && phone !== null) {
			if (typeof phone !== 'string') {
				return res.status(400).json({ error: 'Phone must be valid text' });
			}

			if (phone.trim().length > 20) {
				return res.status(400).json({ error: 'Phone cannot exceed 20 characters' });
			}

			dataUpdate.phone = phone.trim() || null;
		}

		// Validate email
		if (email !== undefined && email !== null) {
			if (typeof email !== 'string') {
				return res.status(400).json({ error: 'Email must be valid text' });
			}

			if (email.trim() && !isValidEmail(email.trim())) {
				return res.status(400).json({ error: 'Email format is invalid' });
			}

			if (email.trim().length > 150) {
				return res.status(400).json({ error: 'Email cannot exceed 150 characters' });
			}

			dataUpdate.email = email.trim() || null;
		}

		// Validate address
		if (address !== undefined && address !== null) {
			if (typeof address !== 'string') {
				return res.status(400).json({ error: 'Address must be valid text' });
			}

			dataUpdate.address = address.trim() || null;
		}

		// Verify that there is at least one field to update
		if (Object.keys(dataUpdate).length === 0) {
			return res.status(400).json({
				error: 'Must provide at least one field to update'
			});
		}

		// ============ UPDATE SUPPLIER ============
		const supplierUpdated = await prisma.suppliers.update({
			where: { supplier_id: Number(supplier_id) },
			data: dataUpdate
		});

		return res.status(200).json({
			message: 'Supplier updated successfully',
			supplier: supplierUpdated
		});
	} catch (error) {
		console.error('Error updating supplier:', error);
		return res.status(500).json({
			error: 'Internal server error while updating the supplier'
		});
	}
};

// ============ ROUTES ============
router.put('/:supplier_id', requireModulePermission('suppliers', 'can_update'), editSupplier);

module.exports = router;
