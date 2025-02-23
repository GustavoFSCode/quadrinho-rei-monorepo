export interface Winner {
  id: string;
  name: string;
  photo: string;
  cartela: number[];
  numerosMarcado: number[];
  valorPremio: string;
  vencedorRodada: boolean;
  acumuladoBolaDaVez: boolean;
  acumuladoQuina: boolean;
  acumuladoQuadra: boolean;
  acumuladoX: boolean;
}

export interface Winner90 {
  id: string;
  name: string;
  photo: string;
  cartela: number[];
  numerosMarcado: number[];
  valorPremio: string;
  numerosDesativados: number[];
  vencedorLinha: boolean;
  vencedorCartelaCheia: boolean;
  acumuladoCartelaCheia: boolean;
}

export const winners: Winner[] = [
  {
    id: '1',
    name: 'Peter Parker',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63,
      5, 18, 39, 50, 65,
      9, 21, 0, 54, 66,
      12, 26, 40, 55, 73,
      15, 29, 45, 60, 75
    ],
    numerosMarcado: [3, 12, 29, 39, 0, 46, 50, 54, 55, 60, 73],
    valorPremio: ' R$ 100,00',
    vencedorRodada: true,
    acumuladoBolaDaVez: false,
    acumuladoQuina: false,
    acumuladoQuadra: false,
    acumuladoX: false
  },
  {
    id: '2',
    name: 'Gustavo Ferreira',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63,
      5, 18, 39, 50, 65,
      9, 21, 0, 54, 66,
      12, 26, 40, 55, 73,
      15, 29, 45, 60, 75
    ],
    numerosMarcado: [3, 63, 16, 31, 0, 46, 12, 73, 15, 45],
    valorPremio: 'R$ 100,00',
    vencedorRodada: true,
    acumuladoBolaDaVez: false,
    acumuladoQuina: false,
    acumuladoQuadra: false,
    acumuladoX: false
  },
  {
    id: '3',
    name: 'Barry Allen',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63,
      5, 18, 39, 50, 65,
      9, 21, 0, 54, 66,
      12, 26, 40, 55, 73,
      15, 29, 45, 60, 75
    ],
    numerosMarcado: [63, 39, 50, 0, 66, 12, 26, 73, 15],
    valorPremio: 'R$ 100,00',
    vencedorRodada: true,
    acumuladoBolaDaVez: false,
    acumuladoQuina: false,
    acumuladoQuadra: false,
    acumuladoX: false
  },
];

export const winners90: Winner90[] = [
  {
    id: '1',
    name: 'Eddie Brock',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63, 5, 18, 39, 50,
      65, 9, 21, 2, 54, 66, 22, 26, 40,
      55, 73, 15, 29, 45, 60, 75, 11, 24
    ],
    numerosMarcado: [55, 73, 21, 31, 29, 60, 66, 11, 50],
    valorPremio: 'R$ 100,00',
    numerosDesativados: [16, 9, 15, 46, 54, 45, 5, 22, 75, 39, 26, 24],
    vencedorLinha: true,
    vencedorCartelaCheia: false,
    acumuladoCartelaCheia: false,
  },
  {
    id: '2',
    name: 'Gabriel Ferreira',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63, 5, 18, 39, 50,
      65, 9, 21, 2, 54, 66, 22, 26, 40,
      55, 73, 15, 29, 45, 60, 75, 11, 24
    ],
    numerosMarcado: [55, 73, 21, 31, 29, 60, 66, 11, 50],
    numerosDesativados: [16, 9, 15, 46, 54, 45, 5, 22, 75, 39, 26, 24],
    valorPremio: 'R$ 100,00',
    vencedorLinha: true,
    vencedorCartelaCheia: true,
    acumuladoCartelaCheia: false,
  },
  {
    id: '3',
    name: 'Eobard Thawne',
    photo: '/assets/images/FaceDev.jpg',
    cartela: [
      3, 16, 31, 46, 63, 5, 18, 39, 50,
      65, 9, 21, 2, 54, 66, 22, 26, 40,
      55, 73, 15, 29, 45, 60, 75, 11, 24
    ],
    numerosMarcado: [55, 73, 21, 31, 29, 60, 66, 11, 50],
    numerosDesativados: [16, 9, 15, 46, 54, 45, 5, 22, 75, 39, 26, 24],
    valorPremio: 'R$ 100,00',
    vencedorLinha: true,
    vencedorCartelaCheia: false,
    acumuladoCartelaCheia: false,
  },
];
