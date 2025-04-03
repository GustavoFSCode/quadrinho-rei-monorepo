import React, { useState } from 'react';
import {
  Container,
  Card,
  AddressInfo,
  CheckboxContainer,
  Title,
  Text,
  CustomCheckbox,
  CustomLabel
} from './styled';

interface Address {
  id: number;
  nameAddress: string;
  TypeAddress: string;
  typeLogradouro: string;
  nameLogradouro: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  country: string;
  observation?: string;
}

const EnderecoEntregaList: React.FC = () => {
  // Estado para armazenar o endereço selecionado (única escolha)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Mock de endereços de entrega
  const mockAddresses: Address[] = [
    {
      id: 1,
      nameAddress: 'Casa',
      TypeAddress: 'Entrega',
      typeLogradouro: 'Rua',
      nameLogradouro: 'das Flores',
      number: '123',
      neighborhood: 'Jardim Primavera',
      cep: '12345-678',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      observation: ''
    },
    {
      id: 2,
      nameAddress: 'Trabalho',
      TypeAddress: 'Entrega',
      typeLogradouro: 'Avenida',
      nameLogradouro: 'Brasil',
      number: '456',
      neighborhood: 'Centro',
      cep: '23456-789',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      observation: ''
    },
    {
      id: 3,
      nameAddress: 'Outro',
      TypeAddress: 'Entrega',
      typeLogradouro: 'Rua',
      nameLogradouro: 'dos Andradas',
      number: '789',
      neighborhood: 'Bairro Novo',
      cep: '34567-890',
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      observation: ''
    }
  ];

  const handleSelect = (id: number) => {
    setSelectedAddressId(id);
  };

  return (
    <Container>
      {mockAddresses.map((address) => (
        <Card key={address.id}>
          <AddressInfo>
            <Title>{address.nameAddress}</Title>
            <Text>
              {address.typeLogradouro} {address.nameLogradouro}, {address.number}
            </Text>
            <Text>
              {address.neighborhood} - {address.cep}
            </Text>
            <Text>
              {address.city} - {address.state}
            </Text>
            <Text>{address.country}</Text>
            {address.observation && <Text>Obs: {address.observation}</Text>}
            <Text>Preço do frete: R$20,00</Text>
          </AddressInfo>
          <CheckboxContainer>
            <CustomCheckbox
              checked={selectedAddressId === address.id}
              onChange={() => handleSelect(address.id)}
            />
            <CustomLabel>Selecionar</CustomLabel>
          </CheckboxContainer>
        </Card>
      ))}
    </Container>
  );
};

export default EnderecoEntregaList;
