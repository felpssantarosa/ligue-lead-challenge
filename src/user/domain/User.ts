import * as bcrypt from "bcryptjs";
import { Entity } from "@/shared/domain/Entity";
import { BusinessRuleError } from "@/shared/Errors";
import { Email } from "@/user/domain/object-values/email";
import { Name } from "@/user/domain/object-values/name";
import type {
	CreateUserParams,
	PublicUserData,
	UserJSON,
	UserProps,
} from "@/user/domain/UserDTO";

export class User extends Entity {
	private _email: Email;
	private _name: Name;
	private _passwordHash: string;

	private constructor({
		email,
		name,
		passwordHash,
		createdAt,
		updatedAt,
		id,
	}: UserProps) {
		super({ id, createdAt, updatedAt });

		this._email = email;
		this._name = name;
		this._passwordHash = passwordHash;
	}

	public static async create(params: CreateUserParams): Promise<User> {
		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();

		const email = new Email(params.email);
		const name = new Name(params.name);

		const passwordHash = await bcrypt.hash(params.password, 12);

		return new User({
			id,
			createdAt,
			updatedAt,
			email,
			name,
			passwordHash,
		});
	}

	public static fromJSON(params: UserJSON): User {
		const email = new Email(params.email);
		const name = new Name(params.name);

		return new User({
			email,
			name,
			createdAt: params.createdAt,
			updatedAt: params.updatedAt,
			passwordHash: params.passwordHash,
			id: params.id,
		});
	}

	public async verifyPassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this._passwordHash);
	}

	public get email(): string {
		return this._email.getValue();
	}

	public get name(): string {
		return this._name.getValue();
	}

	public get passwordHash(): string {
		return this._passwordHash;
	}

	public toPublicData(): PublicUserData {
		return {
			id: this.id,
			email: this._email.getValue(),
			name: this._name.getValue(),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public toJSON(): UserJSON {
		return {
			id: this.id,
			email: this._email.getValue(),
			name: this._name.getValue(),
			passwordHash: this._passwordHash,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	private validate(params: CreateUserParams): boolean {
		if (!User.isValidPassword(params.password)) {
			throw new BusinessRuleError({
				rule: "WEAK_PASSWORD",
				message: "Password must be at least 8 characters long",
			});
		}

		Email.validate(params.email);
		Name.validate(params.name);

		return true;
	}

	private static isValidPassword(password: string): boolean {
		return password.length >= 8;
	}
}
