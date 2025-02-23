
export interface DadosFalsos {
    id: string;
    data: string;
    horario: string;
    cartelaPreco?: string;
    linkLive?: string;
    gameType: string;
    salaData?: any;
}

const sala75Data = {
    minCashBola: '100,00',
    maxCashBola: '500,00',
    minCashQuina: '50,00',
    maxCashQuina: '250,00',
    minCashQuadra: '30,00',
    maxCashQuadra: '150,00',
    minCashX: '20,00',
    maxCashX: '100,00',
    minCashStartRound: '200,00',
    maxCartelasPorRodada: '5',
    bolasParaRevisarPedido: '3',
    roundWinner: '10',
    timeBoll: '15',
    master: '20',
    quinaAcumulated: '5',
    quadraAcumulated: '3',
    xAcumulated: '2',
    limitWinsBolls: '4'
};

const sala90Data = {
    minCashFullCard: '200,00',
    maxCashFullCard: '800,00',
    minCashStartRound: '300,00',
    maxCartelasPorRodada: '10',
    bolasParaRevisarPedido: '5',
    acumulatedFullCard: '15',
    master: '25',
    fullCard: '20',
    line: '10',
    limitWinsBolls: '6'
};

export const dadosFalsos: DadosFalsos[] = [
    {
        id: '118161',
        data: '25/10/2024',
        horario: '10:30',
        cartelaPreco: 'R$ 10,00',
        linkLive: 'https://example.com/live1',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '347483',
        data: '27/10/2024',
        horario: '10:45',
        cartelaPreco: 'R$ 15,00',
        linkLive: 'https://example.com/live3',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '548465',
        data: '29/10/2024',
        horario: '17:10',
        cartelaPreco: 'R$ 20,00',
        linkLive: 'https://example.com/live5',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '778517',
        data: '01/11/2024',
        horario: '19:30',
        cartelaPreco: 'R$ 25,00',
        linkLive: 'https://example.com/live7',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '989429',
        data: '03/11/2024',
        horario: '21:00',
        cartelaPreco: 'R$ 30,00',
        linkLive: 'https://example.com/live9',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '119841',
        data: '05/11/2024',
        horario: '23:45',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live11',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '218452',
        data: '26/10/2024',
        horario: '07:30',
        cartelaPreco: 'R$ 12,00',
        linkLive: 'https://example.com/live2',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '455484',
        data: '28/10/2024',
        horario: '16:20',
        cartelaPreco: 'R$ 18,00',
        linkLive: 'https://example.com/live4',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '648496',
        data: '30/10/2024',
        horario: '18:00',
        cartelaPreco: 'R$ 22,00',
        linkLive: 'https://example.com/live6',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '813168',
        data: '02/11/2024',
        horario: '20:15',
        cartelaPreco: 'R$ 28,00',
        linkLive: 'https://example.com/live8',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '101910',
        data: '04/11/2024',
        horario: '22:30',
        cartelaPreco: 'R$ 32,00',
        linkLive: 'https://example.com/live10',
        gameType: '75bolas',
        salaData: sala75Data
    },
    {
        id: '128492',
        data: '06/11/2024',
        horario: '00:00',
        cartelaPreco: 'R$ 38,00',
        linkLive: 'https://example.com/live12',
        gameType: '75bolas',
        salaData: sala75Data
    },
    // Rodadas de Sala90
    {
        id: '218452',
        data: '26/10/2024',
        horario: '07:30',
        cartelaPreco: 'R$ 12,00',
        linkLive: 'https://example.com/live2',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '455484',
        data: '28/10/2024',
        horario: '16:20',
        cartelaPreco: 'R$ 18,00',
        linkLive: 'https://example.com/live4',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '648496',
        data: '30/10/2024',
        horario: '18:00',
        cartelaPreco: 'R$ 22,00',
        linkLive: 'https://example.com/live6',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '813168',
        data: '02/11/2024',
        horario: '20:15',
        cartelaPreco: 'R$ 28,00',
        linkLive: 'https://example.com/live8',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '101910',
        data: '04/11/2024',
        horario: '22:30',
        cartelaPreco: 'R$ 32,00',
        linkLive: 'https://example.com/live10',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '128492',
        data: '06/11/2024',
        horario: '00:00',
        cartelaPreco: 'R$ 38,00',
        linkLive: 'https://example.com/live12',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '778517',
        data: '01/11/2024',
        horario: '19:30',
        cartelaPreco: 'R$ 25,00',
        linkLive: 'https://example.com/live7',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '989429',
        data: '03/11/2024',
        horario: '21:00',
        cartelaPreco: 'R$ 30,00',
        linkLive: 'https://example.com/live9',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '119841',
        data: '05/11/2024',
        horario: '23:45',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live11',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '101911',
        data: '04/11/2024',
        horario: '23:30',
        cartelaPreco: 'R$ 33,00',
        linkLive: 'https://example.com/live13',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '101912',
        data: '05/11/2024',
        horario: '00:30',
        cartelaPreco: 'R$ 34,00',
        linkLive: 'https://example.com/live14',
        gameType: '90bolas',
        salaData: sala90Data
    },
    {
        id: '101913',
        data: '05/11/2024',
        horario: '01:30',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live15',
        gameType: '90bolas',
        salaData: sala90Data
    },
];
