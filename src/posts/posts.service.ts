import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationPostDto } from './dto/pagination-post.dto';
import { Post, Prisma } from '@prisma/client';
import { PaginatedResponse } from 'src/common';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private categoryService: CategoriesService,
    ) {}

    async create(createPostDto: CreatePostDto): Promise<Post> {
        const { categories, ...postData } = createPostDto;

        const post = await this.prisma.post.findUnique({
            where: { slug: postData.slug },
        });

        if (post) {
            throw new ConflictException('Post with this slug already exists');
        }

        // Validate categories
        const validCategories = await this.categoryService.validateCategoryIds(
            createPostDto.categories,
        );

        return this.prisma.post.create({
            data: {
                ...postData,
                categories: {
                    connect: validCategories,
                },
            },
            include: {
                categories: true,
            },
        });
    }

    async find(
        paginationPostDto: PaginationPostDto,
    ): Promise<PaginatedResponse<Post> | Post> {
        if (paginationPostDto.slug) {
            return this.findBySlug(paginationPostDto.slug);
        } else {
            return this.findAll(paginationPostDto);
        }
    }

    async findAll(
        paginationPostDto: PaginationPostDto,
    ): Promise<PaginatedResponse<Post>> {
        const { page, limit } = paginationPostDto;

        const whereCondition = this.buildWhereCondition(paginationPostDto);

        const [data, totalRecords] = await this.prisma.$transaction([
            this.prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: whereCondition,
                include: {
                    categories: true,
                    author: true,
                },
            }),
            this.prisma.post.count({ where: whereCondition }),
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

    private buildWhereCondition(
        paginationPostDto: PaginationPostDto,
    ): Prisma.PostWhereInput {
        const { search, title, slug, content, author, categories } =
            paginationPostDto;

        const whereCondition: Prisma.PostWhereInput = {};

        if (search) {
            whereCondition.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
            ];
        } else {
            if (title) {
                whereCondition.title = { contains: title };
            }
            if (content) {
                whereCondition.content = { contains: content };
            }
        }

        if (slug) {
            whereCondition.slug = { contains: slug };
        }

        if (author) {
            whereCondition.author = { name: { contains: author } };
        }

        if (categories && categories.length > 0) {
            whereCondition.categories = {
                some: {
                    slug: {
                        in: categories,
                    },
                },
            };
        }

        return whereCondition;
    }

    async findById(id: number): Promise<Post> {
        const post = await this.prisma.post.findFirst({
            where: { id },
            include: {
                categories: true,
                author: true,
                comments: true,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with id #${id} not found`);
        }

        return post;
    }

    async findBySlug(slug: string): Promise<Post> {
        const post = await this.prisma.post.findFirst({
            where: { slug },
            include: {
                categories: true,
                author: true,
                comments: true,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with slug '${slug}' not found`);
        }

        return post;
    }

    async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
        const { categories, ...postData } = updatePostDto;

        await this.findById(id);

        return this.prisma.post.update({
            where: { id },
            data: {
                ...postData,
                categories: {
                    set: categories.map((categoryId) => ({ id: categoryId })),
                }
            },
            include: {
                categories: true
            }
        });
    }

    async remove(id: number): Promise<Post> {
        await this.findById(id);

        return this.prisma.post.delete({
            where: { id },
        });
    }

    async findTrending(limit: number = 3): Promise<Post[]> {
        return this.prisma.post.findMany({
            include: {
                author: true,
                categories: true,
                _count: { select: { comments: true } }
            },
            orderBy: { comments: { _count: 'desc' } },
            take: limit,
        });
    }
}
