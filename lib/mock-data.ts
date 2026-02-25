import { Court } from "@/types/court";

export const mockCourts: Court[] = [
  {
    id: "1",
    nome: "Arena Premium Sports",
    descricao: "Quadra de futebol society com grama sintética de alta qualidade",
    endereco: {
      rua: "Rua das Acácias, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
    },
    coordenadas: {
      lat: -23.5505,
      lng: -46.6333,
    },
    precoPorHora: 150.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop",
    avaliacao: 4.8,
  },
  {
    id: "2",
    nome: "Campo Verde FC",
    descricao: "Campo de futebol com grama natural impecável",
    endereco: {
      rua: "Av. Paulista, 1500",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
    },
    coordenadas: {
      lat: -23.5629,
      lng: -46.6544,
    },
    precoPorHora: 200.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    avaliacao: 4.9,
  },
  {
    id: "3",
    nome: "Tennis Club SP",
    descricao: "Quadra de tênis profissional com pé duro e iluminação LED",
    endereco: {
      rua: "Rua Augusta, 2500",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01412-100",
    },
    coordenadas: {
      lat: -23.5558,
      lng: -46.6619,
    },
    precoPorHora: 120.00,
    tipoPiso: "tenis",
    imagemCapa: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&h=600&fit=crop",
    avaliacao: 4.7,
  },
  {
    id: "4",
    nome: "Society Elite",
    descricao: "Quadra society com iluminação LED e vestiários completos",
    endereco: {
      rua: "Av. Faria Lima, 3000",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01452-000",
    },
    coordenadas: {
      lat: -23.5781,
      lng: -46.6872,
    },
    precoPorHora: 180.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop",
    avaliacao: 4.6,
  },
  {
    id: "5",
    nome: "Arena Gramado",
    descricao: "Campo de futebol profissional com grama natural premium",
    endereco: {
      rua: "Rua da Consolação, 500",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01302-000",
    },
    coordenadas: {
      lat: -23.5489,
      lng: -46.6388,
    },
    precoPorHora: 250.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop",
    avaliacao: 5.0,
  },
  {
    id: "6",
    nome: "Tênis Vila Madalena",
    descricao: "Quadra de tênis comunitária bem mantida",
    endereco: {
      rua: "Rua Harmonia, 200",
      cidade: "São Paulo",
      estado: "SP",
      cep: "05435-000",
    },
    coordenadas: {
      lat: -23.5445,
      lng: -46.6909,
    },
    precoPorHora: 80.00,
    tipoPiso: "tenis",
    imagemCapa: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&h=600&fit=crop",
    avaliacao: 4.3,
  },
  {
    id: "7",
    nome: "Arena Itaim",
    descricao: "Quadra de futebol moderna no coração do Itaim",
    endereco: {
      rua: "Rua João Cachoeira, 800",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04535-012",
    },
    coordenadas: {
      lat: -23.5844,
      lng: -46.6753,
    },
    precoPorHora: 190.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop",
    avaliacao: 4.7,
  },
  {
    id: "8",
    nome: "Campo Morumbi",
    descricao: "Campo profissional com grama natural",
    endereco: {
      rua: "Av. Giovanni Gronchi, 5000",
      cidade: "São Paulo",
      estado: "SP",
      cep: "05724-003",
    },
    coordenadas: {
      lat: -23.6236,
      lng: -46.7194,
    },
    precoPorHora: 220.00,
    tipoPiso: "futebol",
    imagemCapa: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    avaliacao: 4.8,
  },
];

// Export alias for compatibility
export const courts = mockCourts;
