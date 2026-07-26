import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { MemberSearchResponseDto } from "@gym/shared";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userReposistory: Repository<User>
    ) { }

    async getAllUsers() {
        return await this.userReposistory.find();
    }
}