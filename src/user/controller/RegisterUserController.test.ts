import "reflect-metadata";
import type { Request, Response } from "express";
import { ValidationError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { RegisterUserController } from "@/user/controller/RegisterUserController";
import { User } from "@/user/domain";
import { RegisterUserService } from "@/user/service/register/RegisterUserService";

describe("RegisterUserController", () => {
	let registerUserController: RegisterUserController;
	let registerUserService: RegisterUserService;
	let mockUserRepository: MockUserRepository;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockValidation: ValidationHandler & { execute: jest.Mock };

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		registerUserService = new RegisterUserService(mockUserRepository);

		mockValidation = {
			execute: jest.fn(),
		} as ValidationHandler & { execute: jest.Mock };

		registerUserController = new RegisterUserController(
			registerUserService,
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
		it("should register user successfully", async () => {
			const requestData = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(requestData);

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const executeSpy = jest
				.spyOn(registerUserService, "execute")
				.mockResolvedValue(user);

			await registerUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"register-user",
				requestData,
				"RegisterUserController.handle",
			);

			expect(executeSpy).toHaveBeenCalledWith({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: user.toPublicData(),
				message: "User registered successfully",
			});
		});

		it("should handle validation error", async () => {
			const invalidData = {
				email: "invalid-email",
				name: "John Doe",
				password: "password123",
			};

			mockRequest.body = invalidData;

			const validationError = new ValidationError({
				message: "Invalid email format",
				field: "email",
				value: "invalid-email",
				trace: "RegisterUserController.handle",
			});

			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await registerUserController.handle(
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

		it("should handle ConflictError when user already exists", async () => {
			const requestData = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const existingUser = await User.create(requestData);
			await mockUserRepository.save(existingUser);

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await registerUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(409);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "CONFLICT",
					message: expect.stringContaining(
						"User with this email already exists",
					),
					resourceType: "User",
					conflictingField: "email",
				},
			});

			consoleErrorSpy.mockRestore();
		});

		it("should handle service validation errors", async () => {
			const requestData = {
				email: "john@example.com",
				name: "John123",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

			await registerUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: expect.stringContaining(
						"Name cannot contain numbers or special characters",
					),
					field: "name",
					value: "John123",
				},
			});

			consoleErrorSpy.mockRestore();
		});

		it("should call validation with correct parameters", async () => {
			const requestData = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);

			const user = await User.create(requestData);
			jest.spyOn(registerUserService, "execute").mockResolvedValue(user);

			await registerUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledTimes(1);
			expect(mockValidation.execute).toHaveBeenCalledWith(
				"register-user",
				requestData,
				"RegisterUserController.handle",
			);
		});

		it("should return user public data without sensitive information", async () => {
			const requestData = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(requestData);

			mockRequest.body = requestData;
			mockValidation.execute.mockReturnValue(requestData);
			jest.spyOn(registerUserService, "execute").mockResolvedValue(user);

			await registerUserController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			const responseData = (mockResponse.json as jest.Mock).mock.calls[0][0];

			expect(responseData.data).toEqual({
				id: user.id,
				email: "john@example.com",
				name: "John Doe",
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});

			expect(responseData.data).not.toHaveProperty("passwordHash");
		});
	});
});
