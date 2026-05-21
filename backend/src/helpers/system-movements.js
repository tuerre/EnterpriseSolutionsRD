const prisma = require('../prisma');

async function createSystemMovement(dbOrData, maybeData) {
    const hasExplicitClient = maybeData !== undefined;
    const db = hasExplicitClient ? dbOrData : prisma;
    const data = hasExplicitClient ? maybeData : dbOrData;

    if (!db || typeof db.system_movements?.create !== 'function') {
        throw new Error('A Prisma client with system_movements support is required');
    }

    const {
        module_id,
        module_name,
        user_id,
        reference_id = null,
        action_type,
        amount = null,
        notes = null
    } = data || {};

    if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
        throw new Error('user_id is required to create a system movement');
    }

    if (!action_type) {
        throw new Error('action_type is required to create a system movement');
    }

    let resolvedModuleId = Number(module_id);

    if (!Number.isInteger(resolvedModuleId) || resolvedModuleId <= 0) {
        if (!module_name) {
            throw new Error('module_id or module_name is required to create a system movement');
        }

        const moduleRecord = await db.modules.findUnique({
            where: { name: module_name },
            select: { module_id: true }
        });

        if (!moduleRecord) {
            throw new Error(`Module not found: ${module_name}`);
        }

        resolvedModuleId = moduleRecord.module_id;
    }

    return db.system_movements.create({
        data: {
            module_id: resolvedModuleId,
            user_id: Number(user_id),
            reference_id: reference_id === null || reference_id === undefined || reference_id === ''
                ? null
                : Number(reference_id),
            action_type,
            amount: amount === null || amount === undefined || amount === ''
                ? null
                : amount,
            notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null
        }
    });
}

module.exports = {
    createSystemMovement
};