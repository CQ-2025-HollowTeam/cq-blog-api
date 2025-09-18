import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { LoginUserDto } from './dto/login-dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const { username, email, password } = createUserDto;

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

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: await argon2.hash(password),
            },
        });

        return {
            ...user,
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
            },
        });

        if (!user) {
            throw invalidCredentialsError;
        }

        const passwordsMatch = await argon2.verify(user.password, password);
        if (!passwordsMatch) {
            throw invalidCredentialsError;
        }

        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    private getJwtToken(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
    }
}
