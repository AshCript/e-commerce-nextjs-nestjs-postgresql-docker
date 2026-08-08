import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

/**
 * @extends PrismaClient : To allow access all methods allowed by this class.
 * @implements OnModuleInit : It will run automatically when Prisma Module Loads.
 * @implements OnModuleDestroy : It will run when the module Stops.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg(
        new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      ),
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected successfully!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected!');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production.');
    }

    // Get model keys on the Prisma instance
    const models = Object.keys(this).filter(
      (key) => !key.startsWith('_') && !key.startsWith('$'),
    );

    // Cast `this` as Record<string, any> so TS allows string indexing
    const prismaInstance = this as unknown as Record<string, any>;

    return Promise.all(
      models.map((modelKey) => {
        if (typeof prismaInstance[modelKey]?.deleteMany === 'function') {
          return prismaInstance[modelKey].deleteMany();
        }
      }),
    );
  }
}
