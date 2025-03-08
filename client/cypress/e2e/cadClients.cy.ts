describe('Cadastro de Clientes - Marvel', () => {
  const marvelClients = [
    {
      name: 'Tony Stark',
      birthDate: '1970-05-29',
      gender: 'Masculino',
      cpf: '11111111111',
      phone: '(11) 91111-1111',
      typePhone: 'Celular',
      email: 'tony.stark@example.com',
      password: 'IronMan!123',
      ranking: '10',
      // Endereço Cobrança
      addressCob: 'Endereço Cobrança - Stark',
      logradouroCob: 'Rua', // opção do select (ex: Rua)
      nomeLogradouroCob: 'Stark Ave',
      numberCob: '100',
      neighborhoodCob: 'Bairro Stark',
      cepCob: '01001-000',
      // Endereço Entrega
      addressEntrega: 'Endereço Entrega - Stark',
      logradouroEntrega: 'Avenida', // opção do select (ex: Avenida)
      nomeLogradouroEntrega: 'Stark Blvd',
      numberEntrega: '200',
      neighborhoodEntrega: 'Bairro Stark',
      cepEntrega: '01002-000',
      // Dados fixos para ambos os endereços
      city: 'Nova York',
      state: 'NY',
      country: 'USA',
      observationCob: 'Casa de Tony',
      observationEntrega: 'Entrega rápida',
      // Dados do Cartão
      cardHolder: 'Tony Stark',
      cardNumber: '4111111111111111',
      cardSafe: '123'
    },
    {
      name: 'Steve Rogers',
      birthDate: '1918-07-04',
      gender: 'Masculino',
      cpf: '22222222222',
      phone: '(11) 92222-2222',
      typePhone: 'Celular',
      email: 'steve.rogers@example.com',
      password: 'CaptainAmerica!123',
      ranking: '9',
      addressCob: 'Endereço Cobrança - Rogers',
      logradouroCob: 'Rua',
      nomeLogradouroCob: 'Rogers St',
      numberCob: '101',
      neighborhoodCob: 'Brooklyn',
      cepCob: '01003-000',
      addressEntrega: 'Endereço Entrega - Rogers',
      logradouroEntrega: 'Avenida',
      nomeLogradouroEntrega: 'Rogers Ave',
      numberEntrega: '201',
      neighborhoodEntrega: 'Brooklyn',
      cepEntrega: '01004-000',
      city: 'Nova York',
      state: 'NY',
      country: 'USA',
      observationCob: 'Residência de Steve',
      observationEntrega: 'Entrega rápida',
      cardHolder: 'Steve Rogers',
      cardNumber: '4222222222222222',
      cardSafe: '456'
    },
    {
      name: 'Bruce Banner',
      birthDate: '1969-12-18',
      gender: 'Masculino',
      cpf: '33333333333',
      phone: '(11) 93333-3333',
      typePhone: 'Celular',
      email: 'bruce.banner@example.com',
      password: 'HulkSmash!123',
      ranking: '8',
      addressCob: 'Endereço Cobrança - Banner',
      logradouroCob: 'Rua',
      nomeLogradouroCob: 'Banner Rd',
      numberCob: '102',
      neighborhoodCob: 'Queens',
      cepCob: '01005-000',
      addressEntrega: 'Endereço Entrega - Banner',
      logradouroEntrega: 'Avenida',
      nomeLogradouroEntrega: 'Banner Ave',
      numberEntrega: '202',
      neighborhoodEntrega: 'Queens',
      cepEntrega: '01006-000',
      city: 'Nova York',
      state: 'NY',
      country: 'USA',
      observationCob: 'Casa do Bruce',
      observationEntrega: 'Entrega rápida',
      cardHolder: 'Bruce Banner',
      cardNumber: '4333333333333333',
      cardSafe: '789'
    },
    {
      name: 'Thor Odinson',
      birthDate: '1000-01-01',
      gender: 'Masculino',
      cpf: '44444444444',
      phone: '(11) 94444-4444',
      typePhone: 'Celular',
      email: 'thor.odinson@example.com',
      password: 'Mjolnir!123',
      ranking: '10',
      addressCob: 'Endereço Cobrança - Thor',
      logradouroCob: 'Rua',
      nomeLogradouroCob: 'Asgard St',
      numberCob: '103',
      neighborhoodCob: 'Asgard',
      cepCob: '01007-000',
      addressEntrega: 'Endereço Entrega - Thor',
      logradouroEntrega: 'Avenida',
      nomeLogradouroEntrega: 'Asgard Ave',
      numberEntrega: '203',
      neighborhoodEntrega: 'Asgard',
      cepEntrega: '01008-000',
      city: 'Asgard',
      state: 'AS',
      country: 'Marvel',
      observationCob: 'Palácio de Thor',
      observationEntrega: 'Entrega rápida',
      cardHolder: 'Thor Odinson',
      cardNumber: '4444444444444444',
      cardSafe: '321'
    },
    {
      name: 'Natasha Romanoff',
      birthDate: '1984-11-22',
      gender: 'Feminino',
      cpf: '55555555555',
      phone: '(11) 95555-5555',
      typePhone: 'Celular',
      email: 'natasha.romanoff@example.com',
      password: 'BlackWidow!123',
      ranking: '9',
      addressCob: 'Endereço Cobrança - Natasha',
      logradouroCob: 'Rua',
      nomeLogradouroCob: 'Romanoff St',
      numberCob: '104',
      neighborhoodCob: 'Moscow',
      cepCob: '01009-000',
      addressEntrega: 'Endereço Entrega - Natasha',
      logradouroEntrega: 'Avenida',
      nomeLogradouroEntrega: 'Romanoff Ave',
      numberEntrega: '204',
      neighborhoodEntrega: 'Moscow',
      cepEntrega: '01010-000',
      city: 'Moscow',
      state: 'MS',
      country: 'Russia',
      observationCob: 'Residência secreta',
      observationEntrega: 'Entrega rápida',
      cardHolder: 'Natasha Romanoff',
      cardNumber: '4555555555555555',
      cardSafe: '654'
    }
  ];

  marvelClients.forEach((client) => {
    it(`Deve cadastrar o cliente ${client.name}`, () => {
      // 1. Visita a página de clientes
      cy.visit('http://localhost:3000/clientes');

      // 2. Abre o modal de cadastro
      cy.contains('Cadastrar cliente').click();
      cy.contains('Cadastrar Cliente').should('be.visible'); // Aguarda o modal

      // 3. Preenche o formulário principal
      cy.get('#name').type(client.name);
      cy.get('#birthDate').type(client.birthDate);

      cy.get('#gender').click();
      cy.contains(client.gender).click();

      cy.get('#cpf').type(client.cpf);
      cy.get('#phone').type(client.phone);

      cy.get('#typePhone').click();
      cy.contains(client.typePhone).click();

      cy.get('#email').type(client.email);
      cy.get('#password').type(client.password);
      cy.get('#confirm_password').type(client.password);
      cy.get('#ranking').type(client.ranking);

      // 4. Preenche o primeiro endereço (index 0) - Cobrança
      cy.get('#Address\\[0\\]\\.nameAddress').type(client.addressCob);
      cy.get('#Address\\.0\\.typeLogradouro').click();
      cy.contains(client.logradouroCob).click();
      cy.get('#Address\\[0\\]\\.nameLogradouro').type(client.nomeLogradouroCob);
      cy.get('#Address\\[0\\]\\.number').type(client.numberCob);
      cy.get('#Address\\[0\\]\\.neighborhood').type(client.neighborhoodCob);
      cy.get('#Address\\[0\\]\\.cep').type(client.cepCob);
      cy.get('#Address\\[0\\]\\.city').type(client.city);
      cy.get('#Address\\[0\\]\\.state').type(client.state);
      cy.get('#Address\\[0\\]\\.country').type(client.country);
      cy.get('#Address\\[0\\]\\.observation').type(client.observationCob);

      // 5. Preenche o segundo endereço (index 1) - Entrega
      cy.get('#Address\\[1\\]\\.nameAddress').type(client.addressEntrega);
      cy.get('#Address\\.1\\.typeLogradouro').click();
      cy.contains(client.logradouroEntrega).click();
      cy.get('#Address\\[1\\]\\.nameLogradouro').type(client.nomeLogradouroEntrega);
      cy.get('#Address\\[1\\]\\.number').type(client.numberEntrega);
      cy.get('#Address\\[1\\]\\.neighborhood').type(client.neighborhoodEntrega);
      cy.get('#Address\\[1\\]\\.cep').type(client.cepEntrega);
      cy.get('#Address\\[1\\]\\.city').type(client.city);
      cy.get('#Address\\[1\\]\\.state').type(client.state);
      cy.get('#Address\\[1\\]\\.country').type(client.country);
      cy.get('#Address\\[1\\]\\.observation').type(client.observationEntrega);

      // 6. Preenche os dados do cartão (index 0)
      cy.get('#Cards\\[0\\]\\.holderName').type(client.cardHolder);
      cy.get('#Cards\\[0\\]\\.numberCard').type(client.cardNumber);
      cy.get('#Cards\\[0\\]\\.safeNumber').type(client.cardSafe);

      // 7. Submete o cadastro
      cy.get('button[name=buttonCad]').click();
      cy.contains('Cadastro efetuado com sucesso').should('be.visible');

      // 8. Volta para a tela de cadastro para o próximo cliente
      cy.contains('Voltar').click();
    });
  });
});
