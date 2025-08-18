import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "@/shared/Errors";
import type { AuthResult, LoginParams } from "@/user/domain";
import type { JwtService } from "@/user/infra/jwt";
import type { UserRepository } from "@/user/infra/repository";

export type LoginUserServiceParams = LoginParams;
export type LoginUserServiceResponse = AuthResult;

@injectable()
export class LoginUserService {
	constructor(
		@inject("UserRepository")
		private readonly userRepository: UserRepository,
		@inject("JwtService")
		private readonly jwtService: JwtService,
	) {}

	async execute(
		params: LoginUserServiceParams,
	): Promise<LoginUserServiceResponse> {
		const user = await this.userRepository.findByEmail(params.email);

		if (!user) {
			throw new UnauthorizedError({
				message: "Invalid email or password",
				action: "login",
				resource: "User",
			});
		}

		const isValidPassword = await user.verifyPassword(params.password);

		if (!isValidPassword) {
			throw new UnauthorizedError({
				message: "Invalid email or password",
				action: "login",
				resource: "User",
			});
		}

		const token = this.jwtService.generateToken({
			userId: user.id,
			email: user.email,
		});

		return {
			user: user.toPublicData(),
			token,
		};
	}
}
