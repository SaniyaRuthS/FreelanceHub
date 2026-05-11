import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerificationService } from './verification.service';
export declare class AuthController {
    private authService;
    private verificationService;
    constructor(authService: AuthService, verificationService: VerificationService);
    verifyIdentity(req: any, files: {
        idCard?: Express.Multer.File[];
        selfie?: Express.Multer.File[];
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    register(dto: RegisterDto, res: Response): Promise<Response<any, Record<string, any>>>;
    login(dto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
