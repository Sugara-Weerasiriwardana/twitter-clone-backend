import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: String })
  userId: string; // Postgres user id (UUID)

  @Prop({ required: true, type: String })
  type: string; // e.g. 'LIKE', 'COMMENT', 'FOLLOW'

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: null })
  meta?: Record<string, any>; // Optional additional metadata (postId, commentId, ...)

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
