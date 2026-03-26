import { AuthFormKeys } from '../enums/auth-form-keys.enum';

export interface IAuthForm {
  [AuthFormKeys.EMAIL]: string;
  [AuthFormKeys.USERNAME]: string;
  [AuthFormKeys.PASSWORD]: string;
  [AuthFormKeys.CONFIRM_PASSWORD]: string;
}
