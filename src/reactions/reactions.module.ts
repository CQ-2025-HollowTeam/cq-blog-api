import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [PrismaService, ReactionsService],
    exports: [ReactionsService],
})
export class ReactionsModule {}
