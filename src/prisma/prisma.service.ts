import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            omit: {
                user: {
                    password: true,
                }
            }
        })
    }

    async onModuleInit() {
        this.logger.log('Connecting to the database...');

        try {
            await this.$connect();
            this.logger.log('Connected to the database successfully');
        } catch (error) {
            this.logger.error('Error connecting to the database', error);
            throw error;
        }
    }
}
