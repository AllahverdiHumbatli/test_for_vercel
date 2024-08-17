import {Response, Router} from "express";
import {CreateUserInputDto} from "./types/create.user.input.dto";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../common/types/requests";
import {usersService} from "./user.service";
import {IUserView} from "./types/user.view.interface";
import {IdType} from "../common/types/id";
import {baseAuthGuard} from "../auth/guards/base.auth.guard";
import {usersQwRepository} from "./user.query.repository";
import {UsersQueryFieldsType} from "./types/users.queryFields.type";
import {IPagination} from "../common/types/pagination";
import {sortQueryFieldsUtil} from "../common/utils/sortQueryFields.util";
import {pageNumberValidation} from "../common/validation/sorting.pagination.validation";
import {emailValidation} from "./middlewares/email.validation";
import {inputValidation} from "../common/validation/input.validation";
import {passwordValidation} from "./middlewares/password.validation";
import {loginValidation} from "./middlewares/login.validation";

export const usersRouter = Router()


usersRouter.get(
    "/",
    baseAuthGuard,
    pageNumberValidation,
    async (
        req: RequestWithQuery<UsersQueryFieldsType>,
        res: Response<IPagination<IUserView[]>>
    ) => {
        const {pageNumber, pageSize, sortBy, sortDirection} = sortQueryFieldsUtil(req.query)

        const allUsers = await usersQwRepository.findAllUsers({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            }
        );

        return res.status(200).send(allUsers);
    }
);

usersRouter.post(
    "/",
    baseAuthGuard,
    passwordValidation,
    loginValidation,
    emailValidation,
    inputValidation,
    async (req: RequestWithBody<CreateUserInputDto>, res: Response<IUserView>) => {
        const {login, password, email} = req.body

        const userId = await usersService.create({login, password, email});
        const newUser = await usersQwRepository.findById(userId);

        return res.status(201).send(newUser!);
    }
);

usersRouter.delete(
    "/:id",
    baseAuthGuard,
    async (req: RequestWithParams<IdType>, res: Response<string>) => {

        const user = await usersService.delete(req.params.id);

        if (!user) return res.sendStatus(404);

        return res.sendStatus(204);
    }
);

