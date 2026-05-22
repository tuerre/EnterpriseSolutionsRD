const { Router } = require('express');
const prisma = require('../../prisma');
const { requireModulePermission } = require('../../middleware/middleware');
const { createSystemMovement } = require('../../helpers/system-movements');

const router = Router();

function parseBooleanFlag(value) {
    if (value === true || value === false) {
        return value;
    }

    if (value === 'true' || value === '1' || value === 1) {
        return true;
    }

    if (value === 'false' || value === '0' || value === 0) {
        return false;
    }

    return null;
}

async function getRoleOr404(roleId) {
    return prisma.roles.findUnique({
        where: { role_id: roleId },
        select: {
            role_id: true,
            role_name: true,
            description: true,
            is_active: true,
            permissions: {
                include: {
                    modules: {
                        select: {
                            module_id: true,
                            name: true,
                            description: true,
                        }
                    }
                },
                orderBy: {
                    module_id: 'asc'
                }
            }
        }
    });
}

router.get('/roles', requireModulePermission('users', 'can_read'), async (req, res) => {
    try {
        const roles = await prisma.roles.findMany({
            orderBy: { role_id: 'asc' },
            select: {
                role_id: true,
                role_name: true,
                description: true,
                is_active: true,
                permissions: {
                    select: {
                        permission_id: true,
                    }
                },
                users: {
                    select: {
                        user_id: true,
                    }
                }
            }
        });

        return res.status(200).json({
            roles: roles.map((role) => ({
                ...role,
                permissions_count: role.permissions.length,
                users_count: role.users.length,
            }))
        });
    } catch (error) {
        console.error('Error listing roles:', error.message);
        return res.status(500).json({ error: 'Internal server error while listing roles' });
    }
});

router.post('/roles', requireModulePermission('users', 'can_insert'), async (req, res) => {
    const { role_name, description, is_active = true, permissions = null } = req.body;
    const user_id = Number(req.user?.user_id);

    if (!role_name || typeof role_name !== 'string' || role_name.trim() === '') {
        return res.status(400).json({ error: 'role_name is required' });
    }

    const roleNameTrimmed = role_name.trim();

    try {
        const existingRole = await prisma.roles.findUnique({
            where: { role_name: roleNameTrimmed },
            select: { role_id: true }
        });

        if (existingRole) {
            return res.status(409).json({ error: 'Role name is already registered' });
        }

        const createdRole = await prisma.$transaction(async (tx) => {
            const role = await tx.roles.create({
                data: {
                    role_name: roleNameTrimmed,
                    description: description || null,
                    is_active: parseBooleanFlag(is_active) ?? true,
                },
                select: {
                    role_id: true,
                    role_name: true,
                    description: true,
                    is_active: true,
                }
            });

            const modules = await tx.modules.findMany({
                select: { module_id: true, name: true }
            });

            if (modules.length > 0) {
                const permissionInput = new Map();

                if (Array.isArray(permissions)) {
                    for (const permission of permissions) {
                        const moduleId = permission.module_id === undefined || permission.module_id === null
                            ? null
                            : Number(permission.module_id);
                        const moduleName = typeof permission.module_name === 'string'
                            ? permission.module_name.trim()
                            : null;

                        if (!moduleId && !moduleName) {
                            throw new Error('Each permission item requires module_id or module_name');
                        }

                        const moduleRecord = moduleId
                            ? modules.find((module) => module.module_id === moduleId)
                            : modules.find((module) => module.name === moduleName);

                        if (!moduleRecord) {
                            throw new Error(`Module not found for permission seed: ${moduleId || moduleName}`);
                        }

                        permissionInput.set(moduleRecord.module_id, {
                            role_id: role.role_id,
                            module_id: moduleRecord.module_id,
                            can_read: !!permission.can_read,
                            can_insert: !!permission.can_insert,
                            can_update: !!permission.can_update,
                            can_delete: !!permission.can_delete,
                        });
                    }
                }

                await tx.permissions.createMany({
                    data: modules.map((module) => permissionInput.get(module.module_id) || ({
                        role_id: role.role_id,
                        module_id: module.module_id,
                        can_read: false,
                        can_insert: false,
                        can_update: false,
                        can_delete: false,
                    }))
                });
            }

            return role;
        });

        await createSystemMovement({
            module_name: 'users',
            user_id,
            reference_id: createdRole.role_id,
            actionType: 'CREAR_ROL',
            description: `Creó el rol ${createdRole.role_name}`
        });

        return res.status(201).json({
            message: 'Role created successfully',
            role: createdRole
        });
    } catch (error) {
        console.error('Error creating role:', error.message);
        return res.status(500).json({ error: error.message || 'Internal server error while creating role' });
    }
});

