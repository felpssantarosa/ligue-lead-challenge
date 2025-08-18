import type { User } from "@/user/domain";
import type { UserRepository } from "@/user/infra/repository";

export class MockUserRepository implements UserRepository {
	private users: Map<string, User> = new Map();

	async save(user: User): Promise<User> {
		this.users.set(user.id, user);
		return user;
	}

	async findById(id: string): Promise<User | null> {
		return this.users.get(id) || null;
	}

	async findByEmail(email: string): Promise<User | null> {
		for (const user of this.users.values()) {
			if (user.email === email) {
				return user;
			}
		}
		return null;
	}

	clear(): void {
		this.users.clear();
	}

	getAll(): User[] {
		return Array.from(this.users.values());
	}
}

export const mockUserRepository = new MockUserRepository();
