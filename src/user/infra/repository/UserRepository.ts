import type { User } from "@/user/domain";

export interface UserRepository {
	save(user: User): Promise<User>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
}
