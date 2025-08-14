import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: String })
  userId: string;
  
  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: null })
  meta?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);


NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 }); 
NotificationSchema.index({ createdAt: -1 }); 
