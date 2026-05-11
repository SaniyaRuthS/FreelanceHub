"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const verification_service_1 = require("./verification.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, verificationService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.verificationService = verificationService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                role: dto.role.toUpperCase(),
                isVerified: false,
                verificationScore: 0,
            },
        });
        await this.prisma.profile.create({
            data: {
                userId: user.id,
            },
        });
        return this.generateToken(user.id, user.email, user.role, false);
    }
    async verifyIdentity(userId, idCardImage, selfieImage) {
        const result = await this.verificationService.verifyIdentity(idCardImage, selfieImage);
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
            throw new common_1.UnauthorizedException('Identity verification failed. Please ensure images are clear.');
        }
        return this.generateToken(updatedUser.id, updatedUser.email, updatedUser.role, true);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.generateToken(user.id, user.email, user.role, user.isVerified);
    }
    async generateToken(userId, email, role, isVerified) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        verification_service_1.VerificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map