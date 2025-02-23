// LiveChatFalso.ts

export interface Message {
    id: string;
    sender: string;
    avatar: string;
    content: string;
    type: 'text' | 'audio';
    date: string;
  }
  
  export const mensagensExemplo: Message[] = [
    { id: 'm1', sender: 'Maria', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Olá a todos!', date: '01/10/2024' },
    { id: 'm2', sender: 'João', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Oi, Maria!', date: '01/10/2024' },
    { id: 'm3', sender: 'Ana', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Bom dia!', date: '01/10/2024' },
    { id: 'm4', sender: 'Carlos', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Como estão?', date: '01/10/2024' },
    { id: 'm5', sender: 'Luiza', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Tudo bem por aqui!', date: '01/10/2024' },
    { id: 'm6', sender: 'Pedro', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Que ótimo!', date: '01/10/2024' },
    { id: 'm7', sender: 'Fernanda', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Alguém viu as novidades?', date: '01/10/2024' },
    { id: 'm8', sender: 'Bingo online', avatar: '/assets/images/Bingo.png', type: 'text', content: 'Recebam a melhor abertura de todos os tempos!', date: '01/10/2024' },
    { id: 'm9', sender: 'Bingo online', avatar: '/assets/images/Bingo.png', type: 'audio', content: '/audio/audio1.mp3', date: '01/10/2024' },
    { id: 'm10', sender: 'Julia', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Adorei o áudio!', date: '01/10/2024' },
    { id: 'm11', sender: 'Marcos', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Também gostei!', date: '01/10/2024' },
    { id: 'm12', sender: 'Marcos', avatar: '/assets/images/FaceDev.jpg', type: 'text', content: 'Porém penso que ela poderia ser maior, com cerca de 2 à 3 minutos de duração, isso criaria um clima mais noir!', date: '01/10/2024' },
  ];
  
  export interface User {
    id: string;
    nome: string;
    apelido: string;
    telefone: string;
    foto: string;
    estado: string;
  }
  
  export const usuariosExemplo: User[] = [
    { id: '1', nome: 'Maria', apelido: 'Mari', telefone: '(11) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'SP' },
    { id: '2', nome: 'João', apelido: 'Jo', telefone: '(21) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'RJ' },
    { id: '3', nome: 'Ana', apelido: 'Aninha', telefone: '(31) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'MG' },
    { id: '4', nome: 'Carlos', apelido: 'Carlão', telefone: '(41) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'PR' },
    { id: '5', nome: 'Luiza', apelido: 'Lu', telefone: '(51) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'RS' },
    { id: '6', nome: 'Pedro', apelido: 'Pe', telefone: '(61) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'DF' },
    { id: '7', nome: 'Fernanda', apelido: 'Fe', telefone: '(71) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'BA' },
    { id: '8', nome: 'Bingo online', apelido: 'Binginho', telefone: '(11) 98765-4321', foto: '/assets/images/Bingo.png', estado: 'SP' },
    { id: '9', nome: 'Julia', apelido: 'Ju', telefone: '(91) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'PA' },
    { id: '10', nome: 'Marcos', apelido: 'Marcão', telefone: '(92) 98765-4321', foto: '/assets/images/FaceDev.jpg', estado: 'AM' },
  ];
  