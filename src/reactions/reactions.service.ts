import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CommentReaction, PostReaction, Reaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionsService {
    constructor(private prisma: PrismaService) {}

    async findOne(id: number): Promise<Reaction> {
        const reaction = await this.prisma.reaction.findFirst({
            where: { id },
        });

        if (!reaction) {
            throw new NotFoundException(`Reaction with id #${id} not found`);
        }

        return reaction;
    }

    async createOrUpdatePostReaction(
        createReactionDto: CreateReactionDto & { userId: string },
        postId: number,
    ): Promise<PostReaction> {
        const { userId, reactionId } = createReactionDto;
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        await this.findOne(reactionId);

        return this.prisma.postReaction.upsert({
            where: { userId_postId: { userId, postId } },
            update: { reactionId },
            create: { userId, postId, reactionId },
            include: { reaction: true },
        });
    }

    async removePostReaction(
        postId: number,
        userId: string,
    ): Promise<PostReaction> {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const existingReaction = await this.prisma.postReaction.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (!existingReaction) {
            throw new NotFoundException('Reaction not found');
        }

        return this.prisma.postReaction.delete({
            where: { userId_postId: { userId, postId } },
        });
    }

    async createOrUpdateCommentReaction(
        createReactionDto: CreateReactionDto & { userId: string },
        commentId: number,
        postId: number,
    ): Promise<CommentReaction> {
        const { userId, reactionId } = createReactionDto;

        const comment = await this.prisma.postComment.findUnique({
            where: { id: commentId },
            include: { post: true },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (postId && comment.postId !== postId) {
            throw new BadRequestException(
                'Comment does not belong to the specified post',
            );
        }

        await this.findOne(reactionId);

        return this.prisma.commentReaction.upsert({
            where: { userId_commentId: { userId, commentId } },
            update: { reactionId },
            create: { userId, commentId, reactionId },
            include: { reaction: true },
        });
    }

    async removeCommentReaction(
        commentId: number,
        postId: number,
        userId: string,
    ): Promise<CommentReaction> {
        const comment = await this.prisma.postComment.findUnique({
            where: { id: commentId },
            include: { post: true },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (postId && comment.postId !== postId) {
            throw new BadRequestException(
                'Comment does not belong to the specified post',
            );
        }

        const existingReaction = await this.prisma.commentReaction.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (!existingReaction) {
            throw new NotFoundException('Reaction not found');
        }

        return this.prisma.commentReaction.delete({
            where: { userId_commentId: { userId, commentId } },
        });
    }
}
