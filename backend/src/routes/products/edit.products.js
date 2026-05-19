const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ FUNCTION TO VALIDATE DECIMALS ============
function validarDecimal(valor, nombreCampo, esObligatorio = false) {
	if (valor === undefined || valor === null) {
		if (esObligatorio) {
			return { valido: false, error: `${nombreCampo} is required` };
		}
		return { valido: true, valor: null };
	}

	const decimal = typeof valor === 'string' ? parseFloat(valor) : valor;

	if (isNaN(decimal) || decimal <= 0) {
		return { valido: false, error: `${nombreCampo} must be a number greater than 0` };
	}

	return { valido: true, valor: decimal };
}

// ============ EDIT A PRODUCT ============
const editarProducto = async (req, res) => {
	try {
		const { product_id } = req.params;
		const { product_name, description, category_id, supplier_id, tax_id, cost_price, sale_price, stock, aisle_location } = req.body;
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
				error: 'Session is no longer valid. Please log in again to edit products.'
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

		// ============ VERIFY THAT THE PRODUCT EXISTS ============
		const productoExistente = await prisma.products.findUnique({
			where: { product_id: Number(product_id) },
			select: {
				product_id: true,
				product_name: true,
				is_active: true
			}
		});

		if (!productoExistente) {
			return res.status(404).json({
				error: 'The specified product does not exist'
			});
		}

		if (productoExistente.is_active === false) {
			return res.status(400).json({
				error: 'Cannot edit an inactive product'
			});
		}

		// ============ PREPARE DATA FOR UPDATE ============
		const dataActualizacion = {};

		// Validate product name
		if (product_name !== undefined && product_name !== null) {
			if (typeof product_name !== 'string' || product_name.trim() === '') {
				return res.status(400).json({ error: 'Product name must be valid text' });
			}

			if (product_name.trim().length > 150) {
				return res.status(400).json({ error: 'Product name cannot exceed 150 characters' });
			}

			dataActualizacion.product_name = product_name.trim();
		}

		// Validate description (optional)
		if (description !== undefined && description !== null) {
			if (typeof description !== 'string') {
				return res.status(400).json({ error: 'Description must be valid text' });
			}

			dataActualizacion.description = description.trim() || null;
		}

		// Validate category
		if (category_id !== undefined && category_id !== null) {
			if (!Number.isInteger(Number(category_id)) || Number(category_id) <= 0) {
				return res.status(400).json({ error: 'Category must be a valid number' });
			}

			const categoriaExistente = await prisma.categories.findUnique({
				where: { category_id: Number(category_id) },
				select: { category_id: true }
			});

			if (!categoriaExistente) {
				return res.status(404).json({ error: 'The specified category does not exist' });
			}

			dataActualizacion.category_id = Number(category_id);
		}

		// Validate supplier
		if (supplier_id !== undefined && supplier_id !== null) {
			if (!Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
				return res.status(400).json({ error: 'Supplier must be a valid number' });
			}

			const proveedorExistente = await prisma.suppliers.findUnique({
				where: { supplier_id: Number(supplier_id) },
				select: { supplier_id: true, is_active: true }
			});

			if (!proveedorExistente) {
				return res.status(404).json({ error: 'The specified supplier does not exist' });
			}

			if (proveedorExistente.is_active === false) {
				return res.status(400).json({ error: 'Supplier is inactive and cannot be used' });
			}

			dataActualizacion.supplier_id = Number(supplier_id);
		}

		// Validate tax
		if (tax_id !== undefined && tax_id !== null) {
			if (!Number.isInteger(Number(tax_id)) || Number(tax_id) <= 0) {
				return res.status(400).json({ error: 'Tax type must be a valid number' });
			}

			const impuestoExistente = await prisma.tax_types.findUnique({
				where: { tax_id: Number(tax_id) },
				select: { tax_id: true }
			});

			if (!impuestoExistente) {
				return res.status(404).json({ error: 'The specified tax type does not exist' });
			}

			dataActualizacion.tax_id = Number(tax_id);
		}

		// Validate cost price
		if (cost_price !== undefined && cost_price !== null) {
			const validacionCosto = validarDecimal(cost_price, 'Cost price');
			if (!validacionCosto.valido) {
				return res.status(400).json({ error: validacionCosto.error });
			}

			dataActualizacion.cost_price = validacionCosto.valor;
		}

		// Validate sale price
		if (sale_price !== undefined && sale_price !== null) {
			const validacionVenta = validarDecimal(sale_price, 'Sale price');
			if (!validacionVenta.valido) {
				return res.status(400).json({ error: validacionVenta.error });
			}

			dataActualizacion.sale_price = validacionVenta.valor;
		}

		// Validate price consistency
		if ((dataActualizacion.cost_price || cost_price) && (dataActualizacion.sale_price || sale_price)) {
			const precioCosto = dataActualizacion.cost_price || parseFloat(cost_price);
			const precioVenta = dataActualizacion.sale_price || parseFloat(sale_price);

			if (precioVenta < precioCosto) {
				return res.status(400).json({
					error: 'Sale price cannot be less than cost price'
				});
			}
		}

		// Validate stock
		if (stock !== undefined && stock !== null) {
			const stockNum = Number(stock);
			if (!Number.isInteger(stockNum) || stockNum < 0) {
				return res.status(400).json({ error: 'Stock must be a non-negative integer' });
			}

			dataActualizacion.stock = stockNum;
		}

		// Validate aisle location
		if (aisle_location !== undefined && aisle_location !== null) {
			if (typeof aisle_location !== 'string') {
				return res.status(400).json({ error: 'Aisle location must be valid text' });
			}

			dataActualizacion.aisle_location = aisle_location.trim() || null;
		}

		// Verify that there is at least one field to update
		if (Object.keys(dataActualizacion).length === 0) {
			return res.status(400).json({
				error: 'Must provide at least one field to update'
			});
		}

		// ============ UPDATE PRODUCT ============
		const productoActualizado = await prisma.products.update({
			where: { product_id: Number(product_id) },
			data: dataActualizacion,
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

		return res.status(200).json({
			message: 'Product updated successfully',
			product: productoActualizado
		});
	} catch (error) {
		console.error('Error updating product:', error);
		return res.status(500).json({
			error: 'Internal server error while updating the product'
		});
	}
};

// ============ ROUTES ============
router.put('/:product_id', requireModulePermission('products', 'can_update'), editarProducto);

module.exports = router;
