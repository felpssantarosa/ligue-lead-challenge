import "reflect-metadata";
import type { Request, Response } from "express";
import { ValidationError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { MockJwtService } from "@/test/mocks/services/MockJwtService";
import { LoginUserController } from "@/user/controller/LoginUserController";
import { User } from "@/user/domain";
import { LoginUserService } from "@/user/service/login/LoginUserService";

describe("LoginUserController", () => {
	let loginUserController: LoginUserController;
	let loginUserService: LoginUserService;
	let mockUserRepository: MockUserRepository;
	let mockJwtService: MockJwtService;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockValidation: ValidationHandler & { execute: jest.Mock };

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		mockJwtService = new MockJwtService();
		loginUserService = new LoginUserService(mockUserRepository, mockJwtService);

		mockValidation = {
			execute: jest.fn(),
		} as ValidationHandler & { execute: jest.Mock };

		loginUserController = new LoginUserController(
			loginUserService,
			mockValidation,
		);

		mockRequest = {
			body: {},
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		jest.clearAllMocks();
	});

	describe("handle", () => {
		it("should login user successfully", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const requestData = {
				email: "john@example.com",
				password: "password123",
			};

			const expectedAuthResult = {
				user: user.toPublicData(),
				token: `mock-token-${user.id}`,
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"login-user",
				requestData,
				"LoginUserController.handle",
			);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: expectedAuthResult,
				message: "Login successful",
			});
		});

		it("should handle validation error", async () => {
			const invalidData = {
				email: "invalid-email",
				password: "password123",
			};

			mockRequest.body = invalidData;

			const validationError = new ValidationError({
				message: "Invalid email format",
				field: "email",
				value: "invalid-email",
				trace: "LoginUserController.handle",
			});

			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: validationError.message,
					field: "email",
					value: "invalid-email",
				},
			});

			consoleErrorSpy.mockRestore();
		});

		it("should handle UnauthorizedError for invalid credentials", async () => {
			const requestData = {
				email: "nonexistent@example.com",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "UNAUTHORIZED",
					message: expect.stringContaining("Invalid email or password"),
					action: "login",
					resource: "User",
				},
			});

			consoleErrorSpy.mockRestore();
		});

		it("should handle UnauthorizedError for wrong password", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const requestData = {
				email: "john@example.com",
				password: "wrongpassword",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "UNAUTHORIZED",
					message: expect.stringContaining("Invalid email or password"),
					action: "login",
					resource: "User",
				},
			});

			consoleErrorSpy.mockRestore();
		});

		it("should call validation with correct parameters", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const requestData = {
				email: "john@example.com",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledTimes(1);
			expect(mockValidation.execute).toHaveBeenCalledWith(
				"login-user",
				requestData,
				"LoginUserController.handle",
			);
		});

		it("should return auth result with user data and token", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const requestData = {
				email: "john@example.com",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];

			expect(responseData.data).toEqual({
				user: {
					id: user.id,
					email: "john@example.com",
					name: "John Doe",
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
				token: `mock-token-${user.id}`,
			});

			expect(responseData.data.user).not.toHaveProperty("passwordHash");
		});

		it("should handle email normalization", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const requestData = {
				email: "john@example.com",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			await loginUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(200);

			const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];
			expect(responseData.data.user.email).toBe("john@example.com");
		});
	});
});
