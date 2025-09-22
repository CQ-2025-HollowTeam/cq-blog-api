import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { Role } from 'src/auth/enums/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findOne(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with id #${id} not found`);
        }

        return user;
    }

    async update(
        id: string,
        updateUserDto: UpdateUserDto,
        user: User,
    ): Promise<User> {
        this.validatePermissions(id, user);

        // Check if selected username or email is already taken by another user
        await this.validateUniqueUser(
            { email: updateUserDto.email, username: updateUserDto.username },
            id,
        );

        // Ensure the user exists before updating
        await this.findOne(id);

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async remove(id: string, user: User): Promise<User> {
        this.validatePermissions(id, user);

        await this.findOne(id);

        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async checkAvailability(value: string): Promise<boolean> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: value }, { email: value }],
            },
        });

        return !!user;
    }

    private validatePermissions(targetUserId: string, currentUser: User): void {
        if (currentUser.role !== Role.ADMIN && currentUser.id !== targetUserId) {
            throw new ForbiddenException(
                'You do not have permission to perform this action',
            );
        }
    }

    /**
     * Checks if email or username are already taken by other users.
     *
     * @param data - Object containing email and username
     * @param excludeUserId - Optional user ID to exclude (for updates)
     * @throws BadRequestException if email or username is already used
     */
    async validateUniqueUser(
        data: { email: string; username: string },
        excludeUserId?: string,
    ) {
        const existingUsers = await this.prisma.user.findMany({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
                NOT: excludeUserId ? { id: excludeUserId } : undefined,
            },
        });

        if (existingUsers.some((u) => u.email === data.email)) {
            throw new BadRequestException('Email already in use');
        }

        if (existingUsers.some((u) => u.username === data.username)) {
            throw new BadRequestException('Username already in use');
        }
    }
}
