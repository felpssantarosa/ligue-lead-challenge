import "reflect-metadata";
import { UnauthorizedError } from "@/shared/Errors";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { User } from "@/user/domain";
import type { FindUserByIdServiceParams } from "@/user/service/find-by-id/FindByIdService";
import { FindUserByIdService } from "@/user/service/find-by-id/FindByIdService";

describe("FindUserByIdService", () => {
	let findUserByIdService: FindUserByIdService;
	let mockUserRepository: MockUserRepository;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		findUserByIdService = new FindUserByIdService(mockUserRepository);
	});

	describe("execute", () => {
		it("should return user when found by id", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const params: FindUserByIdServiceParams = {
				userId: user.id,
			};

			const result = await findUserByIdService.execute(params);

			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe(user.id);
			expect(result.email).toBe(user.email);
			expect(result.name).toBe(user.name);
		});

		it("should call repository findById with correct userId", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const findByIdSpy = jest.spyOn(mockUserRepository, "findById");

			const params: FindUserByIdServiceParams = {
				userId: user.id,
			};

			await findUserByIdService.execute(params);

			expect(findByIdSpy).toHaveBeenCalledTimes(1);
			expect(findByIdSpy).toHaveBeenCalledWith(user.id);
		});

		it("should throw UnauthorizedError when user is not found", async () => {
			const params: FindUserByIdServiceParams = {
				userId: "non-existent-user-id",
			};

			await expect(findUserByIdService.execute(params)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should include correct error details when user is not found", async () => {
			const params: FindUserByIdServiceParams = {
				userId: "non-existent-user-id",
			};

			try {
				await findUserByIdService.execute(params);
			} catch (error) {
				expect(error).toBeInstanceOf(UnauthorizedError);
				expect((error as UnauthorizedError).message).toContain(
					"User not found",
				);
			}
		});

		it("should handle multiple users and find correct one", async () => {
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

			const params1: FindUserByIdServiceParams = {
				userId: user1.id,
			};
			const params2: FindUserByIdServiceParams = {
				userId: user2.id,
			};

			const result1 = await findUserByIdService.execute(params1);
			const result2 = await findUserByIdService.execute(params2);

			expect(result1.id).toBe(user1.id);
			expect(result1.email).toBe(user1.email);
			expect(result2.id).toBe(user2.id);
			expect(result2.email).toBe(user2.email);
		});

		it("should return exact user instance from repository", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			const savedUser = await mockUserRepository.save(user);

			const params: FindUserByIdServiceParams = {
				userId: user.id,
			};

			const result = await findUserByIdService.execute(params);

			expect(result).toBe(savedUser);
		});
	});
});
