import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  authorId: string;

  @Prop([String])
  media: string[];

  @Prop([String])
  hashtags: string[];

  @Prop([String])
  mentions: string[];

  @Prop({ type: String, ref: 'Poll' })
  poll_id?: string;

  @Prop([String])
  likes: string[];

  @Prop([String])
  retweets: string[];

  @Prop([String])
  bookmarks: string[];

  @Prop([String])
  replies: string[];

  @Prop({ default: false })
  isRetweet: boolean;

  @Prop({ type: String, default: null })
  originalPostId: string;

  @Prop({ type: String, default: null })
  parentPostId: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ default: 'public' })
  visibility: string;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop([String])
  reportedBy: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);