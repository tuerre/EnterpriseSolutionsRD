const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

// ============ VALIDATE EMAIL FORMAT ============
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// ============ ADD A NEW SUPPLIER ============
const addSupplier = async (req, res) => {
	try {
		const { company_name, contact_name, phone, email, address } = req.body;
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
				error: 'Session is no longer valid. Please log in again to create suppliers.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ SUPPLIER VALIDATIONS ============

		// Validate company name (required)
		if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
			return res.status(400).json({ error: 'Company name is required' });
		}

		if (company_name.trim().length > 150) {
			return res.status(400).json({ error: 'Company name cannot exceed 150 characters' });
		}

		// Validate contact name (optional)
		if (contact_name && typeof contact_name !== 'string') {
			return res.status(400).json({ error: 'Contact name must be valid text' });
		}

		if (contact_name && contact_name.trim().length > 100) {
			return res.status(400).json({ error: 'Contact name cannot exceed 100 characters' });
		}

		// Validate phone (optional)
		if (phone && typeof phone !== 'string') {
			return res.status(400).json({ error: 'Phone must be valid text' });
		}

		if (phone && phone.trim().length > 20) {
			return res.status(400).json({ error: 'Phone cannot exceed 20 characters' });
		}

		// Validate email (optional, but if provided, must be valid)
		if (email && typeof email !== 'string') {
			return res.status(400).json({ error: 'Email must be valid text' });
		}

		if (email && !isValidEmail(email.trim())) {
			return res.status(400).json({ error: 'Email format is invalid' });
		}

		if (email && email.trim().length > 150) {
			return res.status(400).json({ error: 'Email cannot exceed 150 characters' });
		}

		// Validate address (optional)
		if (address && typeof address !== 'string') {
			return res.status(400).json({ error: 'Address must be valid text' });
		}

		// ============ CREATE SUPPLIER ============

		const supplierCreated = await prisma.suppliers.create({
			data: {
				company_name: company_name.trim(),
				contact_name: contact_name ? contact_name.trim() : null,
				phone: phone ? phone.trim() : null,
				email: email ? email.trim() : null,
				address: address ? address.trim() : null,
				is_active: true
			}
		});

		await createSystemMovement({
			module_name: 'suppliers',
			user_id,
			reference_id: supplierCreated.supplier_id,
			actionType: 'CREAR_PROVEEDOR',
			description: `Creó el proveedor ${supplierCreated.company_name}`
		});

		return res.status(201).json({
			message: 'Supplier created successfully',
			supplier: supplierCreated
		});
	} catch (error) {
		console.error('Error creating supplier:', error);
		return res.status(500).json({
			error: 'Internal server error while creating the supplier'
		});
	}
};

// ============ ROUTES ============
router.post('/', requireModulePermission('suppliers', 'can_insert'), addSupplier);

module.exports = router;
