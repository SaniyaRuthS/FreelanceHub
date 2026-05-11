import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    server: Server;
    constructor(messagesService: MessagesService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(userId: string, client: Socket): void;
    handleMessage(data: {
        senderId: string;
        receiverId: string;
        content: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        senderId: string;
        receiverId: string;
    }, client: Socket): void;
}
