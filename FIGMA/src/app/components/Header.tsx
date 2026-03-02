import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { LogOut, Library, Plus, Settings, Users, Shield, Eye } from 'lucide-react';
import { authUtils } from '../utils/auth';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authUtils.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    authUtils.logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-lg">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black uppercase tracking-tight">
                Biblioteca
              </h1>
              <p className="text-xs text-gray-400 font-medium">Acervo Bibliográfico</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <Link to="/add-book">
                  <Button
                    className="bg-black text-white hover:bg-gray-800 transition-colors rounded-lg px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Livro
                  </Button>
                </Link>

                <Link to="/users">
                  <Button
                    variant="outline"
                    className={location.pathname === '/users' ? 'bg-gray-100' : ''}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Usuários
                  </Button>
                </Link>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-100">
                  <Avatar>
                    <AvatarFallback className="bg-gray-100 text-black font-semibold">
                      {user && getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                    <Badge
                      variant={isAdmin ? "default" : "secondary"}
                      className="w-fit mt-1"
                    >
                      {isAdmin ? (
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
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
