import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../mongo/schemas/comment.schema';
import { NotificationsService } from '../notifications/notifications.service';  // <-- inject service

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,  // <-- use service, not gateway
  ) {}

  async create(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string,
  ) {
    const created = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId,
      content,
      parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
    });

    // send notification via service (which internally uses gateway)
    await this.notificationsService.create(authorId, parentCommentId ? 'reply' : 'comment', content, { postId });

    return created;
  }

  async findByPost(postId: string) {
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId), parentCommentId: null })
      .lean();
  }
}
