import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add global API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Twitter Clone API')
    .setDescription('Twitter Clone Backend API Documentation')
    .setVersion('1.0')
    .addTag('posts', 'Post management endpoints')
    .addTag('polls', 'Poll management endpoints')
    .addTag('media', 'Media upload endpoints')
    .addTag('search', 'Search and analytics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger documentation: http://localhost:3000/api-docs');
}
bootstrap();
