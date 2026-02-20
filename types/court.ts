export type CourtType = "society" | "grama" | "salao" | "quadra" | "campo" | "areia";

export interface Court {
  id: string;
  nome: string;
  tipo: string;
  esporte: string;
  descricao: string;
  preco_hora: number;
  localizacao: {
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude: number;
    longitude: number;
  };
  disponibilidade: {
    dias_semana: string[];
    horario_abertura: string;
    horario_fechamento: string;
  };
  comodidades: string[];
  imagens: string[];
  
  // Campos compatíveis com versão antiga
  endereco?: {
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
  };
  precoPorHora?: number;
  tipoPiso?: CourtType;
  imagemCapa?: string;
  avaliacao?: number;
}
