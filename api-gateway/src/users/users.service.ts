import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(data: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
        const existing = await this.prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existing) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findAll(): Promise<Omit<User, 'password'>[]> {
        const users = await this.prisma.user.findMany();
        return users.map((u) => {
            const { password, ...result } = u;
            return result;
        });
    }
}
