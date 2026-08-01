import { Role } from "@gym/shared";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(), //doc tren ham
            context.getClass,     //doc tren toan bo controller
        ])

        if (!requiredRoles) return true;

        //get request
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        const hasPermission = requiredRoles.includes(user.role);

        return hasPermission;
    }
}