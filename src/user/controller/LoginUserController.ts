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
	 * @swagger
	 * /auth/login:
	 *   post:
	 *     summary: Login user
	 *     description: Authenticate user with email and password
	 *     tags: [Authentication]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - email
	 *               - password
	 *             properties:
	 *               email:
	 *                 type: string
	 *                 format: email
	 *                 description: User email address
	 *                 example: "user@example.com"
	 *               password:
	 *                 type: string
	 *                 format: password
	 *                 description: User password
	 *                 example: "securePassword123"
	 *     responses:
	 *       200:
	 *         description: Login successful
	 *         content:
	 *           application/json:
	 *             schema:
	 *               allOf:
	 *                 - $ref: '#/components/schemas/ApiResponse'
	 *                 - type: object
	 *                   properties:
	 *                     data:
	 *                       type: object
	 *                       properties:
	 *                         user:
	 *                           $ref: '#/components/schemas/User'
	 *                         token:
	 *                           type: string
	 *                           description: JWT authentication token
	 *       400:
	 *         description: Bad request - Invalid credentials
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       401:
	 *         description: Unauthorized - Invalid email or password
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
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
