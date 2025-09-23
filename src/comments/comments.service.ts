import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationCommentDto } from './dto/pagination-comment.dto';
import { PostComment, Prisma, User } from '@prisma/client';
import { PaginatedResponse } from 'src/common';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) {}

    async create(
        postId: number,
        createCommentDto: CreateCommentDto & { authorId: string },
    ): Promise<PostComment> {
        const { authorId, content, parentId } = createCommentDto;

        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (parentId) {
            const parentComment = await this.prisma.postComment.findUnique({
                where: { id: parentId },
            });

            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }

            if (parentComment.parentId) {
                throw new Error(
                    'Cannot create a comment on a comment of a comment',
                );
            }
        }

        return this.prisma.postComment.create({
            data: {
                content,
                author: { connect: { id: authorId } },
                post: { connect: { id: postId } },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });
    }

    async findAll(
        postId: number,
        paginationCommentDto: PaginationCommentDto,
    ): Promise<PaginatedResponse<PostComment>> {
        const { page, limit } = paginationCommentDto;

        const orderByCondition =
            this.buildOrderByCondition(paginationCommentDto);

        const [data, totalRecords] = await this.prisma.$transaction([
            this.prisma.postComment.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: { postId },
                include: {
                    author: true,
                    reactions: true,
                    replies: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            author: true,
                            _count: {
                                select: { reactions: true, replies: true },
                            },
                        },
                    },
                    _count: {
                        select: { reactions: true, replies: true },
                    },
                },
                orderBy: orderByCondition,
            }),
            this.prisma.postComment.count({
                where: { postId },
            }),
        ]);

        const lastPage = Math.ceil(totalRecords / limit);

        return {
            data,
            meta: {
                total: totalRecords,
                page: page,
                lastPage: lastPage,
            },
        };
    }

    private buildOrderByCondition(
        paginationCommentDto: PaginationCommentDto,
    ): Prisma.PostCommentOrderByWithRelationInput {
        const { orderBy, orderDirection = 'desc' } = paginationCommentDto;

        switch (orderBy) {
            case 'reactions':
                return { reactions: { _count: orderDirection } };
            case 'replies':
                return { replies: { _count: orderDirection } };
            case 'createdAt':
            default:
                return { createdAt: orderDirection };
        }
    }

    async findOne(postId: number, id: number): Promise<PostComment> {
        const comment = await this.prisma.postComment.findFirst({
            where: { id, postId },
            include: {
                author: true,
                reactions: true,
                replies: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: true,
                        _count: {
                            select: { reactions: true, replies: true },
                        },
                    },
                },
                _count: {
                    select: { reactions: true, replies: true },
                },
            },
        });

        if (!comment) {
            throw new NotFoundException(
                `Comment with id #${id} not found in post ${postId}`,
            );
        }

        return comment;
    }

    async update(
        postId: number,
        id: number,
        updateCommentDto: UpdateCommentDto,
        user: User,
    ): Promise<PostComment> {
        const comment = await this.findOne(postId, id);

        this.validatePermissions(comment.authorId, user);

        return this.prisma.postComment.update({
            where: { id },
            data: updateCommentDto,
        });
    }

    async remove(postId: number, id: number, user: User): Promise<PostComment> {
        const comment = await this.findOne(postId, id);

        this.validatePermissions(comment.authorId, user);

        return this.prisma.postComment.delete({
            where: { id },
        });
    }

    /**
     * Validates if the current user has permission to perform actions on the target user.
     *
     * @param targetUserId ID of the user to be acted upon
     * @param currentUser The user attempting the action
     * @throws ForbiddenException if the current user lacks permission
     */
    private validatePermissions(targetUserId: string, currentUser: User): void {
        if (
            currentUser.role !== Role.ADMIN &&
            currentUser.id !== targetUserId
        ) {
            throw new ForbiddenException(
                'You do not have permission to perform this action',
            );
        }
    }
}
