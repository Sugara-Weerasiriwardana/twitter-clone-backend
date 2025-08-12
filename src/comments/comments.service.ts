import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../mongo/schemas/comment.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private notificationsService: NotificationsService,  // <-- inject service
  ) {}

  async create(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string,
  ) {
    this.logger.log(`Creating comment by user ${authorId} on post ${postId}`);

    const created = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId,
      content,
      parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
    });
    this.logger.log(`Comment created with id: ${created._id}`);

    const post = await this.postModel.findById(postId).lean();
    if (!post) {
      this.logger.warn(`Post with id ${postId} not found`);
      throw new Error('Post not found');
    }
    this.logger.log(`Post found with authorId: ${post.authorId}`);

    
    await this.notificationsService.create(
      post.authorId,
      parentCommentId ? 'reply' : 'comment',
      content,
      { postId, commentId: created._id.toString() },
    );

    return created;
  }

  async findByPost(postId: string) {
    this.logger.log(`Fetching comments for post ${postId}`);
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId), parentCommentId: null })
      .lean();
  }
}