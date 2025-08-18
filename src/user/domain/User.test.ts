import "reflect-metadata";
import { ValidationError } from "@/shared/Errors";
import { generateUUID } from "@/test/factories";
import { User } from "@/user/domain/User";
import type { CreateUserParams, UserJSON } from "@/user/domain/UserDTO";

describe("User Domain", () => {
	describe("User.create", () => {
		it("should create a new user with valid data", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(params);

			expect(user).toBeInstanceOf(User);
			expect(user.email).toBe("john@example.com");
			expect(user.name).toBe("John Doe");
			expect(user.id).toBeDefined();
			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
			expect(user.passwordHash).toBeDefined();
			expect(user.passwordHash).not.toBe(params.password);
		});

		it("should hash the password during creation", async () => {
			const params: CreateUserParams = {
				email: "test@example.com",
				name: "Test User",
				password: "mypassword",
			};

			const user = await User.create(params);

			expect(user.passwordHash).not.toBe("mypassword");
			expect(user.passwordHash.length).toBeGreaterThan(0);
		});

		it("should normalize email to lowercase", async () => {
			const params: CreateUserParams = {
				email: "JOHN@EXAMPLE.COM",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(params);

			expect(user.email).toBe("john@example.com");
		});

		it("should throw ValidationError for invalid email", async () => {
			const params: CreateUserParams = {
				email: "invalid-email",
				name: "John Doe",
				password: "password123",
			};

			await expect(User.create(params)).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError for invalid name with numbers", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John123",
				password: "password123",
			};

			await expect(User.create(params)).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError for empty name", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "",
				password: "password123",
			};

			await expect(User.create(params)).rejects.toThrow(ValidationError);
		});

		it("should not validate password strength in User.create (validation happens elsewhere)", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "weak",
			};

			const user = await User.create(params);
			expect(user).toBeInstanceOf(User);
			expect(user.email).toBe("john@example.com");
		});
	});

	describe("User.fromJSON", () => {
		it("should create user from JSON data", () => {
			const userData: UserJSON = {
				id: generateUUID(),
				email: "john@example.com",
				name: "John Doe",
				passwordHash: "hashed-password",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const user = User.fromJSON(userData);

			expect(user).toBeInstanceOf(User);
			expect(user.id).toBe(userData.id);
			expect(user.email).toBe(userData.email);
			expect(user.name).toBe(userData.name);
			expect(user.passwordHash).toBe(userData.passwordHash);
			expect(user.createdAt).toBe(userData.createdAt);
			expect(user.updatedAt).toBe(userData.updatedAt);
		});

		it("should normalize email when creating from JSON", () => {
			const userData: UserJSON = {
				id: generateUUID(),
				email: "JOHN@EXAMPLE.COM",
				name: "John Doe",
				passwordHash: "hashed-password",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const user = User.fromJSON(userData);

			expect(user.email).toBe("john@example.com");
		});

		it("should throw ValidationError for invalid email in JSON", () => {
			const userData: UserJSON = {
				id: generateUUID(),
				email: "invalid-email",
				name: "John Doe",
				passwordHash: "hashed-password",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(() => User.fromJSON(userData)).toThrow(ValidationError);
		});
	});

	describe("verifyPassword", () => {
		it("should verify correct password", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "mypassword123",
			};

			const user = await User.create(params);
			const isValid = await user.verifyPassword("mypassword123");

			expect(isValid).toBe(true);
		});

		it("should reject incorrect password", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "mypassword123",
			};

			const user = await User.create(params);
			const isValid = await user.verifyPassword("wrongpassword");

			expect(isValid).toBe(false);
		});
	});

	describe("toPublicData", () => {
		it("should return public user data without sensitive information", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(params);
			const publicData = user.toPublicData();

			expect(publicData).toEqual({
				id: user.id,
				email: "john@example.com",
				name: "John Doe",
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});

			expect(publicData).not.toHaveProperty("passwordHash");
		});
	});

	describe("toJSON", () => {
		it("should return complete user data for persistence", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(params);
			const json = user.toJSON();

			expect(json).toEqual({
				id: user.id,
				email: "john@example.com",
				name: "John Doe",
				passwordHash: user.passwordHash,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});
		});
	});

	describe("getters", () => {
		it("should provide access to user properties", async () => {
			const params: CreateUserParams = {
				email: "john@example.com",
				name: "John Doe",
				password: "password123",
			};

			const user = await User.create(params);

			expect(user.email).toBe("john@example.com");
			expect(user.name).toBe("John Doe");
			expect(user.passwordHash).toBeDefined();
			expect(typeof user.passwordHash).toBe("string");
		});
	});
});
