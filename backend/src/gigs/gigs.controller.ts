import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GigsService } from './gigs.service';
import { CreateGigDto, GetGigsFilterDto } from './dto/gigs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gigs')
@Controller('api/gigs')
export class GigsController {
  constructor(private gigsService: GigsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all gigs with filters' })
  findAll(@Query() filter: GetGigsFilterDto) {
    return this.gigsService.findAll(filter);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Get search suggestions (autocomplete)' })
  suggest(@Query('q') query: string) {
    return this.gigsService.getSuggestions(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single gig by ID' })
  findOne(@Param('id') id: string) {
    return this.gigsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new gig (Sellers only)' })
  create(@Req() req: any, @Body() dto: CreateGigDto) {
    return this.gigsService.create(req.user.id, dto);
  }
}
