import { RegisterRequestDto } from "@gym/shared"
import { PartialType } from "@nestjs/mapped-types"

export class UpdateUserDto extends PartialType(RegisterRequestDto) { }