import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { PaginationCommentDto } from './dto/pagination-comment.dto';
import { CommentReaction, PostComment, User } from '@prisma/client';
import { PaginatedResponse } from 'src/common';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { ReactionsService } from 'src/reactions/reactions.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly reactionsService: ReactionsService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new comment on a specific post' })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post to comment on',
        type: Number,
    })
    @ApiOkResponse({ description: 'Comment created successfully' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    create(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() createCommentDto: CreateCommentDto,
        @GetUser() user: User,
    ): Promise<PostComment> {
        return this.commentsService.create(postId, {
            ...createCommentDto,
            authorId: user.id,
        });
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Get all comments for a specific post with pagination',
    })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post to get comments from',
        type: Number,
    })
    @ApiOkResponse({ description: 'List of comments returned successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    findAll(
        @Param('postId', ParseIntPipe) postId: number,
        @Query() paginationCommentDto: PaginationCommentDto,
    ): Promise<PaginatedResponse<PostComment>> {
        return this.commentsService.findAll(postId, paginationCommentDto);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get a specific comment by its ID from a post' })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post containing the comment',
        type: Number,
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the comment to retrieve',
        type: Number,
    })
    @ApiOkResponse({ description: 'Comment found and returned.' })
    @ApiNotFoundResponse({ description: 'Comment not found.' })
    findOne(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PostComment> {
        return this.commentsService.findOne(postId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing comment' })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post containing the comment',
        type: Number,
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the comment to update',
        type: Number,
    })
    @ApiOkResponse({ description: 'Comment updated successfully.' })
    @ApiNotFoundResponse({ description: 'Comment or post not found.' })
    update(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: UpdateCommentDto,
        @GetUser() user: User,
    ): Promise<PostComment> {
        return this.commentsService.update(postId, id, updateCommentDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a comment from a post' })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post containing the comment',
        type: Number,
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the comment to delete',
        type: Number,
    })
    @ApiOkResponse({ description: 'Comment deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Comment not found.' })
    remove(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
    ): Promise<PostComment> {
        return this.commentsService.remove(postId, id, user);
    }

    @Post(':id/reactions')
    @ApiOperation({
        summary: 'Add or update a reaction to a comment',
        description:
            'Creates a new reaction or updates an existing one for the specified comment. Each user can only have one reaction per comment.',
    })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post containing the comment',
        type: Number,
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the comment to react to',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Reaction added or updated successfully',
    })
    @ApiNotFoundResponse({ description: 'Comment not found.' })
    createOrUpdateReaction(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) commentId: number,
        @Body() createReactionDto: CreateReactionDto,
        @GetUser() user: User,
    ): Promise<CommentReaction> {
        return this.reactionsService.createOrUpdateCommentReaction(
            { ...createReactionDto, userId: user.id },
            commentId,
            postId,
        );
    }

    @Delete(':id/reactions')
    @ApiOperation({
        summary: 'Remove a reaction from a comment',
        description: "Removes the user's reaction from the specified comment",
    })
    @ApiParam({
        name: 'postId',
        description: 'ID of the post containing the comment',
        type: Number,
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the comment to remove reaction from',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Reaction removed successfully',
    })
    @ApiNotFoundResponse({ description: 'Comment or reaction not found.' })
    removeReaction(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) commentId: number,
        @GetUser() user: User,
    ): Promise<CommentReaction> {
        return this.reactionsService.removeCommentReaction(
            commentId,
            postId,
            user.id,
        );
    }
}
