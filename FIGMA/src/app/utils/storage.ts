export interface Book {
  id: string;
  registrationNumber: string | null;
  title: string;
  authors: string | null;
  year: string | null;
  isbn: string | null;
  publisher: string | null;
  subject: string | null;
  subjects: string | null;
  coverImage?: string; // base64
  createdAt: string;
  updatedAt: string;
  summary: string | null;
  location: string | null;
  mfn?: number;
}

const API_URL = 'http://localhost:3000';

export const storageUtils = {
  // Inicializa com livros mock
  initializeMockData: async () => {
    // No-op - backend has DB
  },

  // Obtém todos os livros
  getBooks: async (skip = 0, take = 50, searchString?: string, orderBy?: string): Promise<Book[]> => {
    const params = new URLSearchParams();
    if (skip) params.append('skip', skip.toString());
    if (take) params.append('take', take.toString());
    if (searchString) params.append('searchString', searchString);
    if (orderBy) params.append('orderBy', orderBy);

    const res = await fetch(`${API_URL}/books?${params.toString()}`);
    const result = await res.json();
    return result.data || [];
  },

  // Obtém um livro por ID
  getBookById: async (id: string): Promise<Book | null> => {
    const res = await fetch(`${API_URL}/books/${id}`);
    if (res.status === 404) return null;
    return await res.json();
  },

  // Adiciona um novo livro
  addBook: async (book: Partial<Book>): Promise<Book> => {
    const res = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book)
    });
    return await res.json();
  },

  // Atualiza um livro existente
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Falha ao atualizar livro');
    return await res.json();
  },

  // Remove um livro
  deleteBook: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/books/${id}`, { method: "DELETE" });
    return res.ok;
  },

  // Busca livros
  searchBooks: async (query: string): Promise<Book[]> => {
    return storageUtils.getBooks(0, 50, query);
  },

  // Converte e redimensiona imagem para base64 (Máximo 400x600)
  imageToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // JPEG with 80% quality to save space
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  // Gera próximo número de registro
  getNextRegistrationNumber: async (): Promise<string> => {
    const res = await fetch(`${API_URL}/books/next-registration/number`);
    const data = await res.json();
    return data.number || `REG-000000`;
  },

  // Obtém categorias/assuntos únicos
  getCategories: async (): Promise<string[]> => {
    const res = await fetch(`${API_URL}/books/categories`);
    return await res.json();
  }
};