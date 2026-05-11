import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/orders.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    createCheckout(req: any, dto: CreateOrderDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyOrders(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    webhook(signature: string, req: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
