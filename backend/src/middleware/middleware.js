const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma/client");

const tokenBlacklist = new Set();
const prisma = new PrismaClient();

function getTokenFromRequest(req) {
	const cookieToken = req.cookies ? req.cookies.auth_token : null;

	if (cookieToken) {
		return cookieToken;
	}

	const authorizationHeader = req.headers.authorization || "";

	if (!authorizationHeader.startsWith("Bearer ")) {
		return null;
	}

	const token = authorizationHeader.slice(7).trim();
	return token || null;
}

function authenticateToken(req, res, next) {
	const token = getTokenFromRequest(req);

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	if (tokenBlacklist.has(token)) {
		return res.status(401).json({ error: "Token has been revoked" });
	}

	const secret = process.env.JWT_SECRET;

	if (!secret) {
		return res.status(500).json({ error: "JWT_SECRET is not configured" });
	}

	try {
		const payload = jwt.verify(token, secret);
		req.user = payload;
		req.token = token;
		return next();
	} catch (error) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

function revokeToken(token) {
	if (token) {
		tokenBlacklist.add(token);
	}
}

function requireModulePermission(moduleName, permissionField) {
	return async (req, res, next) => {
		try {
			const roleId = req.user ? req.user.role_id : null;

			if (!roleId) {
				return res.status(403).json({ error: "Role information is required" });
			}

			const moduleRecord = await prisma.modules.findUnique({
				where: { name: moduleName },
				select: { module_id: true },
			});

			if (!moduleRecord) {
				return res.status(404).json({ error: "Module not found" });
			}

			const permission = await prisma.permissions.findFirst({
				where: {
					role_id: roleId,
					module_id: moduleRecord.module_id,
					[permissionField]: true,
				},
			});

			if (!permission) {
				return res.status(403).json({
					error: `Missing ${permissionField} permission on ${moduleName}`,
				});
			}

			return next();
		} catch (error) {
			return res.status(500).json({ error: "Permission check failed" });
		}
	};
}

module.exports = {
	authenticateToken,
	getTokenFromRequest,
	requireModulePermission,
	revokeToken,
};
