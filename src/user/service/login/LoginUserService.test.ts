import "reflect-metadata";
import { UnauthorizedError } from "@/shared/Errors";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { MockJwtService } from "@/test/mocks/services/MockJwtService";
import type { LoginParams } from "@/user/domain";
import { User } from "@/user/domain";
import { LoginUserService } from "@/user/service/login/LoginUserService";

describe("LoginUserService", () => {
	let loginUserService: LoginUserService;
	let mockUserRepository: MockUserRepository;
	let mockJwtService: MockJwtService;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		mockJwtService = new MockJwtService();
		loginUserService = new LoginUserService(mockUserRepository, mockJwtService);
	});

	describe("execute", () => {
		it("should login user with valid credentials", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			const result = await loginUserService.execute(params);

			expect(result).toEqual({
				user: user.toPublicData(),
				token: `mock-token-${user.id}`,
			});
		});

		it("should handle email normalization correctly", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			const result = await loginUserService.execute(params);

			expect(result.user.email).toBe("john@example.com");
			expect(result.token).toBe(`mock-token-${user.id}`);
		});

		it("should throw UnauthorizedError for non-existent user", async () => {
			const params: LoginParams = {
				email: "nonexistent@example.com",
				password: "password123",
			};

			await expect(loginUserService.execute(params)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should include correct error details for non-existent user", async () => {
			const params: LoginParams = {
				email: "nonexistent@example.com",
				password: "password123",
			};

			try {
				await loginUserService.execute(params);
			} catch (error) {
				expect(error).toBeInstanceOf(UnauthorizedError);
				expect((error as UnauthorizedError).message).toContain(
					"Invalid email or password",
				);
			}
		});

		it("should throw UnauthorizedError for incorrect password", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: LoginParams = {
				email: "john@example.com",
				password: "wrongpassword",
			};

			await expect(loginUserService.execute(params)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should include correct error details for incorrect password", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: LoginParams = {
				email: "john@example.com",
				password: "wrongpassword",
			};

			try {
				await loginUserService.execute(params);
			} catch (error) {
				expect(error).toBeInstanceOf(UnauthorizedError);
				expect((error as UnauthorizedError).message).toContain(
					"Invalid email or password",
				);
			}
		});

		it("should generate JWT token with correct payload", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const generateTokenSpy = jest.spyOn(mockJwtService, "generateToken");

			const params: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			await loginUserService.execute(params);

			expect(generateTokenSpy).toHaveBeenCalledTimes(1);
			expect(generateTokenSpy).toHaveBeenCalledWith({
				userId: user.id,
				email: user.email,
			});
		});

		it("should return public user data without sensitive information", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			const result = await loginUserService.execute(params);

			expect(result.user).toEqual({
				id: user.id,
				email: "john@example.com",
				name: "John Doe",
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});

			expect(result.user).not.toHaveProperty("passwordHash");
		});

		it("should handle case-sensitive passwords correctly", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "Password123",
			});
			await mockUserRepository.save(user);

			const correctParams: LoginParams = {
				email: "john@example.com",
				password: "Password123",
			};

			const result = await loginUserService.execute(correctParams);
			expect(result.token).toBe(`mock-token-${user.id}`);

			const wrongCaseParams: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			await expect(loginUserService.execute(wrongCaseParams)).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});
});
