import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReactionsService } from 'src/reactions/reactions.service';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PrismaService, ReactionsService, CategoriesService],
})
export class PostsModule {}
