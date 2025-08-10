// comments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../mongo/schemas/comment.schema';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }])
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService], // Export if other modules need comment logic
})
export class CommentsModule {}
