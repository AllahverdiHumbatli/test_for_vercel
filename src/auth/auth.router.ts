import { Response, Router } from 'express';
import { RequestWithBody, RequestWithUserId } from '../common/types/requests';
import { accessTokenGuard } from './guards/access.token.guard';
import { IdType } from '../common/types/id';
import { ResultStatus } from '../common/result/resultCode';
import { resultCodeToHttpException } from '../common/result/resultCodeToHttpException';
import { LoginInputDto } from './types/login.input.dto';
import { authService } from './auth.service';
import { routersPaths } from '../common/path/paths';
import { passwordValidation } from '../users/api/middlewares/password.validation';
import { inputValidation } from '../common/validation/input.validation';
import { loginOrEmailValidation } from '../users/api/middlewares/login.or.emaol.validation';
import { HttpStatuses } from '../common/types/httpStatuses';
import { usersQwRepository } from '../users/infrastructure/user.query.repository';

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
      return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    }

    return res.status(HttpStatuses.Success).send({ accessToken: result.data!.accessToken });
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
