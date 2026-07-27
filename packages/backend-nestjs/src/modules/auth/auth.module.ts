import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./enitites/refresh-token.entity";

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken])]
})

export class AuthModule { }