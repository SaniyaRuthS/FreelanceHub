import { Controller, Get, Post, Body, UseGuards, Req, Headers, BadRequestException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  async createCheckout(@Req() req: any, @Body() dto: CreateOrderDto, @Res() res: Response) {
    try {
      const session = await this.ordersService.createCheckoutSession(req.user.id, dto);
      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
        error: error.message
      });
    }
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders for the current user' })
  async getMyOrders(@Req() req: any, @Res() res: Response) {
    try {
      const orders = await this.ordersService.findUserOrders(req.user.id);
      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      });
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async webhook(@Headers('stripe-signature') signature: string, @Req() req: any, @Res() res: Response) {
    try {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
      }
      const result = await this.ordersService.handleWebhook(signature, req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Webhook processing failed",
        error: error.message
      });
    }
  }
}
