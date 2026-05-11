import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/orders.dto';
export declare class OrdersService {
    private prisma;
    private configService;
    private stripe;
    constructor(prisma: PrismaService, configService: ConfigService);
    createCheckoutSession(userId: string, dto: CreateOrderDto): Promise<{
        checkoutUrl: string;
    }>;
    handleWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
    findUserOrders(userId: string): Promise<({
        gig: {
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
        };
        buyer: {
            email: string;
            name: string;
        };
        package: {
            type: import(".prisma/client").$Enums.PackageType;
            description: string;
            name: string;
            id: string;
            price: number;
            deliveryTime: number;
            features: string[];
            gigId: string;
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
    })[]>;
}
