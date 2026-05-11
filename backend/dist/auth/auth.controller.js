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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const verification_service_1 = require("./verification.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService, verificationService) {
        this.authService = authService;
        this.verificationService = verificationService;
    }
    async verifyIdentity(req, files, res) {
        try {
            const user = req.user;
            if (!files.idCard || !files.selfie) {
                return res.status(400).json({
                    success: false,
                    message: "Both ID card and Selfie are required."
                });
            }
            const idCardPath = files.idCard[0].path;
            const selfiePath = files.selfie[0].path;
            console.log(`Starting verification for user ${user.id}`);
            const result = await this.authService.verifyIdentity(user.id, idCardPath, selfiePath);
            return res.status(200).json({
                success: true,
                message: "Identity verified successfully!",
                data: result
            });
        }
        catch (error) {
            console.error('Verification Error:', error.message);
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Identity verification failed.",
            });
        }
    }
    async register(dto, res) {
        try {
            const result = await this.authService.register(dto);
            return res.status(201).json({
                success: true,
                message: "Registration successful",
                data: result
            });
        }
        catch (error) {
            console.error(error);
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || "Registration failed",
            });
        }
    }
    async login(dto, res) {
        try {
            const result = await this.authService.login(dto);
            return res.status(200).json({
                success: true,
                token: result.access_token,
                user: result.user
            });
        }
        catch (error) {
            console.error(error);
            return res.status(error.status || 401).json({
                success: false,
                message: error.message || "Login failed",
            });
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('verify-identity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'idCard', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Only JPG and PNG files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Securely verify identity with ID card and selfie' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyIdentity", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user and get token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        verification_service_1.VerificationService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map