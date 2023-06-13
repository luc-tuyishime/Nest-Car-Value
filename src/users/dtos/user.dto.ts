import { Expose } from 'class-transformer';

// Dto mean data transfer object. It defines how data will be send.
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
