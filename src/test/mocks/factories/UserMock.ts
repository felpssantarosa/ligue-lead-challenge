import crypto from "node:crypto";
import { generateUUID } from "@/test/factories";
import { User, type UserJSON } from "@/user";

export const createUser = (params: Partial<UserJSON>) => {
	const defaults: UserJSON = {
		id: generateUUID(),
		name: "Test User",
		email: "testuser@example.com",
		passwordHash: crypto.createHash("sha256").digest("hex"),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const userData = { ...defaults, ...params };

	return User.fromJSON(userData);
};
