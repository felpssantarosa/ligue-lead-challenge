import { inject, injectable } from "tsyringe";
import type { AuthUserService } from "@/user/service/auth/AuthUserService";
import type {
	FindUserByIdService,
	FindUserByIdServiceParams,
	FindUserByIdServiceResponse,
} from "@/user/service/find-by-id/FindByIdService";
import type {
	LoginUserService,
	LoginUserServiceParams,
	LoginUserServiceResponse,
} from "@/user/service/login/LoginUserService";
import type {
	RegisterUserService,
	RegisterUserServiceParams,
	RegisterUserServiceResponse,
} from "@/user/service/register/RegisterUserService";

@injectable()
export class UserService {
	constructor(
		@inject("FindUserByIdService")
		private readonly finduserByIdService: FindUserByIdService,
		@inject("AuthUserService")
		private readonly authUserService: AuthUserService,
		@inject("LoginUserService")
		private readonly loginUserService: LoginUserService,
		@inject("RegisterUserService")
		private readonly registerUserService: RegisterUserService,
	) {}

	public findById(
		params: FindUserByIdServiceParams,
	): Promise<FindUserByIdServiceResponse> {
		return this.finduserByIdService.execute(params);
	}

	public authenticate(token: string) {
		return this.authUserService.validateToken(token);
	}

	public login(
		params: LoginUserServiceParams,
	): Promise<LoginUserServiceResponse> {
		return this.loginUserService.execute(params);
	}

	public register(
		params: RegisterUserServiceParams,
	): Promise<RegisterUserServiceResponse> {
		return this.registerUserService.execute(params);
	}
}
