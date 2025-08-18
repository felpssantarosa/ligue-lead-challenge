import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { RegisterUserService } from "@/user/service";
import type { RegisterUserInput } from "@/user/validation";

@injectable()
export class RegisterUserController extends BaseController {
	constructor(
		@inject("RegisterUserService")
		private readonly registerUserService: RegisterUserService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * POST /auth/register
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = this.validation.execute<RegisterUserInput>(
				"register-user",
				req.body,
				"RegisterUserController.handle",
			);

			const user = await this.registerUserService.execute({
				email: validatedData.email,
				name: validatedData.name,
				password: validatedData.password,
			});

			res.status(201).json({
				success: true,
				data: user.toPublicData(),
				message: "User registered successfully",
			});
		} catch (error) {
			this.handleError(error, res, "RegisterUserController.handle");
		}
	}
}
