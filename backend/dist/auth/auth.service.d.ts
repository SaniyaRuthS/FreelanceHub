import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerificationService } from './verification.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private verificationService;
    constructor(prisma: PrismaService, jwtService: JwtService, verificationService: VerificationService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            isVerified: boolean;
        };
    }>;
    verifyIdentity(userId: string, idCardImage: string, selfieImage: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            isVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            isVerified: boolean;
        };
    }>;
    private generateToken;
}
