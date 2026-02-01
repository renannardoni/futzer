export type CourtType = "society" | "grama" | "salao";

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
  precoPorHora: number;
  tipoPiso: CourtType;
  imagemCapa: string;
  avaliacao: number;
}
