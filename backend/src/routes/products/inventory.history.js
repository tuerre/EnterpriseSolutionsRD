const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

// ============ INVENTORY HISTORY ============
router.get(
	'/',
	requireModulePermission('products', 'can_read'),
	async (req, res) => {

		try {

			const movements = await prisma.system_movements.findMany({

				where: {

					action_type: {

						in: [
							'STOCK_IN',
							'STOCK_OUT'
						]

					}

				},

				orderBy: {
					created_at: 'desc'
				},

				include: {

					users: {

						select: {
							user_id: true,
							username: true
						}

					},

					modules: {

						select: {
							module_id: true,
							name: true
						}

					}

				}

			});

			return res.status(200).json({

				message: 'Inventory history',
				total: movements.length,
				movements

			});

		} catch (error) {

			console.error('Inventory history error:', error);

			return res.status(500).json({
				error: 'Internal server error'
			});

		}

	}
);

module.exports = router;