// packages/backend/src/controllers/v1/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { UserServices } from '../../services/user.services';

export class UserController {
    private userService = new UserServices();

    // GET /api/v1/users/search?keyword=abc
    searchMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const keyword = req.query.keyword as string;
            const result = await this.userService.searchMembers(keyword);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}