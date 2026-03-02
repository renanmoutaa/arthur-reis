import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authUtils } from '../utils/auth';
import { storageUtils } from '../utils/storage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Library, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      // Inicializa usuário padrão e dados mock
      authUtils.initDefaultUser();
      await storageUtils.initializeMockData();

      // Redireciona se já estiver logado
      if (authUtils.isAuthenticated()) {
        navigate('/');
      }
    };
    init();
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const success = authUtils.login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Library className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Sistema Bibliográfico</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema de gerenciamento de acervo
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-sm space-y-3">
              <div>
                <p className="font-semibold text-blue-900 mb-2">👨‍💼 Administrador:</p>
                <p className="text-blue-800">Usuário: <strong>admin</strong> | Senha: <strong>admin123</strong></p>
                <p className="text-xs text-blue-600 mt-1">Acesso total: adicionar, editar e excluir livros</p>
              </div>
              <div className="border-t border-blue-200 pt-2">
                <p className="font-semibold text-blue-900 mb-2">👁️ Visitante:</p>
                <p className="text-blue-800">Usuário: <strong>viewer</strong> | Senha: <strong>viewer123</strong></p>
                <p className="text-xs text-blue-600 mt-1">Acesso somente leitura: visualizar livros</p>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}