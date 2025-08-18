import { z } from "zod";

export type UserValidationId = "register-user" | "login-user";

const registerUserSchema = z.object({
	email: z
		.email("Invalid email format")
		.min(1, "Email is required")
		.max(255, "Email must be at most 255 characters")
		.trim()
		.toLowerCase(),
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be at most 100 characters")
		.trim(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.max(255, "Password must be at most 255 characters"),
});

const loginUserSchema = z.object({
	email: z
		.email("Invalid email format")
		.min(1, "Email is required")
		.max(255, "Email must be at most 255 characters")
		.trim()
		.toLowerCase(),
	password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

export const userSchemas: Record<UserValidationId, z.ZodSchema> = {
	"register-user": registerUserSchema,
	"login-user": loginUserSchema,
};
