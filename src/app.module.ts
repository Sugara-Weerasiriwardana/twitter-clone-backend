import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MediaModule } from './media/media.module';
import { PollsModule } from './polls/polls.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    PrismaModule,
    PostsModule,
    CloudinaryModule,
    MediaModule,
    PollsModule,
    RedisModule,  
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',
      realm: 'twitter-clone',
      clientId: 'twitter-backend',
      secret: 'EUfu1au8HcNP7lIHQnxY4OrzBLwNESTQ', 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
