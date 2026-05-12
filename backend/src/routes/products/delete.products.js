const express = require('express');
const prisma = require('../../prisma');

const router = express.Router();

// ============ DELETE A PRODUCT (SOFT DELETE) ============
const eliminarProducto = async (req, res) => {
	try {
		const { product_id } = req.params;
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
				error: 'Session is no longer valid. Please log in again to delete products.'
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
				error: 'Product is already inactive'
			});
		}

		// ============ DELETE PRODUCT (SOFT DELETE) ============
		const productoEliminado = await prisma.products.update({
			where: { product_id: Number(product_id) },
			data: { is_active: false }
		});

		return res.status(200).json({
			message: 'Product deleted successfully',
			product: {
				product_id: productoEliminado.product_id,
				product_name: productoEliminado.product_name,
				is_active: productoEliminado.is_active
			}
		});
	} catch (error) {
		console.error('Error deleting product:', error);
		return res.status(500).json({
			error: 'Internal server error while deleting the product'
		});
	}
};

// ============ ROUTES ============
router.delete('/:product_id', eliminarProducto);

module.exports = router;
