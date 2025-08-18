import "reflect-metadata";
import { UnauthorizedError } from "@/shared/Errors";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { MockJwtService } from "@/test/mocks/services/MockJwtService";
import { User } from "@/user/domain";
import { AuthUserService } from "@/user/service/auth/AuthUserService";

describe("AuthUserService", () => {
	let authUserService: AuthUserService;
	let mockUserRepository: MockUserRepository;
	let mockJwtService: MockJwtService;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		mockJwtService = new MockJwtService();
		authUserService = new AuthUserService(mockUserRepository, mockJwtService);
	});

	describe("validateToken", () => {
		it("should validate token and return user for valid token", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const token = `mock-token-${user.id}`;

			const result = await authUserService.validateToken(token);

			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe(user.id);
			expect(result.email).toBe(user.email);
			expect(result.name).toBe(user.name);
		});

		it("should call jwt service to verify token", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const verifyTokenSpy = jest.spyOn(mockJwtService, "verifyToken");
			const token = `mock-token-${user.id}`;

			await authUserService.validateToken(token);

			expect(verifyTokenSpy).toHaveBeenCalledTimes(1);
			expect(verifyTokenSpy).toHaveBeenCalledWith(token);
		});

		it("should throw UnauthorizedError for invalid token", async () => {
			const invalidToken = "invalid-token";

			await expect(authUserService.validateToken(invalidToken)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should include correct error details for invalid token", async () => {
			const invalidToken = "invalid-token";

			try {
				await authUserService.validateToken(invalidToken);
			} catch (error) {
				expect(error).toBeInstanceOf(UnauthorizedError);
				expect((error as UnauthorizedError).message).toContain(
					"Invalid or expired token",
				);
			}
		});

		it("should throw UnauthorizedError when jwt service returns null", async () => {
			const mockJwtServiceReturningNull = {
				generateToken: jest.fn(),
				verifyToken: jest.fn().mockReturnValue(null),
			} as unknown as MockJwtService;

			const authService = new AuthUserService(
				mockUserRepository,
				mockJwtServiceReturningNull,
			);

			await expect(authService.validateToken("any-token")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw UnauthorizedError when jwt service returns invalid payload", async () => {
			const mockJwtServiceWithInvalidPayload = {
				generateToken: jest.fn(),
				verifyToken: jest.fn().mockReturnValue("invalid-payload"),
			} as unknown as MockJwtService;

			const authService = new AuthUserService(
				mockUserRepository,
				mockJwtServiceWithInvalidPayload,
			);

			await expect(authService.validateToken("any-token")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw UnauthorizedError when jwt service returns payload without userId", async () => {
			const mockJwtServiceWithoutUserId = {
				generateToken: jest.fn(),
				verifyToken: jest.fn().mockReturnValue({ email: "test@example.com" }),
			} as unknown as MockJwtService;

			const authService = new AuthUserService(
				mockUserRepository,
				mockJwtServiceWithoutUserId,
			);

			await expect(authService.validateToken("any-token")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw UnauthorizedError when user is not found in repository", async () => {
			const nonExistentUserId = "non-existent-user-id";
			const token = `mock-token-${nonExistentUserId}`;

			await expect(authUserService.validateToken(token)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should include correct error details when user is not found", async () => {
			const nonExistentUserId = "non-existent-user-id";
			const token = `mock-token-${nonExistentUserId}`;

			try {
				await authUserService.validateToken(token);
			} catch (error) {
				expect(error).toBeInstanceOf(UnauthorizedError);
				expect((error as UnauthorizedError).message).toContain(
					"User not found",
				);
			}
		});

		it("should query repository with correct userId from token", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const findByIdSpy = jest.spyOn(mockUserRepository, "findById");
			const token = `mock-token-${user.id}`;

			await authUserService.validateToken(token);

			expect(findByIdSpy).toHaveBeenCalledTimes(1);
			expect(findByIdSpy).toHaveBeenCalledWith(user.id);
		});

		it("should handle multiple users and validate correct one", async () => {
			const user1 = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			const user2 = await User.create({
				email: "jane@example.com",
				name: "Jane Smith",
				password: "password456",
			});

			await mockUserRepository.save(user1);
			await mockUserRepository.save(user2);

			const token1 = `mock-token-${user1.id}`;
			const token2 = `mock-token-${user2.id}`;

			const result1 = await authUserService.validateToken(token1);
			const result2 = await authUserService.validateToken(token2);

			expect(result1.id).toBe(user1.id);
			expect(result1.email).toBe(user1.email);
			expect(result2.id).toBe(user2.id);
			expect(result2.email).toBe(user2.email);
		});
	});
});
