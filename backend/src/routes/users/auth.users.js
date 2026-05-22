const { Router } = require("express");
const { verify } = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");
const { authenticateToken, revokeToken } = require("../../middleware/middleware");
const { createSystemMovement } = require("../../helpers/system-movements");

const router = Router();

router.post("/login", async (req, res) => {
	// Login handler: validate input, verify password, issue JWT cookie
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			// Missing credentials
			return res.status(400).json({
				error: "Username and password are required",
			});
		}

		const secret = process.env.JWT_SECRET;
		const expiresIn = process.env.JWT_EXPIRES_IN;

		// Fetch the user and related metadata (role, employee)
		const user = await prisma.users.findUnique({
			where: { username },
			include: {
				roles: true,
				employees: true,
			},
		});

		// If user not found, return generic auth error
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// If the user exists but is disabled, return explicit error
		if (user.is_active === false) {
			console.log(`[auth] login rejected: disabled user for username: ${username}`);
			return res.status(403).json({ error: "User account is disabled" });
		}

		// Verify password
		const passwordIsValid = await verify(user.password, password);

		if (!passwordIsValid) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate JWT
		const token = jwt.sign(
			{
				user_id: user.user_id,
				username: user.username,
				role_id: user.role_id,
			},
			secret,
			{ expiresIn }
		);

		// Calculate cookie maxAge from token expiry and set cookie
		const decodedToken = jwt.decode(token);
		const cookieMaxAge = decodedToken && decodedToken.exp
			? Math.max(decodedToken.exp * 1000 - Date.now(), 0)
			: undefined;

		res.cookie("auth_token", token, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production", ...(cookieMaxAge ? { maxAge: cookieMaxAge } : {}),
		});

		console.log("Login successful");

		await createSystemMovement({
			module_name: 'users',
			user_id: user.user_id,
			reference_id: user.user_id,
			actionType: 'INICIAR_SESION',
			description: `Inicio de sesión exitoso de ${user.username}`
		});

		return res.status(200).json({
			message: "Login successful",
			user: {
				user_id: user.user_id,
				username: user.username,
				employee_id: user.employee_id,
				role_id: user.role_id,
				role: user.roles,
				employee: user.employees,
				is_active: user.is_active,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error("Login error:", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/logout", authenticateToken, async (req, res) => {
	try {
		revokeToken(req.token);
		res.clearCookie("auth_token", {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});

		console.log("Logout successful");

		await createSystemMovement({
			module_name: 'users',
			user_id: Number(req.user?.user_id),
			reference_id: Number(req.user?.user_id),
			actionType: 'CERRAR_SESION',
			description: `Cerró la sesión del usuario ${req.user?.username || 'desconocido'}`
		});

		return res.status(200).json({
			message: "Logout successful",
		});
	} catch (error) {
		console.error("Logout error:", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
