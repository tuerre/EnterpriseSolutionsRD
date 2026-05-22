const express = require('express');
const Decimal = require('decimal.js');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = express.Router();

const addTaxType = async (req, res) => {
    try {
        const { percentage } = req.body;
        const user_id = Number(req.user?.user_id);

        if (!Number.isInteger(user_id) || user_id <= 0) {
            return res.status(400).json({ error: 'Could not determine authenticated user' });
        }

        const usuarioAutenticado = await prisma.users.findUnique({
            where: { user_id },
            select: { user_id: true, is_active: true }
        });

        if (!usuarioAutenticado) {
            return res.status(401).json({ error: 'Session is no longer valid. Please log in again to create tax types.' });
        }

        if (usuarioAutenticado.is_active === false) {
            return res.status(403).json({ error: 'Authenticated user is inactive' });
        }

        if (percentage === undefined || percentage === null || percentage === '') {
            return res.status(400).json({ error: 'percentage is required' });
        }

        let percentageDecimal;
        try {
            percentageDecimal = new Decimal(percentage);
        } catch (error) {
            return res.status(400).json({ error: 'percentage must be a valid number' });
        }

        if (percentageDecimal.lte(0)) {
            return res.status(400).json({ error: 'percentage must be greater than 0' });
        }

        if (percentageDecimal.gt(100)) {
            return res.status(400).json({ error: 'percentage cannot exceed 100' });
        }

        const taxTypeCreated = await prisma.tax_types.create({
            data: {
                name: 'ITBIS',
                percentage: percentageDecimal.toFixed(2)
            }
        });

        await createSystemMovement({
            module_name: 'tax_types',
            user_id,
            reference_id: taxTypeCreated.tax_id,
            actionType: 'Actualizar_ITBIS',
            description: `Actualizo ITBIS con porcentaje ${taxTypeCreated.percentage}%`
        });

        return res.status(201).json({
            message: 'Tax type created successfully',
            tax_type: taxTypeCreated
        });
    } catch (error) {
        console.error('Error creating tax type:', error);
        return res.status(500).json({ error: 'Internal server error while creating the tax type' });
    }
};

router.post('/add', requireModulePermission('tax_types', 'can_insert'), addTaxType);

module.exports = router;