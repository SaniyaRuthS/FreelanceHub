import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('freelancers')
@Controller('api/freelancers')
export class FreelancersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter freelancers' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'skill', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'maxDelivery', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  async searchFreelancers(
    @Res() res: any,
    @Query('category') category?: string,
    @Query('skill') skill?: string,
    @Query('q') q?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minRating') minRating?: string,
    @Query('maxDelivery') maxDelivery?: string,
    @Query('pro') pro?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    try {
      const pageNum = parseInt(page || '1', 10);
      const limitNum = parseInt(limit || '12', 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { role: 'SELLER' };
      const profileWhere: any = {};
      if (minRating) profileWhere.rating = { gte: parseFloat(minRating) };
      if (pro === '1' || pro === 'true') profileWhere.isPro = true;
      if (Object.keys(profileWhere).length > 0) where.profile = profileWhere;

      const gigWhere: any = {};
      if (category) gigWhere.category = { slug: category };
      if (skill) gigWhere.tags = { has: skill };

      const packageWhere: any = {};
      if (minPrice) packageWhere.price = { gte: parseFloat(minPrice) };
      if (maxPrice) packageWhere.price = { ...packageWhere.price, lte: parseFloat(maxPrice) };
      if (Object.keys(packageWhere).length > 0) gigWhere.packages = { some: packageWhere };
      if (Object.keys(gigWhere).length > 0) where.gigs = { some: gigWhere };

      if (q) {
        const searchStr = q.toLowerCase();
        where.OR = [
          { name: { contains: searchStr, mode: 'insensitive' } },
          { profile: { bio: { contains: searchStr, mode: 'insensitive' } } },
          { profile: { skills: { has: searchStr } } },
          { gigs: { some: { title: { contains: searchStr, mode: 'insensitive' } } } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'rating') orderBy = { profile: { rating: 'desc' } };
      else if (sort === 'reviews') orderBy = { profile: { totalReviews: 'desc' } };

      const [freelancers, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            profile: true,
            gigs: {
              take: 3,
              include: {
                category: true,
                packages: { take: 1, orderBy: { price: 'asc' } },
              },
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        this.prisma.user.count({ where }),
      ]);

      const data = freelancers.map((user) => {
        const firstGig = user.gigs?.[0];
        const pkgs = firstGig?.packages || [];
        const basicPkg = pkgs.find(p => p.type === 'BASIC') || pkgs[0];

        return {
          id: user.id,
          name: user.name,
          title: firstGig?.title || user.profile?.bio?.split('.')[0] || 'Freelancer',
          category: firstGig?.category?.slug || 'unassigned',
          skill: firstGig?.tags?.[0] || 'general',
          rating: user.profile?.rating || 0,
          reviews: user.profile?.totalReviews || 0,
          price: basicPkg?.price || 0,
          location: user.profile?.location || 'Remote',
          portfolioImages: firstGig?.images || [],
          isPro: user.profile?.isPro || false,
          isVerified: user.isVerified,
          avatar: user.profile?.avatar || `https://i.pravatar.cc/300?u=${user.id}`,
          bio: user.profile?.bio || '',
        };
      });

      return res.status(200).json({
        success: true,
        message: "Freelancers fetched successfully",
        data,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch freelancers",
        error: error.message
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single freelancer by ID' })
  async getFreelancerById(@Param('id') id: string, @Res() res: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          gigs: {
            include: {
              category: true,
              packages: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Freelancer not found"
        });
      }

      const firstGig = user.gigs?.[0];
      const pkgs = firstGig?.packages || [];
      const packages = {
        basic: transformPackage(pkgs.find(p => p.type === 'BASIC')),
        standard: transformPackage(pkgs.find(p => p.type === 'STANDARD')),
        premium: transformPackage(pkgs.find(p => p.type === 'PREMIUM')),
      };

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          title: firstGig?.title || user.profile?.bio?.split('.')[0] || 'Freelancer',
          category: firstGig?.category?.slug || 'unassigned',
          skill: firstGig?.tags?.[0] || 'general',
          rating: user.profile?.rating || 0,
          reviews: user.profile?.totalReviews || 0,
          price: packages.basic.price || 0,
          location: user.profile?.location || 'Remote',
          portfolioImages: firstGig?.images || [],
          isPro: user.profile?.isPro || false,
          isVerified: user.isVerified,
          avatar: user.profile?.avatar || `https://i.pravatar.cc/300?u=${user.id}`,
          bio: user.profile?.bio || '',
          memberSince: user.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          languages: user.profile?.languages || ['English'],
          packages: packages
        }
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

function transformPackage(pkg: any) {
  if (!pkg) return { price: 0, delivery: '3 Days', features: [] };
  return {
    price: pkg.price,
    delivery: `${pkg.deliveryTime} Days`,
    features: pkg.features || []
  };
}


