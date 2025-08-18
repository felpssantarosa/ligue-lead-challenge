import { ValidationError } from "@/shared/Errors";

export class Email {
	constructor(private readonly value: string) {
		Email.validate(this.value);

		this.value = this.value.toLowerCase().trim();
	}

	public static validate(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			throw new ValidationError({
				message: "Invalid email format",
				field: "email",
				value: email,
				trace: "Email.validade",
			});
		}

		return true;
	}

	public getValue(): string {
		return this.value;
	}
}
