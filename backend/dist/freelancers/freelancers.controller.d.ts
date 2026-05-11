import { PrismaService } from '../prisma/prisma.service';
export declare class FreelancersController {
    private prisma;
    constructor(prisma: PrismaService);
    searchFreelancers(res: any, category?: string, skill?: string, q?: string, minPrice?: string, maxPrice?: string, minRating?: string, maxDelivery?: string, pro?: string, page?: string, limit?: string, sort?: string): Promise<any>;
    getFreelancerById(id: string, res: any): Promise<any>;
}
