const express = require('express');
const prisma = require('../../prisma');

const router = express.Router();

// ============ ADD A NEW CUSTOMER ============
const addCustomer = async (req, res) => {
	try {
		const { first_name, last_name, email, phone, address, id_card } = req.body;
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
				error: 'Session is no longer valid. Please log in again to create customers.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
				error: 'Authenticated user is inactive'
			});
		}

		// ============ CUSTOMER VALIDATIONS ============
		if (!first_name || typeof first_name !== 'string' || first_name.trim() === '') {
			return res.status(400).json({ error: 'First name is required' });
		}
		if (first_name.trim().length > 100) {
			return res.status(400).json({ error: 'First name cannot exceed 100 characters' });
		}

		if (!last_name || typeof last_name !== 'string' || last_name.trim() === '') {
			return res.status(400).json({ error: 'Last name is required' });
		}
		if (last_name.trim().length > 100) {
			return res.status(400).json({ error: 'Last name cannot exceed 100 characters' });
		}

		const clean_id_card = id_card && typeof id_card === 'string' && id_card.trim() !== '' ? id_card.trim() : null;
		const clean_email = email && typeof email === 'string' && email.trim() !== '' ? email.trim() : null;
		const clean_phone = phone && typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null;
		const clean_address = address && typeof address === 'string' && address.trim() !== '' ? address.trim() : null;

		if (clean_email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(clean_email)) {
				return res.status(400).json({ error: 'Invalid email format' });
			}
		}

		if (clean_id_card) {
			const existingCustomer = await prisma.customers.findUnique({
				where: { id_card: clean_id_card },
				select: { customer_id: true }
			});

			if (existingCustomer) {
				return res.status(409).json({
					error: 'Customer ID Card is already registered'
				});
			}
		}

		if (clean_email) {
			const existingEmail = await prisma.customers.findUnique({
				where: { email: clean_email },
				select: { customer_id: true }
			});

			if (existingEmail) {
				return res.status(409).json({
					error: 'Customer email is already registered'
				});
			}
		}

		// ============ CREATE CUSTOMER ============
		const customerCreated = await prisma.customers.create({
			data: {
				first_name: first_name.trim(),
				last_name: last_name.trim(),
				email: clean_email,
				phone: clean_phone,
				address: clean_address,
				id_card: clean_id_card,
				is_active: true
			}
		});

		return res.status(201).json({
			message: 'Customer created successfully',
			customer: customerCreated
		});
	} catch (error) {
		console.error('Error creating customer:', error);
		return res.status(500).json({
			error: 'Internal server error while creating the customer'
		});
	}
};

// ============ ROUTES ============
router.post('/', addCustomer);

module.exports = router;
