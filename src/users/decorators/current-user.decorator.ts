import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Get current logged in user from request and this will run secondly
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);
