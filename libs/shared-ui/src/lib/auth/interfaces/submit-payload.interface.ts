import { IAuthForm } from './auth-form-interface';
export interface IAuthSubmit {
  isSignUp: boolean;
  payload: IAuthForm;
}
