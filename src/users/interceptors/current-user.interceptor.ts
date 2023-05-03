import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

// This will run first and assign the current user to the request to be able to use the decorator
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  // Make use of dependencies injection to get a copy of User Service
  constructor(private userService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};
    if (userId) {
      const user = await this.userService.findOne(userId);
      request.currentUser = user;
    }
    return handler.handle(); // Call the next route handler
  }
}

// Get current logged in user
