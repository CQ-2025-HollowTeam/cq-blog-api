import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Role } from 'src/auth/enums/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { Author } from './interfaces/author.interface';

@Injectable()
export class AuthorsService {
    constructor(private prisma: PrismaService) {}

    findAll(): Promise<Author[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
            },
            where: {
                role: {
                    in: [Role.ADMIN, Role.EDITOR],
                },
            },
        });
    }
}
