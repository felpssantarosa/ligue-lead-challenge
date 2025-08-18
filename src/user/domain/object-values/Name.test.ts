import "reflect-metadata";
import { ValidationError } from "@/shared/Errors";
import { Name } from "@/user/domain/object-values/name";

describe("Name Value Object", () => {
	describe("constructor", () => {
		it("should create Name with valid name", () => {
			const name = new Name("John Doe");
			expect(name.getValue()).toBe("John Doe");
		});

		it("should trim whitespace from name", () => {
			const name = new Name("  John Doe  ");
			expect(name.getValue()).toBe("John Doe");
		});

		it("should handle single name", () => {
			const name = new Name("John");
			expect(name.getValue()).toBe("John");
		});

		it("should handle multiple middle names", () => {
			const name = new Name("John Michael Doe");
			expect(name.getValue()).toBe("John Michael Doe");
		});

		it("should throw ValidationError for name with numbers", () => {
			expect(() => new Name("John123")).toThrow(ValidationError);
			expect(() => new Name("123John")).toThrow(ValidationError);
			expect(() => new Name("John 123 Doe")).toThrow(ValidationError);
		});

		it("should throw ValidationError for name with special characters", () => {
			expect(() => new Name("John@Doe")).toThrow(ValidationError);
			expect(() => new Name("John-Doe")).toThrow(ValidationError);
			expect(() => new Name("John_Doe")).toThrow(ValidationError);
			expect(() => new Name("John.Doe")).toThrow(ValidationError);
			expect(() => new Name("John#Doe")).toThrow(ValidationError);
		});

		it("should throw ValidationError for empty name", () => {
			expect(() => new Name("")).toThrow(ValidationError);
		});
	});

	describe("validate", () => {
		it("should validate correct name formats", () => {
			expect(Name.validate("John")).toBe(true);
			expect(Name.validate("John Doe")).toBe(true);
			expect(Name.validate("Mary Jane Smith")).toBe(true);
			expect(Name.validate("Anne Marie")).toBe(true);
		});

		it("should throw ValidationError for names with numbers", () => {
			const invalidNames = ["John123", "123John", "John 123", "1", "John2Doe"];

			for (const invalidName of invalidNames) {
				expect(() => Name.validate(invalidName)).toThrow(ValidationError);
			}
		});

		it("should throw ValidationError for names with special characters", () => {
			const invalidNames = [
				"John@",
				"John-Doe",
				"John_Doe",
				"John.Doe",
				"John#Doe",
				"John$Doe",
				"John%Doe",
				"John&Doe",
				"John*Doe",
				"John+Doe",
				"John=Doe",
				"John?Doe",
				"John!Doe",
			];

			for (const invalidName of invalidNames) {
				expect(() => Name.validate(invalidName)).toThrow(ValidationError);
			}
		});

		it("should throw ValidationError for empty names", () => {
			expect(() => Name.validate("")).toThrow(ValidationError);
		});

		it("should include correct error details in ValidationError for special characters", () => {
			try {
				Name.validate("John123");
			} catch (error) {
				expect(error).toBeInstanceOf(ValidationError);
				expect((error as ValidationError).message).toContain(
					"Name cannot contain numbers or special characters",
				);
				expect((error as ValidationError).field).toBe("name");
				expect((error as ValidationError).value).toBe("John123");
			}
		});

		it("should include correct error details in ValidationError for empty name", () => {
			try {
				Name.validate("");
			} catch (error) {
				expect(error).toBeInstanceOf(ValidationError);
				expect((error as ValidationError).message).toContain(
					"Name cannot be empty",
				);
				expect((error as ValidationError).field).toBe("name");
				expect((error as ValidationError).value).toBe("");
			}
		});
	});

	describe("getValue", () => {
		it("should return the processed name value", () => {
			const name = new Name("  John Doe  ");
			expect(name.getValue()).toBe("John Doe");
		});
	});
});
