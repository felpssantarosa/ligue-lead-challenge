import { ValidationError } from "@/shared/Errors";

export class Name {
	constructor(private readonly value: string) {
		Name.validate(this.value);

		this.value = this.value.trim();
	}

	public static validate(name: string): boolean {
		if (/[^a-zA-Z ]/.test(name)) {
			throw new ValidationError({
				message: "Name cannot contain numbers or special characters",
				field: "name",
				value: name,
				trace: "Name.validate",
			});
		}

		if (name.length === 0) {
			throw new ValidationError({
				message: "Name cannot be empty",
				field: "name",
				value: name,
				trace: "Name.validate",
			});
		}

		return true;
	}

	public getValue(): string {
		return this.value;
	}
}
