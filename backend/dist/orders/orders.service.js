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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = require("stripe");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-11-20.acacia',
        });
    }
    async createCheckoutSession(userId, dto) {
        const gig = await this.prisma.gig.findUnique({
            where: { id: dto.gigId },
            include: {
                packages: {
                    where: { id: dto.packageId },
                },
            },
        });
        if (!gig || gig.packages.length === 0) {
            throw new common_1.NotFoundException('Gig or Package not found');
        }
        const gigPackage = gig.packages[0];
        const order = await this.prisma.order.create({
            data: {
                buyerId: userId,
                gigId: gig.id,
                packageId: gigPackage.id,
                amount: gigPackage.price,
                status: client_1.OrderStatus.PENDING,
            },
        });
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: gig.title,
                            description: gigPackage.name,
                            images: gig.images,
                        },
                        unit_amount: Math.round(gigPackage.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${this.configService.get('FRONTEND_URL')}/orders/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/gigs/${gig.id}`,
            metadata: {
                orderId: order.id,
            },
        });
        await this.prisma.order.update({
            where: { id: order.id },
            data: { paymentIntentId: session.id },
        });
        return { checkoutUrl: session.url };
    }
    async handleWebhook(signature, payload) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata.orderId;
            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.PAID,
                },
            });
        }
        return { received: true };
    }
    async findUserOrders(userId) {
        return this.prisma.order.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { gig: { sellerId: userId } },
                ],
            },
            include: {
                gig: true,
                package: true,
                buyer: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map