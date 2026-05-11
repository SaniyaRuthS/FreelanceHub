import { PrismaService } from '../prisma/prisma.service';
import { CreateGigDto, GetGigsFilterDto } from './dto/gigs.dto';
export declare class GigsService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: any);
    findAll(filter: GetGigsFilterDto): Promise<any>;
    getSuggestions(query: string): Promise<any>;
    findOne(id: string): Promise<{
        category: {
            description: string | null;
            name: string;
            id: string;
            slug: string;
        };
        packages: {
            type: import(".prisma/client").$Enums.PackageType;
            description: string;
            name: string;
            id: string;
            price: number;
            deliveryTime: number;
            features: string[];
            gigId: string;
        }[];
        seller: {
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bio: string | null;
                avatar: string | null;
                skills: string[];
                languages: string[];
                location: string | null;
                rating: number;
                totalReviews: number;
                isPro: boolean;
                userId: string;
            };
        } & {
            email: string;
            password: string | null;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            idType: string | null;
            idCardImage: string | null;
            selfieImage: string | null;
            id: string;
            googleId: string | null;
            isVerified: boolean;
            verificationScore: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        orders: ({
            review: {
                id: string;
                createdAt: Date;
                rating: number;
                orderId: string;
                comment: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gigId: string;
            buyerId: string;
            packageId: string;
            amount: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentIntentId: string | null;
        })[];
    } & {
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        totalReviews: number;
        tags: string[];
        categoryId: string;
        images: string[];
        sellerId: string;
    }>;
    create(sellerId: string, dto: CreateGigDto): Promise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        totalReviews: number;
        tags: string[];
        categoryId: string;
        images: string[];
        sellerId: string;
    }>;
}
