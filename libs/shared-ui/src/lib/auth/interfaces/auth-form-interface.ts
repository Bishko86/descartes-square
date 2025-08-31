import { AuthFormKeys } from '../enums/auth-form-keys.enum';
import { Maybe } from '@shared/src';

export interface IAuthForm {
  [AuthFormKeys.EMAIL]: Maybe<string>;
  [AuthFormKeys.USERNAME]?: Maybe<string>;
  [AuthFormKeys.PASSWORD]: Maybe<string>;
  [AuthFormKeys.CONFIRM_PASSWORD]?: Maybe<string>;
}
