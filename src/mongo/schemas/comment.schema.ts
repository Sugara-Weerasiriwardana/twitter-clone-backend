// comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId; // Reference to the post

  @Prop({ required: true })
  authorId: string; // PostgreSQL user ID (UUID)

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentCommentId?: Types.ObjectId; // Null if top-level comment

  @Prop({ required: true })
  content: string;

  @Prop([String])
  likes: string[]; // Store user IDs who liked the comment
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
