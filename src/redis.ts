// override from .env files in this directory or one up
import * as dotenv from 'dotenv';
import { RedisClientOptions, RedisFunctions, RedisModules, RedisScripts, createClient } from 'redis';

// read config
import { Config as config } from './config';
import { RedisRecordData } from './redis-interfaces';
import { exit } from 'process';

dotenv.config({ path: '../.env' });

export type ClientOpts = RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>;

function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RedisConnector {
  private connectOptions: ClientOpts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  /**
   * set our options
   * 
   */
  constructor() {
    this.connectOptions = Object.assign({}, config.REDIS_CONNECT);
  }

  public async connect(options: ClientOpts = {}): Promise<void> {
    this.connectOptions = Object.assign(options, config.REDIS_CONNECT);
    this.client = null;
    this.client = createClient(this.connectOptions as RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>);
    let retriesMade = 0;
    const maxRetries = 2;
    let connected = false;
    do {
      try {
        await this.client.connect();
        connected = true;
      } catch (error) {
        connected = false;
        console.error('error connecting to redis', {
          options: this.connectOptions,
          error,
          retriesMade,
          maxRetries,
        });
        retriesMade++;
        if (retriesMade > maxRetries) {
          this.client = null;
          throw new Error('connect error');
        }
        await sleep(100);
      }
    } while (!connected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async close(): Promise<any> {
    if (!this.client) {
      console.error('redis connection not established on close');
      return false;
    }
    try {
      const rsp = await this.client.quit();
      return rsp;
    } catch (error) {
      console.warn('redis error on close, ignoring', {
        error,
      });
      return "OK";
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get(key: string): Promise<string> {
    return await this.client.get(key);
  }

  public async getObject(key: string): Promise<RedisRecordData> {
    const rawResponse = await this.client.get(key);
    return JSON.parse(rawResponse);
  }

  /**
   * deletes a value
   *
   * @return {any} return value by underlying function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async del(...args: any[]): Promise<any> {
    return await this.client.del(...args);
  }

  /**
   * sets a value
   *
   * @return {any} return value by underlying function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async set(...args: any[]): Promise<any> {
    return await this.client.set(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async setObject(key: string, value: RedisRecordData, ttl?: number): Promise<any> {
    if (ttl) {
      return await this.setAndExpire(key, ttl, JSON.stringify(value));
    }
    return await this.client.set(key, JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async setAndExpire(key: string, seconds: number, value: string): Promise<any> {
    return await this.client.set(key, value, { EX : seconds });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async expire(...args: any[]): Promise<number> {
    const rsp = await this.client.expire(...args);
    if (rsp) return 1;
    return 0;
    // return await this.client.expire(...args);
  }

  public async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }
}

(async () => {
  const redisConnector = new RedisConnector();
  await redisConnector.connect(config.REDIS_CONNECT);
  const valueToStore = `we store this at ${(new Date()).getTime()}`;
  const keyToUse = 'testkey';
  await redisConnector.set(keyToUse, valueToStore);
  const valueRead = await redisConnector.get(keyToUse);
  console.log('result', {
    keyToUse,
    valueToStore,
    valueRead,
  });
  if (valueToStore != valueRead) {
    console.error('test failed');
  }
  exit(0);
})();

