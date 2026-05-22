const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

// ============ FUNCTION TO VALIDATE DECIMALS ============
function validarDecimal(valor, nombreCampo) {
	if (valor === undefined || valor === null) {
		return { valido: false, error: `${nombreCampo} is required` };
	}

	const decimal = typeof valor === 'string' ? parseFloat(valor) : valor;

	if (isNaN(decimal) || decimal <= 0) {
		return { valido: false, error: `${nombreCampo} must be a number greater than 0` };
	}

	return { valido: true, valor: decimal };
}

// ============ AGREGAR UN NUEVO PRODUCTO ============
const agregarProducto = async (req, res) => {
	try {
		const { product_name, description, category_id, supplier_id, tax_id, cost_price, sale_price, stock, aisle_location } = req.body;
		const user_id = Number(req.user?.user_id);

		// Validar usuario autenticado
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
			error: 'Session is no longer valid. Please log in again to create products.'
			});
		}

		if (usuarioAutenticado.is_active === false) {
			return res.status(403).json({
			error: 'Authenticated user is inactive'
			});
		}

		// ============ PRODUCT VALIDATIONS ============

		// Validate product name
		if (!product_name || typeof product_name !== 'string' || product_name.trim() === '') {
			return res.status(400).json({ error: 'Product name is required' });
		}

		if (product_name.trim().length > 150) {
			return res.status(400).json({ error: 'Product name cannot exceed 150 characters' });
		}

		// Validate description (required)
		if (!description || typeof description !== 'string' || description.trim() === '') {
			return res.status(400).json({ error: 'Description is required' });
		}

		// Validate category
		if (!category_id || !Number.isInteger(Number(category_id)) || Number(category_id) <= 0) {
			return res.status(400).json({ error: 'Category is required and must be a valid number' });
		}

		// Validate supplier
		if (!supplier_id || !Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
			return res.status(400).json({ error: 'Supplier is required and must be a valid number' });
		}

		// Validate tax
		if (!tax_id || !Number.isInteger(Number(tax_id)) || Number(tax_id) <= 0) {
			return res.status(400).json({ error: 'Tax type is required and must be a valid number' });
		}

		// Validate cost price
		const validacionCosto = validarDecimal(cost_price, 'Cost price');
		if (!validacionCosto.valido) {
			return res.status(400).json({ error: validacionCosto.error });
		}

		// Validate sale price
		const validacionVenta = validarDecimal(sale_price, 'Sale price');
		if (!validacionVenta.valido) {
			return res.status(400).json({ error: validacionVenta.error });
		}

	// Sale price must be greater than cost price
	if (validacionVenta.valor <= validacionCosto.valor) {
		return res.status(400).json({
			error: 'Sale price must be greater than cost price'
			});
		}

		// Validate stock (must be a non-negative integer)
		let stockFinal = 0;
		if (stock !== undefined && stock !== null) {
			const stockNum = Number(stock);
			if (!Number.isInteger(stockNum) || stockNum < 0) {
				return res.status(400).json({ error: 'Stock must be a non-negative integer' });
			}
			stockFinal = stockNum;
		}

		// Validate aisle location (required)
		if (!aisle_location || typeof aisle_location !== 'string' || aisle_location.trim() === '') {
			return res.status(400).json({ error: 'Aisle location is required' });
		}

		// ============ DATA INTEGRITY VERIFICATION ============

		// Verify that category exists
		const categoriaExistente = await prisma.categories.findUnique({
			where: { category_id: Number(category_id) },
			select: { category_id: true }
		});

		if (!categoriaExistente) {
			return res.status(404).json({
				error: 'The specified category does not exist'
			});
		}

		// Verify that supplier exists and is active
		const proveedorExistente = await prisma.suppliers.findUnique({
			where: { supplier_id: Number(supplier_id) },
			select: { supplier_id: true, is_active: true }
		});

		if (!proveedorExistente) {
			return res.status(404).json({
				error: 'The specified supplier does not exist'
			});
		}

		if (proveedorExistente.is_active === false) {
			return res.status(400).json({
				error: 'Supplier is inactive and cannot be used'
			});
		}

		// Verify that tax type exists
		const impuestoExistente = await prisma.tax_types.findUnique({
			where: { tax_id: Number(tax_id) },
			select: { tax_id: true }
		});

		if (!impuestoExistente) {
			return res.status(404).json({
				error: 'The specified tax type does not exist'
			});
		}

		// ============ CREATE PRODUCT IN TRANSACTION ============

		const productoCreado = await prisma.$transaction(async (tx) => {
			const producto = await tx.products.create({
				data: {
					product_name: product_name.trim(),
					description: description ? description.trim() : null,
					category_id: Number(category_id),
					supplier_id: Number(supplier_id),
					tax_id: Number(tax_id),
					cost_price: validacionCosto.valor,
					sale_price: validacionVenta.valor,
					stock: stockFinal,
					aisle_location: aisle_location ? aisle_location.trim() : null,
					is_active: true
				}
			});

			return tx.products.findUnique({
				where: { product_id: producto.product_id },
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
		});

		await createSystemMovement({
			module_name: 'products',
			user_id,
			reference_id: productoCreado.product_id,
			amount: stockFinal,
			actionType: 'CREAR_PRODUCTO',
			description: `Creó el producto ${productoCreado.product_name}`
		});

		return res.status(201).json({
			message: 'Product created successfully',
			product: productoCreado
		});
	} catch (error) {
		console.error('Error creating product:', error);
		return res.status(500).json({
			error: 'Internal server error while creating the product'
		});
	}
};

// ============ ROUTES ============
router.post('/', requireModulePermission('products', 'can_insert'), agregarProducto);

module.exports = router;
