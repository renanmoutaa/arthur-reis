import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { storageUtils, Book } from '../utils/storage';
import { authUtils } from '../utils/auth';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function AddBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const isAdmin = authUtils.isAdmin();

  const [formData, setFormData] = useState({
    registrationNumber: '',
    title: '',
    authors: '',
    year: new Date().getFullYear().toString(),
    isbn: '',
    publisher: '',
    subjects: '',
    summary: '',
    location: '',
  });

  useEffect(() => {
    const initReg = async () => {
      if (!isEdit) {
        const nextReg = await storageUtils.getNextRegistrationNumber();
        setFormData(prev => ({ ...prev, registrationNumber: nextReg }));
      }
    };
    initReg();
  }, [isEdit]);

  const [coverImage, setCoverImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica se é admin
    if (!isAdmin) {
      toast.error('Apenas administradores podem adicionar ou editar livros');
      navigate('/');
      return;
    }

    const fetchBook = async () => {
      if (isEdit && id) {
        const book = await storageUtils.getBookById(id);
        if (book) {
          setFormData({
            registrationNumber: book.registrationNumber || '',
            title: book.title,
            authors: book.authors || '',
            year: book.year || '',
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            subjects: book.subjects || book.subject || '',
            summary: book.summary || '',
            location: book.location || '',
          });
          if (book.coverImage) {
            setCoverImage(book.coverImage);
          }
        } else {
          toast.error('Livro não encontrado');
          navigate('/');
        }
      }
    };
    fetchBook();
  }, [isEdit, id, navigate, isAdmin]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      try {
        const base64 = await storageUtils.imageToBase64(file);
        setCoverImage(base64);
        setImageFile(file);
      } catch (error) {
        toast.error('Erro ao carregar imagem');
      }
    }
  };

  const handleRemoveImage = () => {
    setCoverImage('');
    setImageFile(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.authors) {
        toast.error('Título e autor são obrigatórios');
        setLoading(false);
        return;
      }

      const bookData: Partial<Book> = {
        title: formData.title,
        authors: formData.authors,
        year: formData.year,
        isbn: formData.isbn,
        publisher: formData.publisher,
        subject: formData.subjects,
        summary: formData.summary,
        location: formData.location,
        coverImage: coverImage || undefined,
      };

      if (isEdit && id) {
        await storageUtils.updateBook(id, bookData);
        toast.success('Livro atualizado com sucesso!');
      } else {
        await storageUtils.addBook({
          ...bookData,
          registrationNumber: formData.registrationNumber,
        } as Partial<Book>);
        toast.success('Livro adicionado com sucesso!');
      }

      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar livro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{isEdit ? 'Editar Livro' : 'Adicionar Novo Livro'}</CardTitle>
            <CardDescription>
              Preencha as informações bibliográficas do livro
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Foto da capa */}
              <div>
                <Label>Foto da Capa</Label>
                <div className="mt-2">
                  {coverImage ? (
                    <div className="relative inline-block">
                      <img
                        src={coverImage}
                        alt="Capa do livro"
                        className="w-48 h-64 object-cover rounded-lg border border-gray-100 shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Adicionar foto</span>
                      <span className="text-xs text-gray-400 mt-1">Recomendado: 400x600px</span>
                      <span className="text-xs text-gray-400">Máx. 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Número de Registro */}
              <div>
                <Label htmlFor="registrationNumber">Número de Registro *</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  required
                  disabled={isEdit}
                />
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o título do livro"
                />
              </div>

              {/* Autores */}
              <div>
                <Label htmlFor="authors">Autor(es) *</Label>
                <Input
                  id="authors"
                  name="authors"
                  value={formData.authors}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: João Silva; Maria Santos"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe múltiplos autores com ponto e vírgula (;)
                </p>
              </div>

              {/* Ano e ISBN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano de Publicação</Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                  />
                </div>

                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="978-3-16-148410-0"
                  />
                </div>
              </div>

              {/* Editora */}
              <div>
                <Label htmlFor="publisher">Editora</Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  placeholder="Nome da editora"
                />
              </div>

              {/* Assuntos/Palavras-chave */}
              <div>
                <Label htmlFor="subjects">Assuntos / Palavras-chave</Label>
                <Input
                  id="subjects"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  placeholder="Ex: Tecnologia, Programação, Web Development"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe os assuntos com vírgula (,)
                </p>
              </div>

              {/* Localização */}
              <div>
                <Label htmlFor="location">Localização Física</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Estante A, Prateleira 3"
                />
              </div>

              {/* Resumo */}
              <div>
                <Label htmlFor="summary">Resumo / Descrição</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Digite um breve resumo do conteúdo do livro"
                  rows={5}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Adicionar'}
                </Button>

                <Link to="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div >
  );
}