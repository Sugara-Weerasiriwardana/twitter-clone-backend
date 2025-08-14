import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId; 

  @Prop({ required: true })
  authorId: string; 

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentCommentId?: Types.ObjectId; 

  @Prop({ required: true })
  content: string;

  @Prop([String])
  likes: string[]; 

  createdAt?: Date; 
}

export const CommentSchema = SchemaFactory.createForClass(Comment);


CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ likes: 1 });
