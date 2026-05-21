const { Router } = require("express");
const { hash } = require("argon2");
const prisma = require("../../prisma");
const { authenticateToken, requireModulePermission } = require("../../middleware/middleware");
const { createSystemMovement } = require("../../helpers/system-movements");

const router = Router();

router.post("/register", authenticateToken, requireModulePermission("users", "can_insert"),
    async (req, res) => {
        try {
            const { username, password, employee_id, role_name } = req.body;

            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({
                    error: "Missing required fields: username and password are required",
                });
            }

            // Check if username already exists
            const existingUser = await prisma.users.findUnique({
                where: { username },
            });

            if (existingUser) {
                return res.status(409).json({ error: "Username already exists" });
            }

            // If employee_id is provided, verify it exists
            if (employee_id) {
                const employee = await prisma.employees.findUnique({
                    where: { employee_id },
                });

                if (!employee) {
                    return res.status(404).json({ error: "Employee not found" });
                }
            }

            const resolvedRoleName = role_name || `${username}_role`;

            // Hash password before transaction work
            const hashedPassword = await hash(password);

            const createdData = await prisma.$transaction(async (tx) => {
                // Create a dedicated role for the new user
                const createdRole = await tx.roles.create({
                    data: {
                        role_name: resolvedRoleName,
                        description: `Auto-generated role for user ${username}`,
                        is_active: true,
                    },
                    select: {
                        role_id: true,
                        role_name: true,
                    },
                });

                // Seed permissions for every existing module (all false by default)
                const modules = await tx.modules.findMany({
                    select: { module_id: true },
                });

                if (modules.length > 0) {
                    await tx.permissions.createMany({
                        data: modules.map((module) => ({
                            role_id: createdRole.role_id,
                            module_id: module.module_id,
                            can_read: false,
                            can_insert: false,
                            can_update: false,
                            can_delete: false,
                        })),
                    });
                }

                // Create the user with the newly created role
                const newUser = await tx.users.create({
                    data: {
                        username,
                        password: hashedPassword,
                        employee_id: employee_id || null,
                        role_id: createdRole.role_id,
                        is_active: true,
                    },
                    select: {
                        user_id: true,
                        username: true,
                        employee_id: true,
                        role_id: true,
                        is_active: true,
                        created_at: true,
                    },
                });

                return {
                    newUser,
                    createdRole,
                };
            });

            console.log("Register successful");

            await createSystemMovement({
                module_name: 'users',
                user_id: Number(req.user?.user_id),
                reference_id: createdData.newUser.user_id,
                actionType: 'CREAR_USUARIO',
                description: `Creó el usuario ${createdData.newUser.username} con el rol ${createdData.createdRole.role_name}`
            });

            res.status(201).json({
                message: "User created successfully",
                user: createdData.newUser,
                role: createdData.createdRole,
            });
        } catch (error) {
            console.error("Registration error:", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router;
