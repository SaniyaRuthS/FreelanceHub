import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'gig-uuid-here' })
  @IsString()
  @IsNotEmpty()
  gigId: string;

  @ApiProperty({ example: 'package-uuid-here' })
  @IsString()
  @IsNotEmpty()
  packageId: string;
}
