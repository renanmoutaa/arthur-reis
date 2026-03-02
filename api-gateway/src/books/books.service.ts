import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Book, Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
    constructor(private prisma: PrismaService) { }

    private cleanBook(book: Book): any {
        let subjects = '';
        let title = book.title || '';
        let authors = book.authors || '';
        let publisher = book.publisher || '';
        let year = book.year || '';
        let isbn = book.isbn || '';

        try {
            if (book.subject) {
                const subObj = JSON.parse(book.subject);

                // MARC21 Mapping logic (Mapping from legacy WINISIS tags)
                // 125 -> Title (245)
                // 120 -> Author (100)
                // 150 -> Publisher/City (260/264)
                // 175 -> Subjects (650)
                // 115 -> Call Number (050/090)

                const winisisTitle = subObj['125']?.[0] || subObj['245']?.[0];
                const winisisAuthors = subObj['120']?.[0] || subObj['100']?.[0] || subObj['110']?.[0];
                const winisisPublisher = subObj['150']?.[0] || subObj['260']?.[0] || subObj['264']?.[0];
                const winisisISBN = subObj['130']?.[0] || subObj['020']?.[0];

                if (!title.trim() && winisisTitle) title = winisisTitle;
                if (!authors.trim() && winisisAuthors) authors = winisisAuthors;
                if (!publisher.trim() && winisisPublisher) publisher = winisisPublisher;
                if (!isbn.trim() && winisisISBN) isbn = winisisISBN;

                const subjectList = subObj['175'] || subObj['650'] || subObj['710'] || [];
                subjects = Array.isArray(subjectList) ? subjectList.join(', ') : '';

                if (!subjects) {
                    const allValues = Object.values(subObj).flat() as string[];
                    subjects = allValues.filter(v => v.length > 2 && v.length < 50).slice(0, 5).join(', ');
                }
            }
        } catch (e) {
            console.error('Error parsing subject JSON', e);
        }

        // Final trimming and MARC21-style formatting
        return {
            ...book,
            title: title.trim().replace(/^"/, '').replace(/"$/, '') || 'Sem Título',
            authors: authors.trim() || 'Autor desconhecido',
            publisher: publisher.trim() || '',
            year: year.trim() || '',
            isbn: isbn.trim() || '',
            registrationNumber: book.registrationNumber?.trim() || '',
            subjects: subjects.trim() || '',
        };
    }

    async getNextRegNumber(): Promise<string> {
        const count = await this.prisma.book.count();
        return `REG-${(count + 1).toString().padStart(6, '0')}`;
    }

    async book(
        bookWhereUniqueInput: Prisma.BookWhereUniqueInput,
    ): Promise<Book | null> {
        const book = await this.prisma.book.findUnique({
            where: bookWhereUniqueInput,
        });
        return book ? this.cleanBook(book) : null;
    }

    async books(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.BookWhereUniqueInput;
        where?: Prisma.BookWhereInput;
        orderBy?: Prisma.BookOrderByWithRelationInput;
    }): Promise<{ data: any[]; total: number }> {
        const { skip, take, cursor, where, orderBy } = params;
        const [data, total] = await Promise.all([
            this.prisma.book.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy: orderBy || { updatedAt: 'desc' },
            }),
            this.prisma.book.count({ where })
        ]);
        return {
            data: data.map(book => this.cleanBook(book)),
            total
        };
    }

    async createBook(data: Prisma.BookCreateInput): Promise<Book> {
        return this.prisma.book.create({
            data,
        });
    }

    async updateBook(params: {
        where: Prisma.BookWhereUniqueInput;
        data: any;
    }): Promise<Book> {
        const { data, where } = params;

        // Clean up data before update to ensure it matches schema
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.authors) updateData.authors = data.authors;
        if (data.publisher) updateData.publisher = data.publisher;
        if (data.year) updateData.year = data.year;
        if (data.isbn) updateData.isbn = data.isbn;
        if (data.registrationNumber) updateData.registrationNumber = data.registrationNumber;
        if (data.coverImage) updateData.coverImage = data.coverImage;
        if (data.subjects) {
            // If subjects are passed, we might want to update the raw JSON too if possible
            // But for now we just store it as is if needed, or mapping back to JSON
            // For simplicity, we keep it as it is.
        }

        return this.prisma.book.update({
            data: updateData,
            where,
        });
    }

    async getCategories(): Promise<string[]> {
        const books = await this.prisma.book.findMany({
            select: { subject: true },
            take: 1000, // Sample 1000 books for categories
        });

        const catSet = new Set<string>();
        books.forEach(b => {
            if (b.subject) {
                try {
                    const subObj = JSON.parse(b.subject);
                    const list = subObj['175'] || subObj['650'] || [];
                    if (Array.isArray(list)) {
                        list.forEach(s => {
                            const trimmed = s.trim().toLowerCase();
                            if (trimmed && trimmed.length > 2 && trimmed.length < 30) {
                                catSet.add(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
                            }
                        });
                    }
                } catch { }
            }
        });

        return Array.from(catSet).sort().slice(0, 50);
    }

    async deleteBook(where: Prisma.BookWhereUniqueInput): Promise<Book> {
        return this.prisma.book.delete({
            where,
        });
    }
}
