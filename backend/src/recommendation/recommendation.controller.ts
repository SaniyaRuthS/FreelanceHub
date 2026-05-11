import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recommendations')
@Controller('api/recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get('tailored')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tailored gig recommendations for the current user' })
  getTailored(@Req() req: any) {
    return this.recommendationService.getTailoredGigs(req.user.id);
  }
}
