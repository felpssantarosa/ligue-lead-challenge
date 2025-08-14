import "reflect-metadata";
import { container } from "tsyringe";
import type { ValidationProvider } from "@/shared/validation/ValidationProvider";
import { ZodValidationProvider } from "@/shared/validation/ZodValidationProvider";

export const setupTestValidation = (): void => {
	container.clearInstances();

	container.registerSingleton<ValidationProvider>(
		"ValidationProvider",
		ZodValidationProvider,
	);
};

export const cleanupTestValidation = (): void => {
	container.clearInstances();
};
