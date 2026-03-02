import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { storageUtils, Book } from '../utils/storage';
import { authUtils } from '../utils/auth';
import { Header } from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Hash,
  Building2,
  Tags,
  MapPin,
  FileText
} from 'lucide-react';
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

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = authUtils.isAdmin();

  useEffect(() => {
    const fetchBook = async () => {
      if (id) {
        const foundBook = await storageUtils.getBookById(id);
        if (foundBook) {
          setBook(foundBook);
        } else {
          toast.error('Livro não encontrado');
          navigate('/');
        }
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem excluir livros');
      return;
    }

    if (id) {
      const success = await storageUtils.deleteBook(id);
      if (success) {
        toast.success('Livro excluído com sucesso!');
        navigate('/');
      } else {
        toast.error('Erro ao excluir livro');
      }
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da imagem */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="aspect-[3/4] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden mb-4 shadow-sm">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-gray-200" />
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <Link to={`/edit-book/${book.id}`} className="block">
                      <Button variant="outline" className="w-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna das informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações principais */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-black mb-2">{book.title}</CardTitle>
                    <p className="text-xl text-gray-500 font-medium">{book.authors}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50 border-gray-200 text-gray-700">
                    <Calendar className="w-4 h-4 mr-1" />
                    {book.year}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1 bg-white border-gray-200 text-gray-500">
                    <Hash className="w-4 h-4 mr-1" />
                    {book.registrationNumber}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Detalhes bibliográficos */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Detalhes Bibliográficos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {book.isbn && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">ISBN</p>
                      <p className="text-base">{book.isbn}</p>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Editora</p>
                      <p className="text-base">{book.publisher}</p>
                    </div>
                  </div>
                )}

                {book.subjects && (
                  <div className="flex items-start gap-3">
                    <Tags className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Assuntos</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.subjects.split(',').map((subject, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            {subject.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {book.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Localização</p>
                      <p className="text-base">{book.location}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo */}
            {book.summary && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {book.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadados */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Cadastrado em:</strong>{' '}
                  {new Date(book.createdAt).toLocaleString('pt-BR')}
                </p>
                <p>
                  <strong>Última atualização:</strong>{' '}
                  {new Date(book.updatedAt).toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog de confirmação */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o livro "{book.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}