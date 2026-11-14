import { Injectable } from '@nestjs/common';

@Injectable()
export class GetHealthUseCase {
  execute() {
    return {
      status: 'ok',
      service: 'project_instagram_posts',
      timestamp: new Date().toISOString(),
    };
  }
}
