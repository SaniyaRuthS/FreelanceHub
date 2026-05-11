import { IsString, IsArray, IsOptional, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PackageType } from '@prisma/client';

export class CreateGigPackageDto {
  @IsEnum(PackageType)
  type: PackageType;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  deliveryTime: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}

export class CreateGigDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGigPackageDto)
  packages: CreateGigPackageDto[];
}

export class GetGigsFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;
}
