export class CreateUserDto {
  username: string;
  email: string;
  createdAt: Date;
  password?: string;
}
