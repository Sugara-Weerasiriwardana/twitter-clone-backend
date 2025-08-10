import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../mongo/schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(postId: string, authorId: string, content: string, parentCommentId?: string) {
    return this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId,
      content,
      parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : null
    });
  }

  async findByPost(postId: string) {
    return this.commentModel.find({ postId: new Types.ObjectId(postId), parentCommentId: null }).lean();
  }
}
