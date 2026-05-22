const express = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');

const router = express.Router();

const listLatestTaxType = async (req, res) => {
    try {
        const latestTaxType = await prisma.tax_types.findFirst({
            orderBy: [
                { updated_at: 'desc' },
                { tax_id: 'desc' }
            ]
        });

        if (!latestTaxType) {
            return res.status(404).json({ error: 'No tax types have been registered yet' });
        }

        return res.status(200).json({
            tax_type: latestTaxType
        });
    } catch (error) {
        console.error('Error listing latest tax type:', error);
        return res.status(500).json({ error: 'Internal server error while listing the tax type' });
    }
};

router.get('/list', requireModulePermission('tax_types', 'can_read'), listLatestTaxType);

module.exports = router;