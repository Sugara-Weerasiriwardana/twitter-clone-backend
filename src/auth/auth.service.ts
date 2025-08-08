import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hash },
    });

    const token = this.signToken(user.id, user.email);

    return {
      message: 'User signed up successfully',
      ...token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const pwMatches = await bcrypt.compare(password, user.password);
    if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.id, user.email);

    return {
      message: 'Login successful',
      ...token,
    };
  }

  private signToken(userId: String, email: string): { access_token: string } {
    const payload = { sub: userId, email };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }
}
