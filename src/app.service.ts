import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'ok',
      service: 'DevOps and Db setup - backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}
