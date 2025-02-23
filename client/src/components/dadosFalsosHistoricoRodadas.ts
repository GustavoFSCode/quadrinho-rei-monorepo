export interface DadosFalsos {
    id: string;
    data: string;
    horario: string;
    cartelaPreco?: string;
    linkLive?: string;
    gameType: string;
    nomeVencedor: string;
    tipoVitoria: string;
    acumulado: string;
    bolaDourada?: boolean;
    bolaDaVez?: number;
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
        data: '20/10/2024',
        horario: '10:30',
        cartelaPreco: 'R$ 10,00',
        linkLive: 'https://example.com/live1',
        gameType: '75bolas',
        nomeVencedor: 'Maria Bennes',
        tipoVitoria: 'Linha horizontal',
        acumulado: 'Quadra',
        bolaDourada: true,
        bolaDaVez: 42,
        salaData: sala75Data
    },
    {
        id: '347483',
        data: '21/10/2024',
        horario: '10:45',
        cartelaPreco: 'R$ 15,00',
        linkLive: 'https://example.com/live3',
        gameType: '75bolas',
        nomeVencedor: 'Nenhum',
        tipoVitoria: 'Nenhum',
        acumulado: 'Nenhum',
        bolaDourada: false,
        bolaDaVez: 7,
        salaData: sala75Data
    },
    {
        id: '548465',
        data: '20/10/2024',
        horario: '17:10',
        cartelaPreco: 'R$ 20,00',
        linkLive: 'https://example.com/live5',
        gameType: '75bolas',
        nomeVencedor: 'Lucas Lucco',
        tipoVitoria: 'Diagonal direita',
        acumulado: 'Bola da vez',
        bolaDourada: false,
        bolaDaVez: 68,
        salaData: sala75Data
    },
    {
        id: '778517',
        data: '01/10/2024',
        horario: '19:30',
        cartelaPreco: 'R$ 25,00',
        linkLive: 'https://example.com/live7',
        gameType: '75bolas',
        nomeVencedor: 'João Paulo',
        tipoVitoria: 'Rodada do X',
        acumulado: 'Quadra',
        bolaDourada: false,
        bolaDaVez: 15,
        salaData: sala75Data
    },
    {
        id: '989429',
        data: '03/10/2024',
        horario: '21:00',
        cartelaPreco: 'R$ 30,00',
        linkLive: 'https://example.com/live9',
        gameType: '75bolas',
        nomeVencedor: 'Nenhum',
        tipoVitoria: 'Nenhum',
        acumulado: 'Nenhum',
        bolaDourada: false,
        bolaDaVez: 33,
        salaData: sala75Data
    },
    {
        id: '119841',
        data: '05/10/2024',
        horario: '23:45',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live11',
        gameType: '75bolas',
        nomeVencedor: 'Ana Laura',
        tipoVitoria: 'Diagonal esquerda',
        acumulado: 'Bola da vez',
        bolaDourada: false,
        bolaDaVez: 57,
        salaData: sala75Data
    },
    {
        id: '218452',
        data: '20/10/2024',
        horario: '07:30',
        cartelaPreco: 'R$ 12,00',
        linkLive: 'https://example.com/live2',
        gameType: '75bolas',
        nomeVencedor: 'Paula Fernandes',
        tipoVitoria: 'Linha horizontal',
        acumulado: 'Quadra',
        bolaDourada: false,
        bolaDaVez: 21,
        salaData: sala75Data
    },
    {
        id: '455484',
        data: '20/10/2024',
        horario: '16:20',
        cartelaPreco: 'R$ 18,00',
        linkLive: 'https://example.com/live4',
        gameType: '75bolas',
        nomeVencedor: 'Felipe Molina',
        tipoVitoria: 'Rodada do X',
        acumulado: 'Nenhum',
        bolaDourada: false,
        bolaDaVez: 66,
        salaData: sala75Data
    },
    {
        id: '648496',
        data: '30/09/2024',
        horario: '18:00',
        cartelaPreco: 'R$ 22,00',
        linkLive: 'https://example.com/live6',
        gameType: '75bolas',
        nomeVencedor: 'Carlos Alberto Nobriga',
        tipoVitoria: 'Diagonal direita',
        acumulado: 'Bola da vez',
        bolaDourada: false,
        bolaDaVez: 12,
        salaData: sala75Data
    },
    {
        id: '813168',
        data: '02/10/2024',
        horario: '20:15',
        cartelaPreco: 'R$ 28,00',
        linkLive: 'https://example.com/live8',
        gameType: '75bolas',
        nomeVencedor: 'Mariana Alpha',
        tipoVitoria: 'Linha horizontal',
        acumulado: 'Quadra',
        bolaDourada: false,
        bolaDaVez: 75,
        salaData: sala75Data
    },
    {
        id: '101910',
        data: '04/10/2024',
        horario: '22:30',
        cartelaPreco: 'R$ 32,00',
        linkLive: 'https://example.com/live10',
        gameType: '75bolas',
        nomeVencedor: 'Nenhum',
        tipoVitoria: 'Nenhum',
        acumulado: 'Nenhum',
        bolaDourada: false,
        bolaDaVez: 9,
        salaData: sala75Data
    },
    {
        id: '128492',
        data: '06/10/2024',
        horario: '00:00',
        cartelaPreco: 'R$ 38,00',
        linkLive: 'https://example.com/live12',
        gameType: '75bolas',
        nomeVencedor: 'Julia Horseman',
        tipoVitoria: 'Diagonal esquerda',
        acumulado: 'Bola da vez',
        bolaDourada: false,
        bolaDaVez: 54,
        salaData: sala75Data
    },
    // Rodadas de Sala90 (sem alterações)
    {
        id: '218452',
        data: '26/09/2024',
        horario: '07:30',
        cartelaPreco: 'R$ 12,00',
        linkLive: 'https://example.com/live2',
        gameType: '90bolas',
        nomeVencedor: 'Pedro Damião, Maria Cariani',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '455484',
        data: '28/09/2024',
        horario: '16:20',
        cartelaPreco: 'R$ 18,00',
        linkLive: 'https://example.com/live4',
        gameType: '90bolas',
        nomeVencedor: 'Gustavo Ferreira, Gabriel Ferreira',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
    {
        id: '648496',
        data: '30/09/2024',
        horario: '18:00',
        cartelaPreco: 'R$ 22,00',
        linkLive: 'https://example.com/live6',
        gameType: '90bolas',
        nomeVencedor: 'Carlos Santos, Julia Silva',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '813168',
        data: '02/09/2024',
        horario: '20:15',
        cartelaPreco: 'R$ 28,00',
        linkLive: 'https://example.com/live8',
        gameType: '90bolas',
        nomeVencedor: 'Lucas Lucco, Ana Claudia',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
    {
        id: '101910',
        data: '04/09/2024',
        horario: '22:30',
        cartelaPreco: 'R$ 32,00',
        linkLive: 'https://example.com/live10',
        gameType: '90bolas',
        nomeVencedor: 'Carlos Santos, Julia Silva',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '128492',
        data: '06/09/2024',
        horario: '00:00',
        cartelaPreco: 'R$ 38,00',
        linkLive: 'https://example.com/live12',
        gameType: '90bolas',
        nomeVencedor: 'Paula Fernandes, Felipe Molina',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
    {
        id: '778517',
        data: '01/09/2024',
        horario: '19:30',
        cartelaPreco: 'R$ 25,00',
        linkLive: 'https://example.com/live7',
        gameType: '90bolas',
        nomeVencedor: 'João Gomes, Mariana Santos',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '989429',
        data: '03/09/2024',
        horario: '21:00',
        cartelaPreco: 'R$ 30,00',
        linkLive: 'https://example.com/live9',
        gameType: '90bolas',
        nomeVencedor: 'Carlos Santos, Julia Silva',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
    {
        id: '119841',
        data: '05/09/2024',
        horario: '23:45',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live11',
        gameType: '90bolas',
        nomeVencedor: 'Carlos Alberto, Julia Fortun',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '101911',
        data: '04/09/2024',
        horario: '23:30',
        cartelaPreco: 'R$ 33,00',
        linkLive: 'https://example.com/live13',
        gameType: '90bolas',
        nomeVencedor: 'Lucas ART, Ana Clara',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
    {
        id: '101912',
        data: '05/09/2024',
        horario: '00:30',
        cartelaPreco: 'R$ 34,00',
        linkLive: 'https://example.com/live14',
        gameType: '90bolas',
        nomeVencedor: 'João Caetano, Mariana Alpha',
        tipoVitoria: 'Linha',
        acumulado: 'Nenhum',
        salaData: sala90Data
    },
    {
        id: '101913',
        data: '05/09/2024',
        horario: '01:30',
        cartelaPreco: 'R$ 35,00',
        linkLive: 'https://example.com/live15',
        gameType: '90bolas',
        nomeVencedor: 'Carlos Santos, Julia Silva',
        tipoVitoria: 'Cartela cheia',
        acumulado: 'Cartela cheia',
        salaData: sala90Data
    },
];
