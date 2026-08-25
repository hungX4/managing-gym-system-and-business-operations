import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => {
                // Hỗ trợ trường hợp Controller cố tình trả về { message, data }
                const isCustomFormat = data && typeof data === 'object' && ('data' in data || 'message' in data);

                return {
                    statusCode,
                    message: isCustomFormat && data.message ? data.message : 'Success',
                    data: isCustomFormat && data.data !== undefined ? data.data : data,
                };
            }),
        );
    }
}