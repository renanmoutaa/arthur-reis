import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authUtils, User } from '../utils/auth';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Users as UsersIcon, 
  Plus, 
  Trash2, 
  Shield, 
  Eye,
  Mail,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
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

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'viewer' as 'admin' | 'viewer'
  });

  const currentUser = authUtils.getCurrentUser();

  useEffect(() => {
    if (!authUtils.isAdmin()) {
      toast.error('Acesso negado');
      navigate('/');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    const allUsers = authUtils.getAllUsers();
    setUsers(allUsers);
  };

  const handleAddUser = () => {
    if (!formData.username || !formData.password || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const success = authUtils.register(
      formData.username,
      formData.password,
      formData.name,
      formData.role,
      formData.email
    );

    if (success) {
      toast.success('Usuário adicionado com sucesso!');
      setShowAddDialog(false);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'viewer'
      });
      loadUsers();
    } else {
      toast.error('Nome de usuário já existe');
    }
  };

  const handleDelete = (username: string) => {
    setUserToDelete(username);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const success = authUtils.deleteUser(userToDelete);
      if (success) {
        toast.success('Usuário excluído com sucesso!');
        loadUsers();
      } else {
        toast.error('Erro ao excluir usuário');
      }
      setUserToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gerenciar Usuários
            </h2>
            <p className="text-gray-600 mt-1">Adicione e gerencie usuários do sistema</p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário ao sistema
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Ex: joao.silva"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="joao@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Perfil *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'admin' | 'viewer') => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Visitante
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUser}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.username} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <CardDescription className="mt-1">@{user.username}</CardDescription>
                  </div>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Viewer
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </div>

                {currentUser?.username !== user.username && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 mt-4"
                    onClick={() => handleDelete(user.username)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Usuário
                  </Button>
                )}

                {currentUser?.username === user.username && (
                  <Badge variant="outline" className="w-full justify-center mt-4">
                    Você
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
