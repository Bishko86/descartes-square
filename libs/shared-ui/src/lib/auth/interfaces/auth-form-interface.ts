import { AuthFormKeys } from '../enums/auth-form-keys.enum';

export interface IAuthForm {
  [AuthFormKeys.EMAIL]: string | null;
  [AuthFormKeys.USERNAME]: string | null;
  [AuthFormKeys.PASSWORD]: string | null;
  [AuthFormKeys.CONFIRM_PASSWORD]: string | null;
}
