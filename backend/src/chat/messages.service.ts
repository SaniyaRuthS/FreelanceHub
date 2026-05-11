import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: { senderId: string; receiverId: string; content: string }) {
    return this.prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
      },
      include: {
        sender: {
          select: { name: true, profile: { select: { avatar: true } } },
        },
      },
    });
  }

  async findConversation(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findUserConversations(userId: string) {
    // This is a simplified version to get unique conversation partners
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, profile: { select: { avatar: true } } } },
        receiver: { select: { id: true, name: true, profile: { select: { avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const partners = new Map();
    messages.forEach((msg) => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partners.has(partner.id)) {
        partners.set(partner.id, {
          partner,
          lastMessage: msg.content,
          time: msg.createdAt,
        });
      }
    });

    return Array.from(partners.values());
  }
}
