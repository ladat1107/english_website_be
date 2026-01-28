import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * Exception Filter toàn cục
 * Bắt TẤT CẢ exception và format thành ApiResponse chuẩn
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Xác định HTTP status code
        let status: number;
        let message: string;
        let errorCode: string;
        let errorDetails: any;

        if (exception instanceof HttpException) {
            // Exception từ NestJS (UnauthorizedException, BadRequestException,...)
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
                errorCode = (exceptionResponse as any).error || exception.name;
                errorDetails = exceptionResponse;
            } else {
                message = exception.message;
                errorCode = exception.name;
            }
        } else {
            // Exception không xác định (lỗi hệ thống, database,...)
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            errorCode = 'INTERNAL_SERVER_ERROR';

            // Log lỗi không xác định để debug
            this.logger.error(
                `Unhandled exception: ${exception}`,
                exception instanceof Error ? exception.stack : '',
            );
        }

        // Format response theo chuẩn ApiResponse
        const errorResponse: ApiResponse<null> = {
            success: false,
            message: message,
            error: {
                code: errorCode,
                details: errorDetails,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            statusCode: status,
        };

        // Trả về response với status code tương ứng
        response.status(status).json(errorResponse);
    }
}