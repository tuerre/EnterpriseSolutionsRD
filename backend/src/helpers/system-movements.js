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
            moduleName,
        user_id,
        reference_id = null,
            action_type,
            actionType,
        amount = null,
            notes = null,
            description = null
    } = data || {};

    if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
        throw new Error('user_id is required to create a system movement');
    }

        const finalActionType = action_type || actionType;

        if (!finalActionType) {
        throw new Error('action_type is required to create a system movement');
    }

    let resolvedModuleId = Number(module_id);

    if (!Number.isInteger(resolvedModuleId) || resolvedModuleId <= 0) {
            const finalModuleName = module_name || moduleName;

            if (!finalModuleName) {
            throw new Error('module_id or module_name is required to create a system movement');
        }

        const moduleRecord = await db.modules.findUnique({
                where: { name: finalModuleName },
            select: { module_id: true }
        });

        if (!moduleRecord) {
                throw new Error(`Module not found: ${finalModuleName}`);
        }

        resolvedModuleId = moduleRecord.module_id;
    }

        const finalNotes = typeof description === 'string' && description.trim()
            ? description.trim()
            : notes;

    return db.system_movements.create({
        data: {
            module_id: resolvedModuleId,
            user_id: Number(user_id),
            reference_id: reference_id === null || reference_id === undefined || reference_id === ''
                ? null
                : Number(reference_id),
                action_type: finalActionType,
            amount: amount === null || amount === undefined || amount === ''
                ? null
                : amount,
                notes: typeof finalNotes === 'string' && finalNotes.trim() ? finalNotes.trim() : null
        }
    });
}

module.exports = {
    createSystemMovement
};