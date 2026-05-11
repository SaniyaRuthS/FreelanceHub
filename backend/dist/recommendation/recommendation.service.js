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
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecommendationService = class RecommendationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTailoredGigs(userId) {
        const userOrders = await this.prisma.order.findMany({
            where: { buyerId: userId },
            select: { gig: { select: { categoryId: true } } },
            take: 5,
        });
        const preferredCategoryIds = Array.from(new Set(userOrders.map((o) => o.gig.categoryId)));
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
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map