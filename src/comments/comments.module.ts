import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../mongo/schemas/comment.schema';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    NotificationsModule,
    PostsModule
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService], 
})
export class CommentsModule {}
