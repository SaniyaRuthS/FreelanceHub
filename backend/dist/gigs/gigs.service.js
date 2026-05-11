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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GigsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GigsService = class GigsService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(filter) {
        const { category, search, minPrice, maxPrice, rating } = filter;
        const cacheKey = `gigs_search:${JSON.stringify(filter)}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const where = {};
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
        await this.redis.set(cacheKey, JSON.stringify(gigs), 'EX', 300);
        return gigs;
    }
    async getSuggestions(query) {
        if (!query || query.length < 2)
            return [];
        const cacheKey = `suggestions:${query.toLowerCase()}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const gigs = await this.prisma.gig.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' },
            },
            select: { title: true },
            take: 5,
        });
        const suggestions = gigs.map((g) => g.title);
        await this.redis.set(cacheKey, JSON.stringify(suggestions), 'EX', 3600);
        return suggestions;
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException('Gig not found');
        }
        return gig;
    }
    async create(sellerId, dto) {
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
};
exports.GigsService = GigsService;
exports.GigsService = GigsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], GigsService);
//# sourceMappingURL=gigs.service.js.map