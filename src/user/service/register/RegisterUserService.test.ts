import "reflect-metadata";
import { ConflictError, ValidationError } from "@/shared/Errors";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import type { CreateUserParams } from "@/user/domain";
import { User } from "@/user/domain";
import { RegisterUserService } from "@/user/service/register/RegisterUserService";

describe("RegisterUserService", () => {
	let registerUserService: RegisterUserService;
	let mockUserRepository: MockUserRepository;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		registerUserService = new RegisterUserService(mockUserRepository);
	});

	describe("execute", () => {
		it("should register a new user successfully", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const result = await registerUserService.execute(params);

			expect(result).toBeInstanceOf(User);
			expect(result.email).toBe("john@example.com");
			expect(result.name).toBe("John Doe");
			expect(result.id).toBeDefined();
			expect(await result.verifyPassword("password123")).toBe(true);
		});

		it("should save the user to the repository", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const saveSpy = jest.spyOn(mockUserRepository, "save");

			const result = await registerUserService.execute(params);

			expect(saveSpy).toHaveBeenCalledTimes(1);
			expect(saveSpy).toHaveBeenCalledWith(expect.any(User));
			expect(mockUserRepository.getAll()).toHaveLength(1);
			expect(mockUserRepository.getAll()[0].id).toBe(result.id);
		});

		it("should throw ConflictError when user with email already exists", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const existingUser = await User.create(params);
			await mockUserRepository.save(existingUser);

			await expect(registerUserService.execute(params)).rejects.toThrow(
				ConflictError,
			);
		});

		it("should include correct error details in ConflictError", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const existingUser = await User.create(params);
			await mockUserRepository.save(existingUser);

			try {
				await registerUserService.execute(params);
			} catch (error) {
				expect(error).toBeInstanceOf(ConflictError);
				expect((error as ConflictError).message).toContain(
					"User with this email already exists",
				);
			}
		});

		it("should throw ValidationError for invalid email", async () => {
			const params: CreateUserParams = {
				email: "invalid-email",
				name: "John Doe",
				password: "password123",
			};

			await expect(registerUserService.execute(params)).rejects.toThrow(
				ValidationError,
			);
		});

		it("should throw ValidationError for invalid name", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John123",
				password: "password123",
			};

			await expect(registerUserService.execute(params)).rejects.toThrow(
				ValidationError,
			);
		});

		it("should handle email case normalization in User creation", async () => {
			const params: CreateUserParams = {
				email: "JOHN@EXAMPLE.COM",
				name: "John Doe",
				password: "password123",
			};

			const existingUser = await User.create(params);

			await mockUserRepository.save(existingUser);

			expect(existingUser.email).toBe("john@example.com");

			const newUser = await registerUserService.execute(params);
			expect(newUser.email).toBe("john@example.com");

			expect(mockUserRepository.getAll()).toHaveLength(2);
		});

		it("should handle multiple users with different emails", async () => {
			const user1Params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user2Params: CreateUserParams = {
				email: "jane@example.com",
				name: "Jane Smith",
				password: "password456",
			};

			const user1 = await registerUserService.execute(user1Params);
			const user2 = await registerUserService.execute(user2Params);

			expect(user1.email).toBe("john@example.com");
			expect(user2.email).toBe("jane@example.com");
			expect(mockUserRepository.getAll()).toHaveLength(2);
		});
	});
});
