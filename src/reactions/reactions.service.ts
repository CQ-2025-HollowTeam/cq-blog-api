import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentReaction, PostReaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { RemoveReactionDto } from './dto/remove-reaction.dto';

@Injectable()
export class ReactionsService {
    constructor(private prisma: PrismaService) {}

    async createOrUpdatePostReaction(
        createReactionDto: CreateReactionDto,
        postId: number,
    ): Promise<PostReaction> {
        const { userId, reactionId } = createReactionDto;
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return this.prisma.postReaction.upsert({
            where: { userId_postId: { userId, postId } },
            update: { reactionId },
            create: { userId, postId, reactionId },
            include: { reaction: true },
        });
    }

    async removePostReaction(
        removeReactionDto: RemoveReactionDto,
        postId: number,
    ): Promise<PostReaction> {
        const { userId } = removeReactionDto;

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
        createReactionDto: CreateReactionDto,
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
            throw new BadRequestException('Comment does not belong to the specified post');
        }

        return this.prisma.commentReaction.upsert({
            where: { userId_commentId: { userId, commentId } },
            update: { reactionId },
            create: { userId, commentId, reactionId },
            include: { reaction: true },
        });
    }

    async removeCommentReaction(
        removeReactionDto: RemoveReactionDto,
        commentId: number,
        postId: number,
    ): Promise<CommentReaction> {
        const { userId } = removeReactionDto;
        const comment = await this.prisma.postComment.findUnique({
            where: { id: commentId },
            include: { post: true },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (postId && comment.postId !== postId) {
            throw new BadRequestException('Comment does not belong to the specified post');
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
