const express = require('express');
const prisma = require('../../prisma');

const router = express.Router();

// ============ EDIT A CUSTOMER ============
const editCustomer = async (req, res) => {
	try {
		const { customer_id } = req.params;
		const { first_name, last_name, email, phone, address, id_card, is_active } = req.body;
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
				error: 'Session is no longer valid. Please log in again to edit customers.'
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

		// ============ PREPARE AND VALIDATE FIELDS ============
		const clean_id_card = id_card !== undefined ? (typeof id_card === 'string' && id_card.trim() !== '' ? id_card.trim() : null) : undefined;
		const clean_email = email !== undefined ? (typeof email === 'string' && email.trim() !== '' ? email.trim() : null) : undefined;
		const clean_phone = phone !== undefined ? (typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null) : undefined;
		const clean_address = address !== undefined ? (typeof address === 'string' && address.trim() !== '' ? address.trim() : null) : undefined;

		if (clean_email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(clean_email)) {
				return res.status(400).json({ error: 'Invalid email format' });
			}
		}

		if (first_name !== undefined) {
			if (typeof first_name !== 'string' || first_name.trim() === '') return res.status(400).json({ error: 'First name cannot be empty' });
			if (first_name.trim().length > 100) return res.status(400).json({ error: 'First name cannot exceed 100 characters' });
		}

		if (last_name !== undefined) {
			if (typeof last_name !== 'string' || last_name.trim() === '') return res.status(400).json({ error: 'Last name cannot be empty' });
			if (last_name.trim().length > 100) return res.status(400).json({ error: 'Last name cannot exceed 100 characters' });
		}

		// ============ CHECK UNIQUENESS FOR ID_CARD OR EMAIL ============
		if (clean_id_card !== undefined && clean_id_card !== existingCustomer.id_card && clean_id_card !== null) {
			const idCardExists = await prisma.customers.findUnique({
				where: { id_card: clean_id_card }
			});
			if (idCardExists) {
				return res.status(409).json({ error: 'Customer ID Card is already registered by another customer' });
			}
		}

		if (clean_email !== undefined && clean_email !== existingCustomer.email && clean_email !== null) {
			const emailExists = await prisma.customers.findUnique({
				where: { email: clean_email }
			});
			if (emailExists) {
				return res.status(409).json({ error: 'Customer email is already registered by another customer' });
			}
		}

		// ============ UPDATE CUSTOMER ============
		const dataToUpdate = {};
		if (first_name !== undefined) dataToUpdate.first_name = first_name.trim();
		if (last_name !== undefined) dataToUpdate.last_name = last_name.trim();
		if (email !== undefined) dataToUpdate.email = clean_email;
		if (phone !== undefined) dataToUpdate.phone = clean_phone;
		if (address !== undefined) dataToUpdate.address = clean_address;
		if (id_card !== undefined) dataToUpdate.id_card = clean_id_card;
		if (is_active !== undefined) dataToUpdate.is_active = is_active;

		const updatedCustomer = await prisma.customers.update({
			where: { customer_id: Number(customer_id) },
			data: dataToUpdate
		});

		return res.status(200).json({
			message: 'Customer updated successfully',
			customer: updatedCustomer
		});
	} catch (error) {
		console.error('Error updating customer:', error);
		return res.status(500).json({
			error: 'Internal server error while updating the customer'
		});
	}
};

// ============ ROUTES ============
router.put('/:customer_id', editCustomer);

module.exports = router;
