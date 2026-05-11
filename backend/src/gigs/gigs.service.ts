import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGigDto, GetGigsFilterDto } from './dto/gigs.dto';

@Injectable()
export class GigsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: any,
  ) {}

  async findAll(filter: GetGigsFilterDto) {
    const { category, search, minPrice, maxPrice, rating } = filter;
    
    const cacheKey = `gigs_search:${JSON.stringify(filter)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where: any = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (maxPrice || minPrice) {
      where.packages = {
        some: {
          price: {
            gte: minPrice ? parseFloat(minPrice.toString()) : undefined,
            lte: maxPrice ? parseFloat(maxPrice.toString()) : undefined,
          },
        },
      };
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating.toString()) };
    }

    const gigs = await this.prisma.gig.findMany({
      where,
      include: {
        seller: {
          select: {
            name: true,
            profile: {
              select: {
                avatar: true,
                isPro: true,
                rating: true,
              },
            },
          },
        },
        packages: {
          take: 1,
          orderBy: { price: 'asc' },
        },
      },
    });

    await this.redis.set(cacheKey, JSON.stringify(gigs), 'EX', 300); // 5 min cache
    return gigs;
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) return [];

    const cacheKey = `suggestions:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const gigs = await this.prisma.gig.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
      },
      select: { title: true },
      take: 5,
    });

    const suggestions = gigs.map((g) => g.title);
    await this.redis.set(cacheKey, JSON.stringify(suggestions), 'EX', 3600); // 1 hour cache
    return suggestions;
  }

  async findOne(id: string) {
    const gig = await this.prisma.gig.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
        category: true,
        packages: {
          orderBy: { price: 'asc' },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { review: true },
        },
      },
    });

    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    return gig;
  }

  async create(sellerId: string, dto: CreateGigDto) {
    return this.prisma.gig.create({
      data: {
        sellerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        images: dto.images,
        tags: dto.tags,
        packages: {
          create: dto.packages,
        },
      },
    });
  }
}
