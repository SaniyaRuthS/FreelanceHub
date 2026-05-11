import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { gig: true },
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.buyerId !== userId) throw new BadRequestException('Unauthorized');
    if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Order must be completed or delivered to review');
    }

    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    // Update Gig and Seller Rating (Simplified)
    const reviews = await this.prisma.review.findMany({
      where: { order: { gigId: order.gigId } },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.gig.update({
      where: { id: order.gigId },
      data: {
        rating: avgRating,
        totalReviews: reviews.length,
      },
    });

    return review;
  }

  async getGigReviews(gigId: string) {
    return this.prisma.review.findMany({
      where: { order: { gigId } },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, profile: { select: { avatar: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
