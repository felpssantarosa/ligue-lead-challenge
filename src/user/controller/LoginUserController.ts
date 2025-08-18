import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { LoginUserService } from "@/user/service";
import type { LoginUserInput } from "@/user/validation";

@injectable()
export class LoginUserController extends BaseController {
	constructor(
		@inject("LoginUserService")
		private readonly loginUserService: LoginUserService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * POST /auth/login
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = this.validation.execute<LoginUserInput>(
				"login-user",
				req.body,
				"LoginUserController.handle",
			);

			const authResult = await this.loginUserService.execute({
				email: validatedData.email,
				password: validatedData.password,
			});

			res.status(200).json({
				success: true,
				data: authResult,
				message: "Login successful",
			});
		} catch (error) {
			this.handleError(error, res, "LoginUserController.handle");
		}
	}
}