router.get('/roles/:role_id', requireModulePermission('users', 'can_read'), async (req, res) => {
    try {
        const roleId = Number(req.params.role_id);

        if (!Number.isInteger(roleId) || roleId <= 0) {
            return res.status(400).json({ error: 'Invalid role_id' });
        }

        const role = await getRoleOr404(roleId);

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        return res.status(200).json({ role });
    } catch (error) {
        console.error('Error getting role:', error.message);
        return res.status(500).json({ error: 'Internal server error while fetching role' });
    }
});

router.put('/roles/:role_id', requireModulePermission('users', 'can_update'), async (req, res) => {
    const roleId = Number(req.params.role_id);
    const user_id = Number(req.user?.user_id);
    const { role_name, description, is_active } = req.body;

    if (!Number.isInteger(roleId) || roleId <= 0) {
        return res.status(400).json({ error: 'Invalid role_id' });
    }

    try {
        const existingRole = await prisma.roles.findUnique({
            where: { role_id: roleId },
            select: { role_id: true, role_name: true, description: true, is_active: true }
        });

        if (!existingRole) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const data = {};

        if (role_name !== undefined) {
            if (typeof role_name !== 'string' || role_name.trim() === '') {
                return res.status(400).json({ error: 'role_name must be valid text' });
            }

            const trimmed = role_name.trim();
            const roleConflict = await prisma.roles.findUnique({
                where: { role_name: trimmed },
                select: { role_id: true }
            });

            if (roleConflict && roleConflict.role_id !== roleId) {
                return res.status(409).json({ error: 'Role name is already registered' });
            }

            data.role_name = trimmed;
        }

        if (description !== undefined) {
            data.description = description || null;
        }

        if (is_active !== undefined) {
            const parsed = parseBooleanFlag(is_active);

            if (parsed === null) {
                return res.status(400).json({ error: 'is_active must be a boolean value' });
            }

            data.is_active = parsed;
        }

        const updatedRole = await prisma.roles.update({
            where: { role_id: roleId },
            data,
            select: {
                role_id: true,
                role_name: true,
                description: true,
                is_active: true,
            }
        });

        await createSystemMovement({
            module_name: 'users',
            user_id,
            reference_id: roleId,
            actionType: 'ACTUALIZAR_ROL',
            description: `Actualizó el rol ${updatedRole.role_name}`
        });

        return res.status(200).json({
            message: 'Role updated successfully',
            role: updatedRole
        });
    } catch (error) {
        console.error('Error updating role:', error.message);
        return res.status(500).json({ error: 'Internal server error while updating role' });
    }
});

