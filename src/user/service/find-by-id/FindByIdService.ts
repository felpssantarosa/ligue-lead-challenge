import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "@/shared/Errors";
import type { User } from "@/user/domain";
import type { UserRepository } from "@/user/infra/repository";

export type FindUserByIdServiceParams = {
	userId: string;
};
export type FindUserByIdServiceResponse = User;

@injectable()
export class FindUserByIdService {
	constructor(
		@inject("UserRepository")
		private readonly userRepository: UserRepository,
	) {}

	async execute(
		params: FindUserByIdServiceParams,
	): Promise<FindUserByIdServiceResponse> {
		const user = await this.userRepository.findById(params.userId);

		if (!user) {
			throw new UnauthorizedError({
				message: "User not found",
				action: "authenticate",
				resource: "User",
			});
		}

		return user;
	}
}
