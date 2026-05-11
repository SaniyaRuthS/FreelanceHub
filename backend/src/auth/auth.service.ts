import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerificationService } from './verification.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationService: VerificationService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: (dto.role as string).toUpperCase() as any,
        isVerified: false, // Force false on registration
        verificationScore: 0,
      },
    });

    // Create a base profile
    await this.prisma.profile.create({
      data: {
        userId: user.id,
      },
    });

    return this.generateToken(user.id, user.email, user.role, false);
  }

  async verifyIdentity(userId: string, idCardImage: string, selfieImage: string) {
    // 1. Simulate AI Face Match / OCR
    const result = await this.verificationService.verifyIdentity(idCardImage, selfieImage);

    // 2. Update user status in DB
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: result.success,
        verificationScore: result.score,
        idType: result.idType,
        idCardImage: idCardImage,
        selfieImage: selfieImage,
      },
    });

    if (!result.success) {
      throw new UnauthorizedException('Identity verification failed. Please ensure images are clear.');
    }

    // 3. Return fresh token with verified status
    return this.generateToken(updatedUser.id, updatedUser.email, updatedUser.role, true);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email, user.role, user.isVerified);
  }

  private async generateToken(userId: string, email: string, role: string, isVerified: boolean) {
    const payload = { sub: userId, email, role, isVerified };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: userId,
        email,
        role,
        isVerified,
      },
    };
  }
}
