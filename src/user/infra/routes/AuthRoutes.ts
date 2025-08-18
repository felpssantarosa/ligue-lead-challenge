import { Router } from "express";
import { container } from "tsyringe";
import { LoginUserController, RegisterUserController } from "@/user/controller";

const authRoutes = Router();

authRoutes.post("/register", (req, res) => {
	const registerController = container.resolve(RegisterUserController);
	return registerController.handle(req, res);
});

authRoutes.post("/login", (req, res) => {
	const loginController = container.resolve(LoginUserController);
	return loginController.handle(req, res);
});

export { authRoutes };
