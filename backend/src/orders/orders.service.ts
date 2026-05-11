import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/orders.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }

  async createCheckoutSession(userId: string, dto: CreateOrderDto) {
    const gig = await this.prisma.gig.findUnique({
      where: { id: dto.gigId },
      include: {
        packages: {
          where: { id: dto.packageId },
        },
      },
    });

    if (!gig || gig.packages.length === 0) {
      throw new NotFoundException('Gig or Package not found');
    }

    const gigPackage = gig.packages[0];

    // Create a pending order in our database
    const order = await this.prisma.order.create({
      data: {
        buyerId: userId,
        gigId: gig.id,
        packageId: gigPackage.id,
        amount: gigPackage.price,
        status: OrderStatus.PENDING,
      },
    });

    // Create Stripe Checkout Session
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
            unit_amount: Math.round(gigPackage.price * 100), // Stripe expects cents
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

    // Store payment intent ID if available
    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: session.id },
    });

    return { checkoutUrl: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata.orderId;

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
        },
      });
    }

    return { received: true };
  }

  async findUserOrders(userId: string) {
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
}
