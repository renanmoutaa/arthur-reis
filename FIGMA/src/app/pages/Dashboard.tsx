import { useState, useEffect } from 'react';
import { storageUtils, Book } from '../utils/storage';
import { authUtils } from '../utils/auth';
import { Header } from '../components/Header';
import { BookCard } from '../components/BookCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, BookOpen, Filter, TrendingUp, Users as UsersIcon, Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [nextRegistrationNumber, setNextRegistrationNumber] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState(50);
  const isAdmin = authUtils.isAdmin();

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
    setDisplayLimit(50); // Reset display limit on filter/sort change
  }, [books, searchQuery, sortBy]);

  const loadBooks = async () => {
    const [allBooks, nextReg] = await Promise.all([
      storageUtils.getBooks(),
      storageUtils.getNextRegistrationNumber()
    ]);
    setBooks(allBooks);
    setNextRegistrationNumber(nextReg);
  };

  const filterAndSortBooks = async () => {
    let result = [...books];

    // Filtrar por busca
    if (searchQuery) {
      result = await storageUtils.searchBooks(searchQuery);
    }

    // Ordenar
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        result.sort((a, b) => (a.authors || '').localeCompare(b.authors || ''));
        break;
      case 'year':
        result.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
        break;
    }

    setFilteredBooks(result);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem excluir livros');
      return;
    }
    setBookToDelete(id);
  };

  const confirmDelete = async () => {
    if (bookToDelete) {
      const success = await storageUtils.deleteBook(bookToDelete);
      if (success) {
        loadBooks();
        toast.success('Livro excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir livro');
      }
      setBookToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Alerta para usuários viewer */}
        {!isAdmin && (
          <div className="bg-white border border-gray-200 p-4 mb-6 rounded-lg shadow-sm flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900">Modo Visualização</p>
              <p className="text-sm text-gray-500">Você tem acesso somente leitura ao acervo.</p>
            </div>
          </div>
        )}

        {/* Barra de busca e filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por título, autor, ISBN, assunto ou número de registro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-black focus:ring-black h-12 text-base"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 border-gray-200 h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="title">Título (A-Z)</SelectItem>
                <SelectItem value="author">Autor (A-Z)</SelectItem>
                <SelectItem value="year">Ano (mais novo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Total de Livros</p>
                <p className="text-4xl font-bold text-gray-900">{books.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Resultados</p>
                <p className="text-4xl font-bold text-gray-900">{filteredBooks.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Search className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">Próximo Registro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nextRegistrationNumber}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de livros */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Nenhum livro encontrado' : 'Nenhum livro cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Tente usar outros termos de busca'
                : 'Comece adicionando seu primeiro livro ao acervo'
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {filteredBooks.slice(0, displayLimit).map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={isAdmin ? handleDelete : undefined}
                  index={index}
                />
              ))}
            </div>

            {displayLimit < filteredBooks.length && (
              <Button
                variant="outline"
                className="mt-8 px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                onClick={() => setDisplayLimit(prev => prev + 50)}
              >
                Carregar Mais Livros
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}