import { Response, Router } from "express";
import { RequestWithBody, RequestWithUserId } from "../common/types/requests";
import { LoginInputDto } from "./types/login.input.dto";
import { authService } from "./auth.service";
import { routersPaths } from "../common/path/paths";
import { passwordValidation } from "../users/middlewares/password.validation";
import { inputValidation } from "../common/validation/input.validation";
import { loginOrEmailValidation } from "../users/middlewares/login.or.emaol.validation";
import { accessTokenGuard } from "./guards/access.token.guard";
import { usersQwRepository } from "../users/user.query.repository";
import { IdType } from "../common/types/id";
import { ResultStatus } from "../common/result/resultCode";
import { resultCodeToHttpException } from "../common/result/resultCodeToHttpException";
import { HttpStatuses } from "../common/types/httpStatuses";

export const authRouter = Router();

authRouter.post(
  routersPaths.auth.login,
  passwordValidation,
  loginOrEmailValidation,
  inputValidation,
  async (req: RequestWithBody<LoginInputDto>, res: Response) => {
    const { loginOrEmail, password } = req.body;

    const result = await authService.loginUser(loginOrEmail, password);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
    }

    return res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  },
);

authRouter.get(
  routersPaths.auth.me,
  accessTokenGuard,
  async (req: RequestWithUserId<IdType>, res: Response) => {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);
    const me = await usersQwRepository.findById(userId);

    return res.status(HttpStatuses.Success).send(me);
  },
);
