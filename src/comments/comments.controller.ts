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
import { PostComment } from '@prisma/client';
import { PaginatedResponse } from 'src/common';

@Controller('posts/:postId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

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
    ): Promise<PostComment> {
        return this.commentsService.create(postId, createCommentDto);
    }

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
    ): Promise<PostComment> {
        return this.commentsService.update(postId, id, updateCommentDto);
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
    ): Promise<PostComment> {
        return this.commentsService.remove(postId, id);
    }
}
