import { inject, injectable } from "tsyringe";
import { ConflictError } from "@/shared/Errors";
import { type CreateUserParams, User } from "@/user/domain";
import type { UserRepository } from "@/user/infra/repository";

@injectable()
export class RegisterUserService {
	constructor(
		@inject("UserRepository")
		private readonly userRepository: UserRepository,
	) {}

	async execute(params: CreateUserParams): Promise<User> {
		const userExists = await this.userRepository.findByEmail(params.email);

		if (userExists) {
			throw new ConflictError({
				message: "User with this email already exists",
				resourceType: "User",
				conflictingField: "email",
			});
		}

		const user = await User.create(params);

		return await this.userRepository.save(user);
	}
}
