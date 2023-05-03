import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  // here we're doing depenency injection by injecting the UsersService
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see if email is in use already
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // Hash the users password
    // Generate a Salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hash and Salt together
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it in the
    const user = this.usersService.create(email, result);

    // return the new user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new BadRequestException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
