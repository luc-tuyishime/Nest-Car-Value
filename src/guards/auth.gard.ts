import { CanActivate, ExecutionContext } from '@nestjs/common';

// This function is used to make sure users who are authenticated are allowed to access certain routes
export class AuthGuard implements CanActivate {
  // execution context refer to an incoming request
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.session.userId;
  }
}
