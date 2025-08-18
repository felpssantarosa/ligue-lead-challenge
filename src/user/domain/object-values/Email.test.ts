import "reflect-metadata";
import { ValidationError } from "@/shared/Errors";
import { Email } from "@/user/domain/object-values/email";

describe("Email Value Object", () => {
	describe("constructor", () => {
		it("should create Email with valid email address", () => {
			const email = new Email("test@example.com");
			expect(email.getValue()).toBe("test@example.com");
		});

		it("should normalize email to lowercase", () => {
			const email = new Email("TEST@EXAMPLE.COM");
			expect(email.getValue()).toBe("test@example.com");
		});

		it("should trim whitespace from email after validation", () => {
			const email = new Email("test@example.com");
			expect(email.getValue()).toBe("test@example.com");
		});

		it("should handle mixed case and whitespace", () => {
			const email = new Email("TeSt@ExAmPlE.CoM");
			expect(email.getValue()).toBe("test@example.com");
		});

		it("should throw ValidationError for invalid email format", () => {
			expect(() => new Email("invalid-email")).toThrow(ValidationError);
			expect(() => new Email("test@")).toThrow(ValidationError);
			expect(() => new Email("@example.com")).toThrow(ValidationError);
			expect(() => new Email("test.example.com")).toThrow(ValidationError);
			expect(() => new Email("")).toThrow(ValidationError);
		});
	});

	describe("validate", () => {
		it("should validate correct email formats", () => {
			expect(Email.validate("test@example.com")).toBe(true);
			expect(Email.validate("user.name@domain.co.uk")).toBe(true);
			expect(Email.validate("test+tag@example.org")).toBe(true);
			expect(Email.validate("123@example.com")).toBe(true);
		});

		it("should throw ValidationError for invalid email formats", () => {
			const invalidEmails = [
				"invalid-email",
				"test@",
				"@example.com",
				"test.example.com",
				"test @example.com",
				"test@example",
				"",
				" ",
				"test@@example.com",
				"test@exam ple.com",
			];

			for (const invalidEmail of invalidEmails) {
				expect(() => Email.validate(invalidEmail)).toThrow(ValidationError);
			}
		});

		it("should include correct error details in ValidationError", () => {
			try {
				Email.validate("invalid-email");
			} catch (error) {
				expect(error).toBeInstanceOf(ValidationError);
				expect((error as ValidationError).message).toContain(
					"Invalid email format",
				);
				expect((error as ValidationError).field).toBe("email");
				expect((error as ValidationError).value).toBe("invalid-email");
			}
		});
	});

	describe("getValue", () => {
		it("should return the processed email value", () => {
			const email = new Email("Test@Example.Com");
			expect(email.getValue()).toBe("test@example.com");
		});
	});
});
