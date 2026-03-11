import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddBook } from './pages/AddBook';
import { BookDetail } from './pages/BookDetail';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/add-book',
    element: (
      <ProtectedRoute adminOnly>
        <AddBook />
      </ProtectedRoute>
    ),
  },
  {
    path: '/edit-book/:id',
    element: (
      <ProtectedRoute adminOnly>
        <AddBook />
      </ProtectedRoute>
    ),
  },
  {
    path: '/book/:id',
    element: (
      <ProtectedRoute>
        <BookDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
]);