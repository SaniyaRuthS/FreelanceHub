import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getTailoredGigs(userId: string) {
    // 1. Get user's recent orders to identify preferred categories
    const userOrders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      select: { gig: { select: { categoryId: true } } },
      take: 5,
    });

    const preferredCategoryIds = Array.from(new Set(userOrders.map((o) => o.gig.categoryId)));

    // 2. Fetch top-rated gigs in those categories that the user hasn't bought yet
    const recommendations = await this.prisma.gig.findMany({
      where: {
        categoryId: { in: preferredCategoryIds },
        orders: {
          none: { buyerId: userId },
        },
      },
      include: {
        seller: { include: { profile: true } },
        packages: { take: 1 },
      },
      orderBy: { rating: 'desc' },
      take: 8,
    });

    // 3. Fallback: If no history, return top-rated gigs across all categories
    if (recommendations.length < 4) {
      const globalTop = await this.prisma.gig.findMany({
        include: {
          seller: { include: { profile: true } },
          packages: { take: 1 },
        },
        orderBy: { rating: 'desc' },
        take: 8,
      });
      return globalTop;
    }

    return recommendations;
  }
}
