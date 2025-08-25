import { Observable } from 'rxjs';
import {
  ISignInPayload,
  ISignUpPayload,
} from '../interfaces/submit-payload.interface';

export abstract class AuthService {
  abstract signIn(payload: ISignInPayload): Observable<unknown>;

  abstract signUp(payload: ISignUpPayload): Observable<unknown>;
}
