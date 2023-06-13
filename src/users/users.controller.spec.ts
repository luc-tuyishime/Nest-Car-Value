import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { User } from './user.Entity';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  // Partial means we're going to implement a couple of properties or method of the UsersService
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@gmail.com',
          password: 'asdf',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'asdf' } as User]);
      },
      //   remove: () => {},
      //   update: () => {},
    };
    fakeAuthService = {
      //   signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController], // Creating a copy of the controller
      providers: [
        {
          provide: UsersService, // whenever someone ask for the UserService
          useValue: fakeUsersService, // gives the the fakeUserService
        },
        {
          provide: AuthService, //
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@gmail.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@gmail.com');
  });

  it('Find user returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('Signin updates session object and returns user', async () => {
    const sessionObject = { userId: -10 };
    const user = await controller.signin(
      { email: 'asdf@gmail.com', password: 'asdf' },
      sessionObject,
    );

    expect(user.id).toEqual(1);
    expect(sessionObject.userId).toEqual(1);
  });
});
