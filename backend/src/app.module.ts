import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GigsModule } from './gigs/gigs.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { FreelancersModule } from './freelancers/freelancers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    GigsModule,
    OrdersModule,
    ChatModule,
    RedisModule,
    ReviewsModule,
    RecommendationModule,
    FreelancersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