router.get('/roles/:role_id/permissions', requireModulePermission('users', 'can_read'), async (req, res) => {
    try {
        const roleId = Number(req.params.role_id);

        if (!Number.isInteger(roleId) || roleId <= 0) {
            return res.status(400).json({ error: 'Invalid role_id' });
        }

        const role = await prisma.roles.findUnique({
            where: { role_id: roleId },
            select: {
                role_id: true,
                role_name: true,
                permissions: {
                    include: {
                        modules: {
                            select: {
                                module_id: true,
                                name: true,
                                description: true,
                            }
                        }
                    },
                    orderBy: { module_id: 'asc' }
                }
            }
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        return res.status(200).json({ permissions: role.permissions });
    } catch (error) {
        console.error('Error listing permissions:', error.message);
        return res.status(500).json({ error: 'Internal server error while listing permissions' });
    }
});

router.put('/roles/:role_id/permissions', requireModulePermission('users', 'can_update'), async (req, res) => {
    const roleId = Number(req.params.role_id);
    const user_id = Number(req.user?.user_id);
    const { permissions } = req.body;

    if (!Number.isInteger(roleId) || roleId <= 0) {
        return res.status(400).json({ error: 'Invalid role_id' });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ error: 'permissions array is required' });
    }

    try {
        const role = await prisma.roles.findUnique({
            where: { role_id: roleId },
            select: { role_id: true, role_name: true }
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const modules = await prisma.modules.findMany({
            select: { module_id: true, name: true }
        });

        const updates = [];

        for (const permission of permissions) {
            const moduleId = permission.module_id === undefined || permission.module_id === null
                ? null
                : Number(permission.module_id);
            const moduleName = typeof permission.module_name === 'string'
                ? permission.module_name.trim()
                : null;

            let moduleRecord = null;

            if (moduleId) {
                moduleRecord = modules.find((module) => module.module_id === moduleId);
            } else if (moduleName) {
                moduleRecord = modules.find((module) => module.name === moduleName);
            }

            if (!moduleRecord) {
                return res.status(404).json({ error: `Module not found for permission update: ${moduleId || moduleName}` });
            }

            updates.push({
                role_id: roleId,
                module_id: moduleRecord.module_id,
                can_read: !!permission.can_read,
                can_insert: !!permission.can_insert,
                can_update: !!permission.can_update,
                can_delete: !!permission.can_delete,
            });
        }

        const updatedPermissions = await prisma.$transaction(async (tx) => {
            const written = [];

            for (const permission of updates) {
                const saved = await tx.permissions.upsert({
                    where: {
                        role_id_module_id: {
                            role_id: permission.role_id,
                            module_id: permission.module_id
                        }
                    },
                    create: permission,
                    update: {
                        can_read: permission.can_read,
                        can_insert: permission.can_insert,
                        can_update: permission.can_update,
                        can_delete: permission.can_delete,
                    },
                    include: {
                        modules: {
                            select: {
                                module_id: true,
                                name: true,
                                description: true,
                            }
                        }
                    }
                });

                written.push(saved);
            }

            return written;
        });

        await createSystemMovement({
            module_name: 'users',
            user_id,
            reference_id: roleId,
            actionType: 'ACTUALIZAR_PERMISOS',
            description: `Actualizó permisos del rol ${role.role_name}`
        });

        return res.status(200).json({
            message: 'Permissions updated successfully',
            permissions: updatedPermissions
        });
    } catch (error) {
        console.error('Error updating permissions:', error.message);
        return res.status(500).json({ error: error.message || 'Internal server error while updating permissions' });
    }
});

router.put('/users/:user_id/role', requireModulePermission('users', 'can_update'), async (req, res) => {
    const userId = Number(req.params.user_id);
    const currentUserId = Number(req.user?.user_id);
    const { role_id } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user_id' });
    }

    if (!Number.isInteger(Number(role_id)) || Number(role_id) <= 0) {
        return res.status(400).json({ error: 'role_id is required and must be valid' });
    }

    try {
        const role = await prisma.roles.findUnique({
            where: { role_id: Number(role_id) },
            select: { role_id: true, role_name: true, is_active: true }
        });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        if (role.is_active === false) {
            return res.status(400).json({ error: 'Role is inactive' });
        }

        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: { user_id: true, username: true, role_id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await prisma.users.update({
            where: { user_id: userId },
            data: { role_id: role.role_id },
            select: {
                user_id: true,
                username: true,
                role_id: true,
                is_active: true,
                created_at: true,
            }
        });

        await createSystemMovement({
            module_name: 'users',
            user_id: currentUserId,
            reference_id: userId,
            actionType: 'ASIGNAR_ROL',
            description: `Asignó el rol ${role.role_name} al usuario ${updatedUser.username}`
        });

        return res.status(200).json({
            message: 'User role updated successfully',
            user: updatedUser,
            role
        });
    } catch (error) {
        console.error('Error assigning role:', error.message);
        return res.status(500).json({ error: 'Internal server error while assigning role' });
    }
});

module.exports = router;