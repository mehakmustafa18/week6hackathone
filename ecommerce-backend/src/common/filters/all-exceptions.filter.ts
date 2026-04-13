import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      this.logger.error(
        `[${request.method}] ${request.url} - Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // Handle MongoDB duplicate key error
    if ((exception as any)?.code === 11000) {
      status = HttpStatus.CONFLICT;
      const field = Object.keys((exception as any).keyPattern || {})[0];
      message = `${field || 'Field'} already exists`;
      error = 'Conflict';
    }

    // Handle MongoDB CastError (invalid ObjectId)
    if ((exception as any)?.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid ID format';
      error = 'Bad Request';
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}