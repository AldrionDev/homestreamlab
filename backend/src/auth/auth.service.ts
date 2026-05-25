import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register() {
    return {
      message: 'Register endpoint placeholder',
    };
  }

  login() {
    return {
      message: 'Login endpoint placeholder',
    };
  }
}
