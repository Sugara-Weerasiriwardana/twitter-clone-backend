# Twitter Clone Backend

A robust, scalable backend API for a Twitter like social media platform built with NestJS, PostgreSQL, MongoDB, and Redis.

## Features

### Core Functionality
- **User Management**: Complete CRUD operations with authentication
- **Post System**: Create, read, update, delete posts with media support
- **Poll System**: Interactive polls with voting capabilities
- **Comment System**: Nested comments with threading support
- **Follow System**: User following/followers management
- **Real-time Notifications**: WebSocket-based notification system
- **Media Upload**: Cloudinary integration for image/video uploads

###  Database & Performance
- **Hybrid Database Architecture**: PostgreSQL + MongoDB
- **Advanced Indexing**: Comprehensive database indexing for optimal performance
- **Redis Caching**: High-performance caching layer
- **Database Monitoring**: Real-time health monitoring and performance analysis
- **Query Optimization**: Intelligent query patterns and missing index recommendations

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage
- **Input Validation**: Comprehensive DTO validation
- **Rate Limiting**: API rate limiting and protection

### API Features
- **RESTful API**: Clean, consistent REST endpoints
- **Swagger Documentation**: Interactive API documentation
- **Pagination**: Efficient data pagination
- **Search & Filtering**: Advanced search capabilities
- **File Upload**: Multipart form data support

### Architecture

<img width="561" height="502" alt="twitter_clone" src="https://github.com/user-attachments/assets/703e2602-795e-45ed-bfb5-90bb0932e0a9" />

### Key Design Patterns

- **Modular Architecture**: Each feature is a separate module
- **Service Layer**: Business logic separated from controllers
- **DTO Validation**: Input validation using class-validator
- **Repository Pattern**: Data access abstraction
- **WebSocket Integration**: Real-time communication
- **Hybrid Database**: PostgreSQL for relational + MongoDB for documents

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Primary Database**: PostgreSQL with Prisma ORM
- **Secondary Database**: MongoDB with Mongoose
- **Cache**: Redis
- **File Storage**: Cloudinary
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Containerization**: Docker

## Project Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- Docker & Docker Compose (optional)

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Sugara-Weerasiriwardana/twitter-clone-backend.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:



### 4. Database Setup
```bash
npx prisma migrate dev

npx prisma generate
```

### 5. Start the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build
```

##  Docker Setup

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Manual Docker Setup
```bash
# Build the image
docker build -t twitter-clone-backend .

# Run the container
docker run -p 3000:3000 --env-file .env twitter-clone-backend
```

##  API Documentation

### Base URL
```
http://localhost:3000/api
```

### Swagger UI
```
http://localhost:3000/api-docs
```



## Database Schema

### PostgreSQL Tables (Relational Data)
- **users**: User accounts, profiles, and authentication
- **follows**: User follow relationships (many-to-many)
- **polls**: Poll questions and metadata
- **poll_votes**: Individual poll votes and responses

### MongoDB Collections (Document Data)
- **posts**: Social media posts with media and metadata
- **comments**: Post comments with threading support
- **notifications**: User notifications and alerts

### Data Flow Strategy
- **PostgreSQL**: Handles structured, relational data that requires ACID properties
- **MongoDB**: Stores flexible, document-based data that benefits from schema flexibility
- **Redis**: Caches frequently accessed data and manages real-time features
- **Hybrid Approach**: Best of both worlds - relational integrity + document flexibility

## Database Indexing

### PostgreSQL Indexes
- User table: `createdAt`, `username`, `email`
- Follow table: `followerId`, `followingId`, `createdAt`
- Poll table: `postId`, `userId`, `createdAt`, `expiresAt`
- PollVote table: `pollId`, `userId`, `createdAt`

### MongoDB Indexes
- Posts: `authorId`, `createdAt`, `hashtags`, `mentions`
- Comments: `postId`, `authorId`, `parentCommentId`
- Notifications: `userId`, `isRead`, `type`, `createdAt`


## Performance Features

### Caching Strategy
- **Redis Caching**: Frequently accessed data
- **Query Optimization**: Intelligent database indexing
- **Connection Pooling**: Optimized database connections
- **Lazy Loading**: Efficient data fetching

### Monitoring & Analytics
- **Real-time Health Checks**: Database and service monitoring
- **Performance Metrics**: Query performance analysis
- **Index Recommendations**: Missing index suggestions
- **Resource Usage**: Memory and connection monitoring



## Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Production
```bash
# Build production image
docker build -f Dockerfile.prod -t twitter-clone-backend:prod .

# Run production container
docker run -p 3000:3000 --env-file .env.prod twitter-clone-backend:prod
```

### Environment-Specific Configs
```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Debug mode
npm run start:debug
```

##  API Examples

### Create a Post with Poll
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: multipart/form-data" \
  -F "content=What's your favorite programming language?" \
  -F "authorId=user_id" \
  -F "hashtags[]=coding" \
  -F "hashtags[]=poll" \
  -F "poll[question]=What's your favorite programming language?" \
  -F "poll[options][]=JavaScript" \
  -F "poll[options][]=Python" \
  -F "poll[options][]=Java" \
  -F "poll[expiresAt]=2024-12-31T23:59:59Z"
```

### Follow a User
```bash
curl -X POST http://localhost:3000/api/users/user123/follow \
  -H "Content-Type: application/json" \
  -d '{"followerId": "user_id"}'
```

### Search Users
```bash
curl "http://localhost:3000/api/users/search?q=john&page=1&limit=10"
```


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Getting Help
- Check the [Issues](../../issues) page
- Review the [API Documentation](http://localhost:3000/api-docs)
- Check database health: `/api/database/health`


**Built with  using NestJS, PostgreSQL, MongoDB, and Redis**

*For more information, visit the [API Documentation](http://localhost:3000/api-docs) when the server is running.*
