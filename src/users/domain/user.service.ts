import {usersRepository} from "../infrastructure/user.repository";
import {bcryptService} from "../../common/adapters/bcrypt.service";
import {IUser} from "./domain-types/user.db.interface";
import {CreateUserInputDto} from "../api/api-types/create.user.input.dto";

export const usersService = {
    async create(dto: CreateUserInputDto): Promise<string> {
        const {login, password, email} = dto
        const passwordHash = await bcryptService.generateHash(password)

        const newUser: IUser = {
            login,
            email,
            passwordHash,
            createdAt: new Date(),

        };
        const newUserId =  await usersRepository.create(newUser);

        return newUserId;
    },

    async delete(id: string): Promise<boolean> {
        const user = await usersRepository.findById(id);
        if (!user) return false;

        return await usersRepository.delete(id);


    },
}

