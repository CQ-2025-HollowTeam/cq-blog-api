import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { LoginUserDto } from './dto/login-dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(userData: Prisma.UserCreateInput): Promise<User> {
        if (userData.password) {
            userData.password = await argon2.hash(userData.password);
        }

        return await this.prisma.user.create({ data: userData });
    }

    getJwtToken(payload: JwtPayload): string {
        const token = this.jwtService.sign(payload);
        return token;
    }

    async register(createUserDto: CreateUserDto) {
        const { username, email } = createUserDto;

        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            throw new ConflictException(
                `User with username "${username}" or email "${email}" already exists`,
            );
        }

        const user = await this.createUser(createUserDto);

        return {
            token: this.getJwtToken({ id: user.id }),
        };
    }

    async login(loginUserDto: LoginUserDto) {
        const { username, password } = loginUserDto;
        const invalidCredentialsError = new UnauthorizedException(
            'Invalid credentials',
        );

        const user = await this.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                password: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            throw invalidCredentialsError;
        }

        const passwordsMatch = await argon2.verify(user.password, password);
        if (!passwordsMatch) {
            throw invalidCredentialsError;
        }

        return {
            token: this.getJwtToken({ id: user.id }),
        };
    }

    // Redirect to frontend with JWT token
    async loginWithDiscord(user: User): Promise<string> {
        return this.getJwtToken({ id: user.id });
    }
}
