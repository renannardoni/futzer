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

export interface HorarioDia {
  slots: string[];  // horários disponíveis ex: ["08:00", "08:15", "08:30"]
}

export interface HorariosSemanais {
  seg: HorarioDia;
  ter: HorarioDia;
  qua: HorarioDia;
  qui: HorarioDia;
  sex: HorarioDia;
  sab: HorarioDia;
  dom: HorarioDia;
}

export const DEFAULT_HORARIO_DIA: HorarioDia = { slots: [] };

export const DEFAULT_HORARIOS_SEMANAIS: HorariosSemanais = {
  seg: { slots: [] },
  ter: { slots: [] },
  qua: { slots: [] },
  qui: { slots: [] },
  sex: { slots: [] },
  sab: { slots: [] },
  dom: { slots: [] },
};

export interface SubQuadra {
  id: string;
  nome: string;
  tipoPiso: string;
  cobertura: string;
  imagemCapa?: string;
  horariosSemanais: HorariosSemanais;
}

export interface Reserva {
  id: string;
  quadra_id: string;
  data: string;        // "2026-03-08"
  hora_inicio: string; // "08:00" (formato HH:MM)
  duracao: number;     // duração em minutos (múltiplo de 15, default 60)
  nome_cliente: string;
  telefone?: string;
  recorrencia?: string | null;          // "semanal" | "quinzenal" | "mensal"
  recorrencia_grupo_id?: string | null; // UUID para agrupar reservas recorrentes
}

// Gera os slots de 15 min ocupados por uma reserva
export function slotsOcupados(horaInicio: string, duracao: number): string[] {
  const [h, m] = horaInicio.split(":").map(Number);
  const totalMin = h * 60 + m;
  const slots: string[] = [];
  for (let offset = 0; offset < duracao; offset += 15) {
    const t = totalMin + offset;
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
}

// Gera todos os slots de 15 min entre startHour e endHour
export function generateAllSlots(startHour = 6, endHour = 23): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === endHour && m > 0) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export const DURACAO_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 75, label: "1h15" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2h" },
  { value: 150, label: "2h30" },
  { value: 180, label: "3h" },
  { value: 210, label: "3h30" },
  { value: 240, label: "4h" },
];

export interface Quadra {
  id: string;
  nome: string;
  descricao: string;
  endereco: Endereco;
  coordenadas: Coordenadas;
  precoPorHora?: number | null;
  tipoPiso: string;
  cobertura?: string;
  modalidade?: string;
  imagemCapa: string;
  imagens?: string[];
  avaliacao: number;
  telefone?: string | null;
  owner_id?: string;
  ativo?: boolean;
  mostrarDisponibilidade?: boolean;
  horariosSemanais?: HorariosSemanais;
  datasBloqueadas?: string[];
  quadrasInternas?: SubQuadra[];
  reservas?: Reserva[];
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
const ADMIN_TOKEN_KEY = 'futzer_admin_token';

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

// Admin auth helpers
export const saveAdminToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const getAdminToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem(ADMIN_TOKEN_KEY);
  return null;
};

export const removeAdminToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export async function adminLogin(password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Senha incorreta');
  }
  const data = await response.json();
  saveAdminToken(data.access_token);
  return data;
}

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
  include_inativos?: boolean;
}): Promise<Quadra[]> {
  const params = new URLSearchParams();

  if (filters?.tipo) params.append('tipo_piso', filters.tipo);
  if (filters?.cidade) params.append('cidade', filters.cidade);
  if (filters?.preco_max) params.append('preco_max', filters.preco_max.toString());
  if (filters?.include_inativos) params.append('include_inativos', 'true');

  const url = `${API_URL}/quadras/${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao carregar quadras');
  }

  const data: Quadra[] = await response.json();
  return data.map((quadra) => ({
    ...quadra,
    modalidade: quadra.modalidade ?? "aluguel",
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
    modalidade: quadra.modalidade ?? "aluguel",
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

export async function getMinhasQuadras(): Promise<Quadra[]> {
  const token = getToken();
  if (!token) throw new Error('Não autenticado');

  const response = await fetch(`${API_URL}/quadras/minhas`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 401) { removeToken(); throw new Error('Sessão expirada'); }
    throw new Error('Erro ao carregar suas quadras');
  }

  const data: Quadra[] = await response.json();
  return data.map((quadra) => ({
    ...quadra,
    modalidade: quadra.modalidade ?? "aluguel",
    imagemCapa: normalizeImageUrl(quadra.imagemCapa),
    imagens: (quadra.imagens ?? []).map(normalizeImageUrl).filter(Boolean),
  }));
}

export async function createQuadra(quadra: Omit<Quadra, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Quadra> {
  const token = getAdminToken() || getToken();
  const response = await fetch(`${API_URL}/quadras/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
  const token = getAdminToken() || getToken();
  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
  const token = getAdminToken() || getToken();
  const response = await fetch(`${API_URL}/quadras/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao deletar quadra');
  }
}

export async function toggleQuadraAtivo(id: string): Promise<{ ativo: boolean }> {
  const token = getAdminToken() || getToken();
  const response = await fetch(`${API_URL}/quadras/${id}/toggle-ativo`, {
    method: 'PATCH',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao alterar status');
  }
  return response.json();
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao enviar email');
  }
}

export async function resetPassword(token: string, new_password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erro ao redefinir senha');
  }
}

export function logout() {
  removeToken();
  removeAdminToken();
}

// ── Sub-courts ────────────────────────────────────────────────────────────────

export async function addCourt(arenaId: string, data: Partial<SubQuadra>): Promise<SubQuadra> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/courts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erro');
  return res.json();
}

export async function updateCourt(arenaId: string, courtId: string, data: Partial<SubQuadra>): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/courts/${courtId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erro');
}

export async function deleteCourt(arenaId: string, courtId: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/courts/${courtId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao excluir quadra');
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function addBooking(arenaId: string, booking: Omit<Reserva, 'id'>): Promise<Reserva> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erro');
  return res.json();
}

export async function deleteBooking(arenaId: string, bookingId: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao excluir reserva');
}

export interface RecurrentBookingPayload {
  quadra_id: string;
  hora_inicio: string;  // "08:00"
  duracao: number;      // minutos
  nome_cliente: string;
  telefone?: string;
  dias_semana: number[]; // 0=seg, 1=ter, ..., 6=dom
  data_inicio: string; // "2026-03-22"
  data_fim?: string; // "2027-03-22" (default 1 ano)
}

export async function addRecurrentBooking(
  arenaId: string, data: RecurrentBookingPayload
): Promise<{ grupo_id: string; count: number; conflitos: number; conflitos_datas: string[]; bookings: Reserva[] }> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/bookings/recurrent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const detail = errBody.detail;
    if (typeof detail === 'object' && detail?.conflitos_datas) {
      // 409 com dados de conflito estruturados
      const err = new Error(detail.detail || 'Todos os horários já estão reservados');
      (err as Error & { conflitos_datas: string[]; conflitos: number }).conflitos_datas = detail.conflitos_datas;
      (err as Error & { conflitos: number }).conflitos = detail.conflitos;
      throw err;
    }
    throw new Error(typeof detail === 'string' ? detail : 'Erro ao criar recorrência');
  }
  return res.json();
}

export async function deleteBookingGroup(arenaId: string, grupoId: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/quadras/${arenaId}/bookings/group/${grupoId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erro ao excluir grupo de reservas');
}
