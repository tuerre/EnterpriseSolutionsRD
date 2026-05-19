const { Router } = require("express");
const prisma = require("../../prisma");
const { authenticateToken, requireModulePermission } = require("../../middleware/middleware");

const router = Router();

router.put("/:user_id/disable", authenticateToken, requireModulePermission("users", "can_update"), async (req, res) => {
	try {
		const userId = Number(req.params.user_id);

		if (!Number.isInteger(userId)) {
			return res.status(400).json({ error: "Invalid user_id" });
		}

		if (req.user.user_id === userId) {
			return res.status(400).json({ error: "You cannot disable your own user" });
		}

		const user = await prisma.users.findUnique({
			where: { user_id: userId },
			select: { user_id: true, username: true, is_active: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.is_active === false) {
			return res.status(200).json({ message: "User is already disabled", user });
		}

		const updatedUser = await prisma.users.update({
			where: { user_id: userId },
			data: { is_active: false },
			select: { user_id: true, username: true, is_active: true },
		});

		console.log(`User disabled: ${updatedUser.username}`);

		return res.status(200).json({ message: "User disabled successfully", user: updatedUser });
	} catch (error) {
		console.error("Disable user error:", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.put("/:user_id/enable", authenticateToken, requireModulePermission("users", "can_update"), async (req, res) => {
	try {
		const userId = Number(req.params.user_id);

		if (!Number.isInteger(userId)) {
			return res.status(400).json({ error: "Invalid user_id" });
		}

		const user = await prisma.users.findUnique({
			where: { user_id: userId },
			select: { user_id: true, username: true, is_active: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.is_active === true) {
			return res.status(200).json({ message: "User is already enabled", user });
		}

		const updatedUser = await prisma.users.update({
			where: { user_id: userId },
			data: { is_active: true },
			select: { user_id: true, username: true, is_active: true },
		});

		console.log(`User enabled: ${updatedUser.username}`);

		return res.status(200).json({ message: "User enabled successfully", user: updatedUser });
	} catch (error) {
		console.error("Enable user error:", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
