import type { Entity } from "@/shared/domain/Entity";
import type { Email } from "@/user/domain/object-values/email";
import type { Name } from "@/user/domain/object-values/name";

export type UserProps = Entity & {
	email: Email;
	name: Name;
	passwordHash: string;
};

export type UserJSON = Entity & {
	email: string;
	name: string;
	passwordHash: string;
};

export type CreateUserParams = {
	email: string;
	name: string;
	password: string;
};

export type LoginParams = {
	email: string;
	password: string;
};

export type PublicUserData = {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

export type AuthResult = {
	user: PublicUserData;
	token: string;
};
