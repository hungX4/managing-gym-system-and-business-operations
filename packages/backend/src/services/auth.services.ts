import { RegisterRequestDto, Role } from "@gym/shared";
import { AppDataSource } from "src/models/data-source";
import { User } from "src/models/entity/User";
import bcrypt from 'bcrypt'

export class AuthServices {


    private static userReposistory = AppDataSource.getRepository(User);

    static async register(data: RegisterRequestDto) {
        try {
            //check if phone existed
            const existingUser = await this.userReposistory.findOne({ where: { phone: data.phone } });
            if (existingUser) {
                throw new Error('Số điện thoại đã được đăng kí');
            }

            //hash
            const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

            const newUser = this.userReposistory.create({
                phone: data.phone,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                role: Role.MEMBER,
                gmail: data.gmail
            })

            await this.userReposistory.save(newUser)
            return { message: 'Đăng ký tài khoản thành công!' };
        } catch (error) {
            throw error
        }


    }

    async login() {

    }

    async logout() {

    }
}