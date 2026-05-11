import { PrismaService } from '../prisma/prisma.service';
export declare class RecommendationService {
    private prisma;
    constructor(prisma: PrismaService);
    getTailoredGigs(userId: string): Promise<({
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
    })[]>;
}
