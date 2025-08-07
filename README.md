Prerequisites

- Node.js 
- Docker & Docker Compose
- MongoDB
- PostgreSQL
- Cloudinary account

Setup

To start db
- docker-compose up -d

To setup primsa
npx prisma generate

Run Prisma migrations
npx prisma migrate dev

start server
npm run start:dev