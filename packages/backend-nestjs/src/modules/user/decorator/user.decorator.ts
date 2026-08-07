// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Nếu truyền param vào (VD: @CurrentUser('sub')) thì trả về luôn field đó
        return data ? user?.[data] : user;
    },
);