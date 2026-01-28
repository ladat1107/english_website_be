import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dto/api-response.dto';


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        // Lấy thông tin request hiện tại
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        // next.handle() = tiếp tục xử lý request đến Controller/Service
        // pipe() = xử lý kết quả trả về
        // map() = biến đổi dữ liệu trả về
        return next.handle().pipe(
            map((data) => ({
                success: true,              // Đánh dấu thành công
                data: data,                 // Dữ liệu thực tế từ Controller
                timestamp: new Date().toISOString(), // Thời gian response
                path: request.url,          // Đường dẫn API
                statusCode: response.statusCode,
            })),
        );
    }
}