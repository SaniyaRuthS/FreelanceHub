import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @ApiProperty({ example: 'BUYER', enum: ['BUYER', 'SELLER'] })
  @IsString()
  role: 'BUYER' | 'SELLER';

  @IsOptional()
  @IsString()
  idType?: string;

  @IsOptional()
  @IsString()
  idCardImage?: string;

  @IsOptional()
  @IsString()
  selfieImage?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
