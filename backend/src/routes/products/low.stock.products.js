const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ LOW STOCK PRODUCTS ============
router.get(
	'/',
	requireModulePermission('products', 'can_read'),
	async (req, res) => {

		try {

			const products = await prisma.products.findMany({

				where: {
					is_active: true,
					stock: {
						lte: 5
					}
				},

				orderBy: {
					stock: 'asc'
				},

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
					}

				}

			});

			return res.status(200).json({

				message: 'Low stock products',
				total: products.length,
				products

			});

		} catch (error) {

			console.error('Low stock error:', error);

			return res.status(500).json({
				error: 'Internal server error'
			});

		}

	}
);

module.exports = router;