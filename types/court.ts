export type CourtType = "society" | "grama" | "salao" | "quadra" | "campo" | "areia";
export type Modalidade = "publica" | "clube" | "aluguel";

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
  modalidade?: Modalidade | string;
  imagemCapa: string;
  imagens?: string[];
  avaliacao: number;
  telefone?: string | null;
  owner_id?: string;
}
