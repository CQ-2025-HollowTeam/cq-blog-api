import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReactionsService } from 'src/reactions/reactions.service';

@Module({
    controllers: [CommentsController],
    providers: [CommentsService, PrismaService, ReactionsService],
})
export class CommentsModule {}
