const { Router } = require("express");
const { hash } = require("argon2");
const { PrismaClient } = require("../../generated/prisma/client");
const { authenticateToken, requireModulePermission,} = require("../../middleware/middleware");

const router = Router();
const prisma = new PrismaClient();

router.post("/register",authenticateToken, requireModulePermission("users", "can_insert"),
    async (req, res) => {
        try {
            const { username, password, employee_id, role_id } = req.body;

        // Validate required fields
        if (!username || !password || !role_id) {
            return res.status(400).json({
                error: "Missing required fields: username, password, and role_id are required",
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

        // Verify role_id exists
        const role = await prisma.roles.findUnique({
            where: { role_id },
        });

        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }

        // Hash the password using argon2
        const hashedPassword = await hash(password);

        // Create the user
        const newUser = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,
                employee_id: employee_id || null,
                role_id,
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

            console.log("Register successful");

            res.status(201).json({
                message: "User created successfully",
                user: newUser,
            });
        } catch (error) {
            console.error("Registration error:", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router;
