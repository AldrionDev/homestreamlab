import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'jane@example.com',
    passwordHash: bcrypt.hashSync('correct-password', 4),
    displayName: 'Jane',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; createUser: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(() => {
    usersService = { findByEmail: jest.fn(), createUser: jest.fn() };
    jwtService = { signAsync: jest.fn() };
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('throws ConflictException when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          email: 'jane@example.com',
          password: 'new-password',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password and returns a user without passwordHash', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createUser.mockImplementation(
        (data: Record<string, unknown>) => Promise.resolve(buildUser(data)),
      );

      const result = await service.register({
        email: 'jane@example.com',
        password: 'plain-password',
        displayName: 'Jane',
      });

      const createdCalls = usersService.createUser.mock.calls as Array<
        [{ passwordHash: string }]
      >;
      const createdData = createdCalls[0][0];
      expect(createdData.passwordHash).toEqual(expect.any(String));
      expect(createdData.passwordHash).not.toBe('plain-password');

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'whatever' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('throws UnauthorizedException with the same message for a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.login({
          email: 'jane@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('returns an accessToken and a safe user object on success', async () => {
      const user = buildUser();
      usersService.findByEmail.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('fake-token');

      const result = await service.login({
        email: 'jane@example.com',
        password: 'correct-password',
      });

      expect(result).toEqual({
        accessToken: 'fake-token',
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });
});
