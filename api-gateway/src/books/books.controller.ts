import { Controller, Get, Param, Post, Body, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BooksService } from './books.service';
import { Book as BookModel } from '@prisma/client';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @Get()
    async getBooks(
        @Query('searchString') searchString?: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('orderBy') orderBy?: 'asc' | 'desc',
    ): Promise<{ data: BookModel[]; total: number }> {
        return this.booksService.books({
            skip: skip ? Number(skip) : 0,
            take: take ? Number(take) : 100000, // retrieve all for frontend search
            where: searchString
                ? {
                    OR: [
                        { title: { contains: searchString, mode: 'insensitive' } },
                        { authors: { contains: searchString, mode: 'insensitive' } },
                        { subject: { contains: searchString, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            orderBy: {
                updatedAt: orderBy || 'desc',
            },
        });
    }

    @Get(':id')
    async getBookById(@Param('id') id: string): Promise<BookModel | null> {
        return this.booksService.book({ id });
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createBook(@Body() bookData: any): Promise<BookModel> {
        return this.booksService.createBook(bookData);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateBook(
        @Param('id') id: string,
        @Body() bookData: any,
    ): Promise<BookModel> {
        return this.booksService.updateBook({
            where: { id },
            data: bookData,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteBook(@Param('id') id: string): Promise<BookModel> {
        return this.booksService.deleteBook({ id });
    }

    @Get('categories')
    async getCategories(): Promise<string[]> {
        return this.booksService.getCategories();
    }

    @Get('next-registration/number')
    async getNextRegistration(): Promise<{ number: string }> {
        return { number: await this.booksService.getNextRegNumber() };
    }
}
