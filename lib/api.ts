const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Localizacao {
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number;
  longitude: number;
}

export interface Disponibilidade {
  dias_semana: string[];
  horario_abertura: string;
  horario_fechamento: string;
}

export interface Quadra {
  id: string;
  nome: string;
  tipo: string;
  esporte: string;
  descricao: string;
  preco_hora: number;
  localizacao: Localizacao;
  disponibilidade: Disponibilidade;
  comodidades: string[];
  imagens: string[];
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
  esporte?: string;
  preco_max?: number;
}): Promise<Quadra[]> {
  const params = new URLSearchParams();
  
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.cidade) params.append('cidade', filters.cidade);
  if (filters?.esporte) params.append('esporte', filters.esporte);
  if (filters?.preco_max) params.append('preco_max', filters.preco_max.toString());

  const url = `${API_URL}/quadras/${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao carregar quadras');
  }

  return response.json();
}

export async function getQuadraById(id: string): Promise<Quadra> {
  const response = await fetch(`${API_URL}/quadras/${id}`);

  if (!response.ok) {
    throw new Error('Quadra não encontrada');
  }

  return response.json();
}

export async function createQuadra(quadra: Omit<Quadra, 'id'>): Promise<Quadra> {
  const token = getToken();
  if (!token) {
    throw new Error('Você precisa estar logado para criar uma quadra');
  }

  const response = await fetch(`${API_URL}/quadras/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao criar quadra');
  }

  return response.json();
}

export async function updateQuadra(id: string, updates: Partial<Quadra>): Promise<Quadra> {
  const token = getToken();
  if (!token) {
    throw new Error('Você precisa estar logado para atualizar uma quadra');
  }

  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar quadra');
  }

  return response.json();
}

export async function deleteQuadra(id: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Você precisa estar logado para deletar uma quadra');
  }

  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao deletar quadra');
  }
}

export function logout() {
  removeToken();
}
