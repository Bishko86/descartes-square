export class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  refreshToken?: string;
  isVerified?: boolean;
  verifiedAt?: Date | null;
  locale?: string;
}
