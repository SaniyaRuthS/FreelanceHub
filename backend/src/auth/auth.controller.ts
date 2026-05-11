import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Res, 
  UseGuards, 
  Req, 
  UseInterceptors, 
  UploadedFiles 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService
  ) {}

  @Post('verify-identity')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'idCard', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only JPG and PNG files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  @ApiOperation({ summary: 'Securely verify identity with ID card and selfie' })
  async verifyIdentity(
    @Req() req: any,
    @UploadedFiles() files: { idCard?: Express.Multer.File[], selfie?: Express.Multer.File[] },
    @Res() res: Response
  ) {
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
    } catch (error: any) {
      console.error('Verification Error:', error.message);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Identity verification failed.",
      });
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    try {
      const result = await this.authService.register(dto);
      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result
      });
    } catch (error: any) {
      console.error(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get token' })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(dto);
      return res.status(200).json({
        success: true,
        token: result.access_token,
        user: result.user
      });
    } catch (error: any) {
      console.error(error);
      return res.status(error.status || 401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }
}
