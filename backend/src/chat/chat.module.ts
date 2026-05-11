import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, MessagesService],
  exports: [MessagesService],
})
export class ChatModule {}
