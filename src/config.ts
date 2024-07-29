import { RedisOptions } from './redis-interfaces';

export class Config {
  public static get REDIS_CONNECT(): RedisOptions {
    return process.env.REDIS_CONNECT
      ? JSON.parse(process.env.REDIS_CONNECT)
      : {
          url: 'redis://127.0.0.1:6379',
        };
  }
}
