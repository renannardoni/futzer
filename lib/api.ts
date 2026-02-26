const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';

  const raw = url.trim();

  // Fix malformed URLs like: https://api.domainhttps://res.cloudinary.com/...
  const secondProtocolIndex = raw.indexOf('https://', 8);
  const secondHttpProtocolIndex = raw.indexOf('http://', 7);
  const duplicateProtocolIndex =
    secondProtocolIndex !== -1
      ? secondProtocolIndex
      : secondHttpProtocolIndex;

  if (duplicateProtocolIndex !== -1) {
    return raw.slice(duplicateProtocolIndex);
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  if (raw.startsWith('/uploads/')) {
    return `${API_BASE_URL}${raw}`;
  }

  if (raw.startsWith('uploads/')) {
    return `${API_BASE_URL}/${raw}`;
  }

  return raw;
}

// Types
export interface Endereco {
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Quadra {
  id: string;
  nome: string;
  descricao: string;
  endereco: Endereco;
  coordenadas: Coordenadas;
  precoPorHora?: number | null;
  tipoPiso: string;
  modalidade?: string;
  imagemCapa: string;
  imagens?: string[];
  avaliacao: number;
  telefone?: string | null;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Storage helpers
const TOKEN_KEY = 'futzer_token';

export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// API functions
export async function registerUser(nome: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao registrar usuário');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao fazer login');
  }

  const data = await response.json();
  saveToken(data.access_token);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const token = getToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    throw new Error('Erro ao obter dados do usuário');
  }

  return response.json();
}

export async function getQuadras(filters?: {
  tipo?: string;
  cidade?: string;
  preco_max?: number;
}): Promise<Quadra[]> {
  const params = new URLSearchParams();
  
  if (filters?.tipo) params.append('tipo_piso', filters.tipo);
  if (filters?.cidade) params.append('cidade', filters.cidade);
  if (filters?.preco_max) params.append('preco_max', filters.preco_max.toString());

  const url = `${API_URL}/quadras/${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao carregar quadras');
  }

  const data: Quadra[] = await response.json();
  return data.map((quadra) => ({
    ...quadra,
    imagemCapa: normalizeImageUrl(quadra.imagemCapa),
    imagens: (quadra.imagens ?? []).map(normalizeImageUrl).filter(Boolean),
  }));
}

export async function getQuadraById(id: string): Promise<Quadra> {
  const response = await fetch(`${API_URL}/quadras/${id}`);

  if (!response.ok) {
    throw new Error('Quadra não encontrada');
  }

  const quadra: Quadra = await response.json();
  return {
    ...quadra,
    imagemCapa: normalizeImageUrl(quadra.imagemCapa),
    imagens: (quadra.imagens ?? []).map(normalizeImageUrl).filter(Boolean),
  };
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload/imagem`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao fazer upload da imagem');
  }

  const data = await response.json();
  return normalizeImageUrl(data.url);
}

export async function createQuadra(quadra: Omit<Quadra, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Quadra> {
  const response = await fetch(`${API_URL}/quadras/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao criar quadra');
  }

  return response.json();
}

export async function updateQuadra(id: string, updates: Partial<Quadra>): Promise<Quadra> {
  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar quadra');
  }

  return response.json();
}

export async function deleteQuadra(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao deletar quadra');
  }
}

export function logout() {
  removeToken();
}
