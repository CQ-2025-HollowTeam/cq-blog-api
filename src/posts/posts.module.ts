import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReactionsService } from 'src/reactions/reactions.service';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PrismaService, ReactionsService],
})
export class PostsModule {}
