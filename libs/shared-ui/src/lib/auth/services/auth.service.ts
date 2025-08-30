import { Observable } from 'rxjs';
import {
  ISignInPayload,
  ISignUpPayload,
} from '../interfaces/submit-payload.interface';
import { IAuthLogin } from '@shared/src';

export abstract class AuthService {
  abstract signIn(payload: ISignInPayload): Observable<IAuthLogin>;

  abstract signUp(payload: ISignUpPayload): Observable<IAuthLogin>;
}
