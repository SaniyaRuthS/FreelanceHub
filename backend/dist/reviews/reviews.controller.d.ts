import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviews.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    getGigReviews(gigId: string): Promise<({
        order: {
            buyer: {
                profile: {
                    avatar: string;
                };
                name: string;
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
        };
    } & {
        id: string;
        createdAt: Date;
        rating: number;
        orderId: string;
        comment: string;
    })[]>;
    create(req: any, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        rating: number;
        orderId: string;
        comment: string;
    }>;
}
