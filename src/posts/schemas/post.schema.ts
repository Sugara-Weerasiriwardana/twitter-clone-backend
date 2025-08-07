// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, maxlength: 280 })
  content: string;

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [String], default: [] })
  mentions: string[];

  @Prop({ type: String, ref: 'Poll' })
  pollId?: string;

  @Prop({ required: true, type: String })
  authorId: string;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  retweets: string[];

  @Prop({ type: [String], default: [] })
  bookmarks: string[];

  @Prop({ type: String, ref: 'Post' })
  parentPostId?: string; // For replies

  @Prop({ type: [String], default: [] })
  replies: string[];

  @Prop({ default: false })
  isRetweet: boolean;

  @Prop({ type: String, ref: 'Post' })
  originalPostId?: string; // For retweets

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ default: 'public' })
  visibility: 'public' | 'private' | 'followers';

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String], default: [] })
  reportedBy: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for better query performance
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ mentions: 1 });
PostSchema.index({ content: 'text' });
PostSchema.index({ parentPostId: 1 });
PostSchema.index({ originalPostId: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likes: 1 });
PostSchema.index({ retweets: 1 });
