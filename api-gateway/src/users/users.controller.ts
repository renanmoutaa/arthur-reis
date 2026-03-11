import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async createUser(@Body() userData: Prisma.UserCreateInput) {
        return this.usersService.createUser(userData);
    }

    @Get()
    async getUsers() {
        return this.usersService.findAll();
    }
}
