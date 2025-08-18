import "reflect-metadata";
import { MockUserRepository } from "@/test/mocks/repositories/MockUserRepository";
import { MockJwtService } from "@/test/mocks/services/MockJwtService";
import type { CreateUserParams, LoginParams } from "@/user/domain";
import { User } from "@/user/domain";
import { AuthUserService } from "@/user/service/auth/AuthUserService";
import { FindUserByIdService } from "@/user/service/find-by-id/FindByIdService";
import { LoginUserService } from "@/user/service/login/LoginUserService";
import { RegisterUserService } from "@/user/service/register/RegisterUserService";
import { UserService } from "@/user/service/UserService";

describe("UserService", () => {
	let userService: UserService;
	let mockUserRepository: MockUserRepository;
	let mockJwtService: MockJwtService;
	let authUserService: AuthUserService;
	let findUserByIdService: FindUserByIdService;
	let loginUserService: LoginUserService;
	let registerUserService: RegisterUserService;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		mockJwtService = new MockJwtService();

		authUserService = new AuthUserService(mockUserRepository, mockJwtService);
		findUserByIdService = new FindUserByIdService(mockUserRepository);
		loginUserService = new LoginUserService(mockUserRepository, mockJwtService);
		registerUserService = new RegisterUserService(mockUserRepository);

		userService = new UserService(
			findUserByIdService,
			authUserService,
			loginUserService,
			registerUserService,
		);
	});

	describe("findById", () => {
		it("should delegate to findUserByIdService", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const executeSpy = jest.spyOn(findUserByIdService, "execute");

			const params = { userId: user.id };
			const result = await userService.findById(params);

			expect(executeSpy).toHaveBeenCalledTimes(1);
			expect(executeSpy).toHaveBeenCalledWith(params);
			expect(result.id).toBe(user.id);
		});
	});

	describe("authenticate", () => {
		it("should delegate to authUserService", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const validateTokenSpy = jest.spyOn(authUserService, "validateToken");
			const token = `mock-token-${user.id}`;

			const result = await userService.authenticate(token);

			expect(validateTokenSpy).toHaveBeenCalledTimes(1);
			expect(validateTokenSpy).toHaveBeenCalledWith(token);
			expect(result.id).toBe(user.id);
		});
	});

	describe("login", () => {
		it("should delegate to loginUserService", async () => {
			const user = await User.create({
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			});
			await mockUserRepository.save(user);

			const executeSpy = jest.spyOn(loginUserService, "execute");

			const params: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			const result = await userService.login(params);

			expect(executeSpy).toHaveBeenCalledTimes(1);
			expect(executeSpy).toHaveBeenCalledWith(params);
			expect(result.user.id).toBe(user.id);
			expect(result.token).toBe(`mock-token-${user.id}`);
		});
	});

	describe("register", () => {
		it("should delegate to registerUserService", async () => {
			const executeSpy = jest.spyOn(registerUserService, "execute");

			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const result = await userService.register(params);

			expect(executeSpy).toHaveBeenCalledTimes(1);
			expect(executeSpy).toHaveBeenCalledWith(params);
			expect(result).toBeInstanceOf(User);
			expect(result.email).toBe("john@example.com");
			expect(result.name).toBe("John Doe");
		});
	});

	describe("integration", () => {
		it("should handle complete user workflow: register -> login -> authenticate -> findById", async () => {
			const registerParams: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const registeredUser = await userService.register(registerParams);
			expect(registeredUser.email).toBe("john@example.com");

			const loginParams: LoginParams = {
				email: "john@example.com",
				password: "password123",
			};

			const loginResult = await userService.login(loginParams);
			expect(loginResult.user.id).toBe(registeredUser.id);
			expect(loginResult.token).toBe(`mock-token-${registeredUser.id}`);

			const authenticatedUser = await userService.authenticate(
				loginResult.token,
			);
			expect(authenticatedUser.id).toBe(registeredUser.id);

			const foundUser = await userService.findById({
				userId: registeredUser.id,
			});
			expect(foundUser.id).toBe(registeredUser.id);
			expect(foundUser.email).toBe(registeredUser.email);
		});

		it("should handle multiple users independently", async () => {
			const user1Params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};
			const user1 = await userService.register(user1Params);

			const user2Params: CreateUserParams = {
				email: "jane@example.com",
				name: "Jane Smith",
				password: "password456",
			};
			const user2 = await userService.register(user2Params);

			const login1Result = await userService.login({
				email: "john@example.com",
				password: "password123",
			});
			const login2Result = await userService.login({
				email: "jane@example.com",
				password: "password456",
			});

			expect(login1Result.user.id).toBe(user1.id);
			expect(login2Result.user.id).toBe(user2.id);
			expect(login1Result.token).toBe(`mock-token-${user1.id}`);
			expect(login2Result.token).toBe(`mock-token-${user2.id}`);

			const auth1Result = await userService.authenticate(login1Result.token);
			const auth2Result = await userService.authenticate(login2Result.token);

			expect(auth1Result.id).toBe(user1.id);
			expect(auth2Result.id).toBe(user2.id);
		});
	});
});
