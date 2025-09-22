import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { slug: createCategoryDto.slug },
        });

        if (category) {
            throw new ConflictException(
                'Category with this slug already exists',
            );
        }

        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category with id #${id} not found`);
        }

        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        await this.findOne(id);

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.category.delete({
            where: { id },
        });
    }

    /**
     * Validates an array of category IDs.
     * Throws BadRequestException if any ID does not exist.
     *
     * @param categoryIds - Array of category IDs to validate
     * @returns Array of existing category objects
     */
    async validateCategoryIds(categoryIds: number[]) {
        if (!categoryIds || categoryIds.length === 0) return [];

        const existingCategories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true },
        });

        const existingIds = existingCategories.map((c) => c.id);
        const invalidIds = categoryIds.filter(
            (id) => !existingIds.includes(id),
        );

        if (invalidIds.length > 0) {
            throw new BadRequestException(
                `Invalid category IDs: ${invalidIds.join(', ')}`,
            );
        }

        return existingCategories;
    }
}
