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
exports.FreelancersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let FreelancersController = class FreelancersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchFreelancers(res, category, skill, q, minPrice, maxPrice, minRating, maxDelivery, pro, page, limit, sort) {
        try {
            const pageNum = parseInt(page || '1', 10);
            const limitNum = parseInt(limit || '12', 10);
            const skip = (pageNum - 1) * limitNum;
            const where = { role: 'SELLER' };
            const profileWhere = {};
            if (minRating)
                profileWhere.rating = { gte: parseFloat(minRating) };
            if (pro === '1' || pro === 'true')
                profileWhere.isPro = true;
            if (Object.keys(profileWhere).length > 0)
                where.profile = profileWhere;
            const gigWhere = {};
            if (category)
                gigWhere.category = { slug: category };
            if (skill)
                gigWhere.tags = { has: skill };
            const packageWhere = {};
            if (minPrice)
                packageWhere.price = { gte: parseFloat(minPrice) };
            if (maxPrice)
                packageWhere.price = { ...packageWhere.price, lte: parseFloat(maxPrice) };
            if (Object.keys(packageWhere).length > 0)
                gigWhere.packages = { some: packageWhere };
            if (Object.keys(gigWhere).length > 0)
                where.gigs = { some: gigWhere };
            if (q) {
                const searchStr = q.toLowerCase();
                where.OR = [
                    { name: { contains: searchStr, mode: 'insensitive' } },
                    { profile: { bio: { contains: searchStr, mode: 'insensitive' } } },
                    { profile: { skills: { has: searchStr } } },
                    { gigs: { some: { title: { contains: searchStr, mode: 'insensitive' } } } },
                ];
            }
            let orderBy = { createdAt: 'desc' };
            if (sort === 'rating')
                orderBy = { profile: { rating: 'desc' } };
            else if (sort === 'reviews')
                orderBy = { profile: { totalReviews: 'desc' } };
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch freelancers",
                error: error.message
            });
        }
    }
    async getFreelancerById(id, res) {
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
};
exports.FreelancersController = FreelancersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search and filter freelancers' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'skill', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minRating', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxDelivery', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('skill')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('minRating')),
    __param(7, (0, common_1.Query)('maxDelivery')),
    __param(8, (0, common_1.Query)('pro')),
    __param(9, (0, common_1.Query)('page')),
    __param(10, (0, common_1.Query)('limit')),
    __param(11, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FreelancersController.prototype, "searchFreelancers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single freelancer by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FreelancersController.prototype, "getFreelancerById", null);
exports.FreelancersController = FreelancersController = __decorate([
    (0, swagger_1.ApiTags)('freelancers'),
    (0, common_1.Controller)('api/freelancers'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FreelancersController);
function transformPackage(pkg) {
    if (!pkg)
        return { price: 0, delivery: '3 Days', features: [] };
    return {
        price: pkg.price,
        delivery: `${pkg.deliveryTime} Days`,
        features: pkg.features || []
    };
}
//# sourceMappingURL=freelancers.controller.js.map