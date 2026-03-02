import { Book } from '../utils/storage';
import { authUtils } from '../utils/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Edit, Trash2, BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
  index?: number;
}

export function BookCard({ book, onDelete, index = 0 }: BookCardProps) {
  const isAdmin = authUtils.isAdmin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Card className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 bg-white">
        <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-contain bg-gray-50 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-200" />
            </div>
          )}

          {/* Badge de ano flutuante */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white border-gray-200 text-gray-900 shadow-sm">
              {book.year}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3 flex-grow">
          <CardTitle className="line-clamp-2 text-base font-bold text-gray-900 leading-tight mb-1">
            {book.title}
          </CardTitle>
          <p className="text-sm text-gray-500 line-clamp-1 font-medium">{book.authors}</p>
        </CardHeader>

        <CardContent className="pb-3 border-t border-gray-50 pt-3">
          <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 border-none uppercase tracking-tighter">
            {book.registrationNumber}
          </Badge>

          {book.subjects && (
            <p className="text-[11px] text-gray-400 mt-2 line-clamp-1 italic">
              {book.subjects.split(',')[0].trim()}
              {book.subjects.split(',').length > 1 && ' + outros'}
            </p>
          )}
        </CardContent>

        <CardFooter className="gap-2 pt-3 border-t border-gray-100 bg-gray-50/30">
          <Link to={`/book/${book.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </Button>
          </Link>

          {isAdmin && (
            <>
              <Link to={`/edit-book/${book.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(book.id)}
                  className="border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
