export type CourtType = "society" | "grama" | "salao" | "quadra" | "campo" | "areia";

export interface Court {
  id: string;
  nome: string;
  descricao: string;
  endereco: {
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  coordenadas: {
    lat: number;
    lng: number;
  };
  precoPorHora?: number | null;
  tipoPiso: string;
  imagemCapa: string;
  avaliacao: number;
  telefone?: string | null;
  owner_id?: string;
}
