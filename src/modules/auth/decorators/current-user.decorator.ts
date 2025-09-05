import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to get the current authenticated user's ID from the request
 * Usage: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.sub;
    },
);
