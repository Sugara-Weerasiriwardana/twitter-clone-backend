import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CommentService } from './comments.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':postId')
  createComment(
    @Param('postId') postId: string,
    @Body() body: { authorId: string; content: string; parentCommentId?: string }
  ) {
    return this.commentService.create(postId, body.authorId, body.content, body.parentCommentId);
  }

  @Get(':postId')
  getComments(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }
}
