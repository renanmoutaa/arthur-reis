import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authUtils } from '../utils/auth';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Mail,
  Shield,
  Eye,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Separator } from '../components/ui/separator';

export function Settings() {
  const navigate = useNavigate();
  const currentUser = authUtils.getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email || ''
      }));
    }
  }, [navigate, currentUser]);

  const handleUpdateProfile = () => {
    if (!formData.name) {
      toast.error('O nome é obrigatório');
      return;
    }

    if (currentUser) {
      const success = authUtils.updateUser(currentUser.username, {
        name: formData.name,
        email: formData.email || undefined,
        username: currentUser.username,
        password: '', // mantém a senha atual
        role: currentUser.role,
        createdAt: ''
      });

      if (success) {
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    }
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Verifica a senha atual
    const loginSuccess = authUtils.login(currentUser!.username, formData.currentPassword);
    if (!loginSuccess) {
      toast.error('Senha atual incorreta');
      return;
    }

    // Atualiza a senha
    if (currentUser) {
      const success = authUtils.updateUser(currentUser.username, {
        password: formData.newPassword,
        username: currentUser.username,
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
        createdAt: ''
      });

      if (success) {
        toast.success('Senha alterada com sucesso!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error('Erro ao alterar senha');
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Configurações
          </h2>
          <p className="text-gray-600 mt-1">Gerencie suas informações e preferências</p>
        </div>

        <div className="space-y-6">
          {/* Informações da conta */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações da Conta
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">@{currentUser.username}</p>
                  <Badge 
                    variant={currentUser.role === 'admin' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {currentUser.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrador
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Visitante
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label>Nome de Usuário</Label>
                <Input
                  value={currentUser.username}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O nome de usuário não pode ser alterado
                </p>
              </div>

              <Button onClick={handleUpdateProfile} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Digite a nova senha"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Digite a nova senha novamente"
                />
              </div>

              <Button onClick={handleChangePassword} className="w-full" variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
