export interface Dados {
    id: string;
    name: string;
    last_message: string;
    time: string;
    date: string;
    avatar?: string;
  }

  export interface Message {
    id: string;
    sender: 'received' | 'sent';
    type: 'text' | 'audio';
    content: string;
  }

  export const dadosFalsos: Dados[] = [
    { id: '1', name: 'Gabriel Rodrigues', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '2', name: 'Gustavo Ferreira', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '3', name: 'Sam Winchester', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '4', name: 'Benjamin Tennyson', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '5', name: 'Bruce Wayne', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '6', name: 'Peter Parker', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '7', name: 'Dean Winchester', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
    { id: '8', name: 'Leon Kennedy', last_message: 'Lorem ipsum dolor sit amet consectetur adipiscing.', time: '19:19', date: '01/07/2024' },
  ];

  export const mensagensExemplo: Message[] = [
    { id: 'm1', sender: 'sent', type: 'text', content: 'Olá! Que quadrinho eu deveria comprar se gosto da DC Comics, de morcegos e quero ver uma origem de héroi?' },
    { id: 'm2', sender: 'received', type: 'text', content: 'Oi! Bem baseado nas suas sugestões eu recomendaria a compra de Batman Ano Um, um clássico que conta a historia do homem-morcego, escrita por Frank Miller e com os desenhos de David Mazzucchelli.' },
  ];
