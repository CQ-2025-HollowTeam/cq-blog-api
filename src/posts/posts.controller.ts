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
    DefaultValuePipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PaginationPostDto } from './dto/pagination-post.dto';
import { NonEmptyBodyPipe, PaginatedResponse } from 'src/common';
import { Post as PostModel, PostReaction, User } from '@prisma/client';
import { ReactionsService } from 'src/reactions/reactions.service';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly reactionsService: ReactionsService,
    ) {}

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiOkResponse({ description: 'Post created successfully' })
    create(
        @Body() createPostDto: CreatePostDto,
        @GetUser() user: User,
    ): Promise<PostModel> {
        return this.postsService.create({
            ...createPostDto,
            authorId: user.id,
        });
    }

    @Public()
    @Get()
    @ApiOperation({
        summary:
            'Get a list of all posts with pagination or retrieve a post by slug',
    })
    @ApiOkResponse({ description: 'List of posts.' })
    async findAll(
        @Query() paginationPostDto: PaginationPostDto,
    ): Promise<PaginatedResponse<PostModel> | PostModel> {
        return this.postsService.find(paginationPostDto);
    }

    @Public()
    @Get('trending')
    @ApiOperation({
        summary: 'Get trending posts',
        description: 'Returns the most popular posts based on comment count'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of trending posts to return (default: 3)',
    })
    @ApiOkResponse({ description: 'Trending posts retrieved successfully' })
    findTrending(@Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit?: number): Promise<PostModel[]> {
        return this.postsService.findTrending(limit);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a post by ID' })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post',
        type: Number,
    })
    @ApiOkResponse({ description: 'Post found.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postsService.findById(id);
    }

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing post' })
    @ApiOkResponse({ description: 'Post updated successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(NonEmptyBodyPipe) updatePostDto: UpdatePostDto,
    ): Promise<PostModel> {
        return this.postsService.update(id, updatePostDto);
    }

    @RoleProtected(Role.ADMIN, Role.EDITOR)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post' })
    @ApiOkResponse({ description: 'Post deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postsService.remove(id);
    }

    @Post(':id/reactions')
    @ApiOperation({
        summary: 'Add or update a reaction to a post',
        description:
            'Creates a new reaction or updates an existing one for the specified post. Each user can only have one reaction per post.',
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post to react to',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Post reaction created or updated successfully.',
    })
    @ApiNotFoundResponse({ description: 'Post not found.' })
    createOrUpdateReaction(
        @Param('id', ParseIntPipe) postId: number,
        @Body() createReactionDto: CreateReactionDto,
        @GetUser() user: User,
    ): Promise<PostReaction> {
        return this.reactionsService.createOrUpdatePostReaction(
            { ...createReactionDto, userId: user.id },
            postId,
        );
    }

    @Delete(':id/reactions')
    @ApiOperation({
        summary: 'Remove a reaction from a post',
        description: "Removes the user's reaction from the specified post",
    })
    @ApiParam({
        name: 'id',
        description: 'The ID of the post to remove reaction from',
        type: Number,
    })
    @ApiOkResponse({
        description: 'Post reaction removed successfully.',
    })
    removeReaction(
        @Param('id', ParseIntPipe) postId: number,
        @GetUser() user: User,
    ): Promise<PostReaction> {
        return this.reactionsService.removePostReaction(postId, user.id);
    }
}
