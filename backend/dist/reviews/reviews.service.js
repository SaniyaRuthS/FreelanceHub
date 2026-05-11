"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { gig: true },
        });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        if (order.buyerId !== userId)
            throw new common_1.BadRequestException('Unauthorized');
        if (order.status !== client_1.OrderStatus.COMPLETED && order.status !== client_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Order must be completed or delivered to review');
        }
        const review = await this.prisma.review.create({
            data: {
                orderId: dto.orderId,
                rating: dto.rating,
                comment: dto.comment,
            },
        });
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
    async getGigReviews(gigId) {
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map