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
	 * @swagger
	 * /auth/register:
	 *   post:
	 *     summary: Register a new user
	 *     description: Create a new user account with email and password
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
	 *                 minLength: 6
	 *                 description: User password (minimum 6 characters)
	 *                 example: "securePassword123"
	 *     responses:
	 *       201:
	 *         description: User registered successfully
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
	 *         description: Bad request - Invalid data
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       409:
	 *         description: Conflict - Email already exists
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
