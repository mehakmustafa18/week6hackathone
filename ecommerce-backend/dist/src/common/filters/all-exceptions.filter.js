"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger('ExceptionFilter');
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || exception.name;
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            this.logger.error(`[${request.method}] ${request.url} - Unhandled exception: ${exception.message}`, exception.stack);
        }
        if (exception?.code === 11000) {
            status = common_1.HttpStatus.CONFLICT;
            const field = Object.keys(exception.keyPattern || {})[0];
            message = `${field || 'Field'} already exists`;
            error = 'Conflict';
        }
        if (exception?.name === 'CastError') {
            status = common_1.HttpStatus.BAD_REQUEST;
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map