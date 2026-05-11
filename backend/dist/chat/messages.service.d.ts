import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    createMessage(data: {
        senderId: string;
        receiverId: string;
        content: string;
    }): Promise<{
        sender: {
            profile: {
                avatar: string;
            };
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    }>;
    findConversation(userId1: string, userId2: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    }[]>;
    findUserConversations(userId: string): Promise<any[]>;
}
